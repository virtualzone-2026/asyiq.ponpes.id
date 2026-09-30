import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// CONFIG
// ============================================================================

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lsnco71s';

const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const SANITY_TOKEN =
  process.env.SANITY_API_WRITE_TOKEN || '';

const PAKASIR_WEBHOOK_SECRET =
  process.env.PAKASIR_WEBHOOK_SECRET || '';

// ============================================================================
// SANITY CLIENT
// ============================================================================

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: SANITY_TOKEN,
});

// ============================================================================
// TYPES
// ============================================================================

interface DonationTransaction {
  _id: string;
  _rev: string;

  txnId?: string;
  orderId?: string;

  donorName?: string;
  donorPhone?: string;

  amount?: number;

  status?: string;

  slug?: string;

  paymentMethod?: string;

  fundraiserPhone?: string;
}

interface ProgramDocument {
  _id: string;
  title?: string;
}

interface FundraiserDocument {
  _id: string;
  name?: string;
  phone?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function safeNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalizePhone(value: unknown): string {
  const raw = String(value || '')
    .replace(/[^0-9]/g, '');

  if (!raw) {
    return '';
  }

  if (raw.startsWith('0')) {
    return `62${raw.slice(1)}`;
  }

  if (raw.startsWith('62')) {
    return raw;
  }

  if (raw.startsWith('8')) {
    return `62${raw}`;
  }

  return raw;
}

function localPhone(value: unknown): string {
  const raw = String(value || '')
    .replace(/[^0-9]/g, '');

  if (!raw) {
    return '';
  }

  if (raw.startsWith('62')) {
    return `0${raw.slice(2)}`;
  }

  return raw;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

// ============================================================================
// GOOGLE SHEETS
// ============================================================================

async function appendToGoogleSheets(data: {
  orderId: string;
  txnId: string;
  name: string;
  phone: string;
  amount: number;
  program: string;
  date: string;
}) {
  try {
    const email =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    const privateKey =
      process.env.GOOGLE_PRIVATE_KEY
        ?.replace(/\\n/g, '\n');

    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID;

    if (
      !email ||
      !privateKey ||
      !spreadsheetId
    ) {
      console.warn(
        '⚠️ Google Sheets dilewati karena konfigurasi belum lengkap.'
      );

      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },

      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    const cleanPhone =
      normalizePhone(data.phone);

    const whatsappFormula =
      cleanPhone
        ? `=HYPERLINK("https://wa.me/${cleanPhone}"; "${data.phone}")`
        : '-';

    await sheets.spreadsheets.values.append({
      spreadsheetId,

      range: 'Sheet1!A:G',

      valueInputOption: 'USER_ENTERED',

      requestBody: {
        values: [
          [
            data.date,
            data.orderId,
            data.txnId,
            data.name,
            whatsappFormula,
            data.amount,
            data.program,
          ],
        ],
      },
    });

    console.log(
      `📊 GOOGLE SHEET SUKSES: ${data.orderId}`
    );
  } catch (error) {
    // Jangan menggagalkan transaksi utama
    console.error(
      '🔥 GOOGLE SHEETS ERROR:',
      error
    );
  }
}

// ============================================================================
// WHATSAPP FONNTE
// ============================================================================

async function sendWhatsappReceipt(data: {
  phone: string;
  donorName: string;
  orderId: string;
  programName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  time: string;
}) {
  try {
    const token =
      process.env.FONNTE_TOKEN;

    if (!token) {
      console.warn(
        '⚠️ FONNTE_TOKEN belum tersedia.'
      );

      return;
    }

    const phone =
      normalizePhone(data.phone);

    if (!phone) {
      return;
    }

    const message = `*DONASI BERHASIL DITERIMA* 🎉

Jazakumullah khairan, Kak *${data.donorName}*. Donasi Anda telah berhasil kami verifikasi.

📝 *No. Invoice:* ${data.orderId}
📌 *Program:* ${data.programName}
💰 *Nominal:* Rp ${formatRupiah(data.amount)}
💳 *Metode:* ${data.paymentMethod}
⏰ *Tanggal:* ${data.date} - ${data.time} WIB

Semoga Allah menerima amal kebaikan ini, melapangkan rezeki, dan memberikan keberkahan untuk Anda beserta keluarga. Aamiin.

----------------------------
*Asyiqul Quran*
_Amanah dalam menyalurkan kebaikan_`;

    const response =
      await fetch(
        'https://api.fonnte.com/send',
        {
          method: 'POST',

          headers: {
            Authorization: token,
          },

          body: new URLSearchParams({
            target: phone,
            message,
          }),

          cache: 'no-store',
        }
      );

    if (!response.ok) {
      const responseText =
        await response.text();

      console.error(
        '🔥 FONNTE RESPONSE ERROR:',
        response.status,
        responseText
      );

      return;
    }

    console.log(
      `📲 WHATSAPP BERHASIL: ${data.orderId}`
    );
  } catch (error) {
    console.error(
      '🔥 FONNTE ERROR:',
      error
    );
  }
}

// ============================================================================
// WEBHOOK PAKASIR V2
// ============================================================================

export async function POST(
  request: Request
) {
  try {
    // ========================================================================
    // 1. CEK ENV
    // ========================================================================

    if (!SANITY_TOKEN) {
      console.error(
        '❌ SANITY_API_WRITE_TOKEN belum dikonfigurasi.'
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Konfigurasi Sanity belum lengkap.',
        },
        {
          status: 500,
        }
      );
    }

    if (!PAKASIR_WEBHOOK_SECRET) {
      console.error(
        '❌ PAKASIR_WEBHOOK_SECRET belum dikonfigurasi.'
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Konfigurasi webhook belum lengkap.',
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================================
    // 2. VERIFIKASI X-SECRET
    // ========================================================================

    const incomingSecret =
      request.headers.get('x-secret') || '';

    if (
      !incomingSecret ||
      incomingSecret !==
        PAKASIR_WEBHOOK_SECRET
    ) {
      console.error(
        '❌ WEBHOOK DITOLAK: X-Secret tidak cocok.'
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Unauthorized webhook.',
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================================
    // 3. BACA PAYLOAD
    // ========================================================================

    const payload =
      await request.json();

    const txnId =
      String(
        payload?.txn_id || ''
      ).trim();

    const orderId =
      String(
        payload?.order_id || ''
      ).trim();

    const amount =
      safeNumber(
        payload?.amount
      );

    const status =
      String(
        payload?.status || ''
      )
        .toLowerCase()
        .trim();

    const completedAt =
      String(
        payload?.completed_at || ''
      ).trim();

    const isSandbox =
      Boolean(
        payload?.is_sandbox
      );

    console.log(
      '📥 PAKASIR V2 WEBHOOK:',
      {
        txnId,
        orderId,
        amount,
        status,
        isSandbox,
      }
    );

    // ========================================================================
    // 4. VALIDASI PAYLOAD
    // ========================================================================

    if (!txnId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'txn_id tidak ditemukan.',
        },
        {
          status: 400,
        }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'order_id tidak ditemukan.',
        },
        {
          status: 400,
        }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nominal transaksi tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================================
    // 5. HANYA COMPLETED
    // ========================================================================

    if (
      status !== 'completed'
    ) {
      console.warn(
        `⚠️ Status webhook diabaikan: ${status}`
      );

      return NextResponse.json({
        success: true,
        message:
          `Status ${status || '-'} diabaikan.`,
      });
    }

    // ========================================================================
    // 6. CARI TRANSAKSI SANITY
    // ========================================================================

    const transaction =
      await client.fetch<
        DonationTransaction | null
      >(
        `
        *[
          _type == "donationTransaction"
          &&
          (
            txnId == $txnId
            ||
            orderId == $orderId
          )
        ][0]{
          _id,
          _rev,
          txnId,
          orderId,
          donorName,
          donorPhone,
          amount,
          status,
          slug,
          paymentMethod,
          fundraiserPhone
        }
        `,
        {
          txnId,
          orderId,
        }
      );

    if (!transaction) {
      console.error(
        `❌ TRANSAKSI TIDAK DITEMUKAN: ${orderId}`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Transaksi tidak ditemukan.',
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================================
    // 7. VALIDASI txn_id
    // ========================================================================

    if (
      transaction.txnId &&
      transaction.txnId !== txnId
    ) {
      console.error(
        '❌ TXN ID TIDAK COCOK:',
        {
          webhook: txnId,
          sanity: transaction.txnId,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Txn ID tidak cocok.',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================================
    // 8. VALIDASI ORDER ID
    // ========================================================================

    if (
      transaction.orderId !==
      orderId
    ) {
      console.error(
        '❌ ORDER ID TIDAK COCOK:',
        {
          webhook: orderId,
          sanity:
            transaction.orderId,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Order ID tidak cocok.',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================================
    // 9. VALIDASI NOMINAL
    // ========================================================================

    const localAmount =
      safeNumber(
        transaction.amount
      );

    if (
      localAmount !==
      amount
    ) {
      console.error(
        '❌ NOMINAL TIDAK COCOK:',
        {
          webhookAmount:
            amount,

          localAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Nominal transaksi tidak cocok.',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================================
    // 10. IDEMPOTENCY
    // ========================================================================

    if (
      transaction.status ===
      'success' ||
      transaction.status ===
      'completed'
    ) {
      console.log(
        `ℹ️ TRANSAKSI SUDAH DIPROSES: ${orderId}`
      );

      return NextResponse.json({
        success: true,
        message:
          'Transaksi sudah diproses sebelumnya.',
      });
    }

    // ========================================================================
    // 11. DATA DONATUR
    // ========================================================================

    const donorName =
      String(
        transaction.donorName ||
          'Hamba Allah'
      ).trim();

    const donorPhone =
      String(
        transaction.donorPhone ||
          ''
      ).trim();

    const programSlug =
      String(
        transaction.slug ||
          ''
      )
        .toLowerCase()
        .trim();

    const paymentMethod =
      String(
        transaction.paymentMethod ||
          'QRIS'
      )
        .toUpperCase()
        .trim();

    if (!programSlug) {
      throw new Error(
        'Slug program tidak ditemukan pada transaksi.'
      );
    }

    // ========================================================================
    // 12. CARI PROGRAM
    // ========================================================================

    const program =
      await client.fetch<
        ProgramDocument | null
      >(
        `
        *[
          _type == "program"
          &&
          slug.current == $slug
        ][0]{
          _id,
          title
        }
        `,
        {
          slug:
            programSlug,
        }
      );

    if (!program) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Program ${programSlug} tidak ditemukan.`,
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================================
    // 13. WAKTU
    // ========================================================================

    const now =
      completedAt
        ? new Date(completedAt)
        : new Date();

    const currentDate =
      now.toLocaleDateString(
        'id-ID',
        {
          timeZone:
            'Asia/Jakarta',

          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        }
      );

    const currentTime =
      now.toLocaleTimeString(
        'id-ID',
        {
          timeZone:
            'Asia/Jakarta',

          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            false,
        }
      );

    // ========================================================================
    // 14. FUNDRAISER
    // ========================================================================

    let fundraiser:
      FundraiserDocument | null =
      null;

    const fundraiserPhone =
      String(
        transaction.fundraiserPhone ||
          ''
      ).trim();

    if (fundraiserPhone) {
      const internationalPhone =
        normalizePhone(
          fundraiserPhone
        );

      const localNumber =
        localPhone(
          fundraiserPhone
        );

      fundraiser =
        await client.fetch<
          FundraiserDocument | null
        >(
          `
          *[
            _type == "fundraiser"
            &&
            (
              phone == $raw
              ||
              phone == $international
              ||
              phone == $local
            )
          ][0]{
            _id,
            name,
            phone
          }
          `,
          {
            raw:
              fundraiserPhone,

            international:
              internationalPhone,

            local:
              localNumber,
          }
        );
    }

    // ========================================================================
    // 15. SANITY ATOMIC TRANSACTION
    // ========================================================================

    const donorKey =
      `donor-${orderId}`
        .replace(
          /[^a-zA-Z0-9_-]/g,
          '-'
        )
        .slice(
          0,
          100
        );

    let sanityTransaction =
      client.transaction();

    // ------------------------------------------------------------------------
    // Update transaksi pembayaran
    // ------------------------------------------------------------------------

    sanityTransaction =
      sanityTransaction.patch(
        transaction._id,
        (patch) =>
          patch
            .ifRevisionId(
              transaction._rev
            )
            .set({
              txnId,
              status:
                'success',

              gatewayStatus:
                'completed',

              completedAt:
                completedAt ||
                new Date().toISOString(),

              paidAt:
                completedAt ||
                new Date().toISOString(),

              isSandbox,
            })
      );

    // ------------------------------------------------------------------------
    // Update nominal program + donor
    // ------------------------------------------------------------------------

    sanityTransaction =
      sanityTransaction.patch(
        program._id,
        (patch) =>
          patch
            .setIfMissing({
              collectedRaw: 0,
              donors: [],
            })

            .inc({
              collectedRaw:
                amount,
            })

            .append(
              'donors',
              [
                {
                  _key:
                    donorKey,

                  _type:
                    'donor',

                  orderId,

                  txnId,

                  name:
                    donorName,

                  amount,

                  date:
                    currentDate,

                  paymentMethod,
                },
              ]
            )
      );

    // ------------------------------------------------------------------------
    // Fundraiser / ujrah
    // ------------------------------------------------------------------------

    if (fundraiser) {
      const ujrah =
        Math.round(
          amount * 0.1
        );

      sanityTransaction =
        sanityTransaction.patch(
          fundraiser._id,
          (patch) =>
            patch
              .setIfMissing({
                totalDanaDihimpun:
                  0,

                sisaSaldoFee:
                  0,

                totalTransaksiSukses:
                  0,
              })

              .inc({
                totalDanaDihimpun:
                  amount,

                sisaSaldoFee:
                  ujrah,

                totalTransaksiSukses:
                  1,
              })
        );

      console.log(
        `💸 UJRAH Rp ${formatRupiah(ujrah)} → ${fundraiser.name || fundraiser.phone}`
      );
    }

    // ========================================================================
    // 16. COMMIT
    // ========================================================================

    try {
      await sanityTransaction.commit({
        visibility: 'sync',
      });
    } catch (commitError) {
      console.error(
        '🔥 SANITY TRANSACTION ERROR:',
        commitError
      );

      // ======================================================================
      // Cek apakah webhook lain sudah menyelesaikannya
      // ======================================================================

      const refreshed =
        await client.fetch<{
          status?: string;
        } | null>(
          `
          *[
            _type == "donationTransaction"
            &&
            _id == $id
          ][0]{
            status
          }
          `,
          {
            id:
              transaction._id,
          }
        );

      if (
        refreshed?.status ===
          'success'
      ) {
        return NextResponse.json({
          success: true,
          message:
            'Transaksi sudah diproses oleh webhook lain.',
        });
      }

      throw commitError;
    }

    console.log(
      `✅ PAKASIR V2 COMPLETED: ${orderId}`
    );

    // ========================================================================
    // 17. GOOGLE SHEET
    // ========================================================================

    await appendToGoogleSheets({
      date:
        `${currentDate} ${currentTime}`,

      orderId,

      txnId,

      name:
        donorName,

      phone:
        donorPhone,

      amount,

      program:
        program.title ||
        programSlug,
    });

    // ========================================================================
    // 18. WHATSAPP
    // ========================================================================

    if (donorPhone) {
      await sendWhatsappReceipt({
        phone:
          donorPhone,

        donorName,

        orderId,

        programName:
          program.title ||
          programSlug,

        amount,

        paymentMethod,

        date:
          currentDate,

        time:
          currentTime,
      });
    }

    // ========================================================================
    // 19. RESPONSE WAJIB 200
    // ========================================================================

    return NextResponse.json(
      {
        success: true,

        message:
          'Webhook Pakasir berhasil diproses.',

        data: {
          txnId,
          orderId,
          amount,
          status:
            'completed',
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      '🔥 CRITICAL PAKASIR WEBHOOK ERROR:',
      {
        message:
          error?.message,

        statusCode:
          error?.statusCode,

        responseBody:
          error?.response?.body,
      }
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          'Terjadi kesalahan ketika memproses webhook.',
      },
      {
        status: 500,
      }
    );
  }
}