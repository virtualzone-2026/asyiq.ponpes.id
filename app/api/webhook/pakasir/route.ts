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

const PAKASIR_API_KEY =
  process.env.PAKASIR_API_KEY || '';

const PAKASIR_WEBHOOK_SECRET =
  process.env.PAKASIR_WEBHOOK_SECRET || '';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.asyiq.ponpes.id';

const PAKASIR_PROJECT =
  'pondok-pesantren-aasyiqul-quran';

// ============================================================================
// SANITY
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
  gatewayStatus?: string;

  slug?: string;

  paymentMethod?: string;

  fundraiserPhone?: string;

  isSandbox?: boolean;
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

interface PakasirStatusResponse {
  txn_id?: string;
  project?: string;
  order_id?: string;
  amount?: number;
  fee?: number;
  total_payment?: number;
  payment_method?: string;
  status?: string;
  completed_at?: string;
  is_sandbox?: boolean;

  message?: string;
  error?: string;
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

    const auth =
      new google.auth.GoogleAuth({
        credentials: {
          client_email: email,
          private_key: privateKey,
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });

    const sheets =
      google.sheets({
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
      console.error(
        '🔥 FONNTE RESPONSE ERROR:',
        response.status,
        await response.text()
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
// CARI TRANSAKSI
// ============================================================================

async function findTransaction(
  txnId: string,
  orderId: string
) {
  return client.fetch<DonationTransaction | null>(
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
      gatewayStatus,
      slug,
      paymentMethod,
      fundraiserPhone,
      isSandbox
    }
    `,
    {
      txnId,
      orderId,
    }
  );
}

// ============================================================================
// CARI PROGRAM
// ============================================================================

async function findProgram(
  slug: string
) {
  return client.fetch<ProgramDocument | null>(
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
      slug,
    }
  );
}

// ============================================================================
// CARI FUNDRAISER
// ============================================================================

async function findFundraiser(
  phone: string
) {
  if (!phone) {
    return null;
  }

  const international =
    normalizePhone(phone);

  const local =
    localPhone(phone);

  return client.fetch<FundraiserDocument | null>(
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
      raw: phone,
      international,
      local,
    }
  );
}

// ============================================================================
// PROSES TRANSAKSI BERHASIL
// ============================================================================

async function processSuccessfulPayment(data: {
  txnId: string;
  orderId: string;
  amount: number;
  completedAt?: string;
  isSandbox?: boolean;
}) {
  const {
    txnId,
    orderId,
    amount,
    completedAt,
    isSandbox = false,
  } = data;

  // --------------------------------------------------------------------------
  // AMBIL TRANSAKSI TERBARU
  // --------------------------------------------------------------------------

  let transaction =
    await findTransaction(
      txnId,
      orderId
    );

  if (!transaction) {
    throw new Error(
      `Transaksi tidak ditemukan: ${orderId}`
    );
  }

  // --------------------------------------------------------------------------
  // VALIDASI
  // --------------------------------------------------------------------------

  if (
    transaction.txnId &&
    transaction.txnId !== txnId
  ) {
    throw new Error(
      `Txn ID tidak cocok. Sanity=${transaction.txnId}, Pakasir=${txnId}`
    );
  }

  if (
    transaction.orderId !== orderId
  ) {
    throw new Error(
      `Order ID tidak cocok. Sanity=${transaction.orderId}, Pakasir=${orderId}`
    );
  }

  const localAmount =
    safeNumber(transaction.amount);

  if (
    localAmount !== amount
  ) {
    throw new Error(
      `Nominal tidak cocok. Sanity=${localAmount}, Pakasir=${amount}`
    );
  }

  // --------------------------------------------------------------------------
  // IDEMPOTENCY
  // --------------------------------------------------------------------------

  if (
    transaction.status === 'success' ||
    transaction.gatewayStatus === 'completed'
  ) {
    console.log(
      `ℹ️ TRANSAKSI SUDAH SUCCESS: ${orderId}`
    );

    return {
      alreadyProcessed: true,
      transaction,
    };
  }

  // --------------------------------------------------------------------------
  // DATA TRANSAKSI
  // --------------------------------------------------------------------------

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
      'Slug program tidak ditemukan.'
    );
  }

  const program =
    await findProgram(
      programSlug
    );

  if (!program) {
    throw new Error(
      `Program tidak ditemukan: ${programSlug}`
    );
  }

  const fundraiserPhone =
    String(
      transaction.fundraiserPhone ||
      ''
    ).trim();

  const fundraiser =
    await findFundraiser(
      fundraiserPhone
    );

  // --------------------------------------------------------------------------
  // WAKTU
  // --------------------------------------------------------------------------

  const finalDate =
    completedAt
      ? new Date(completedAt)
      : new Date();

  const currentDate =
    finalDate.toLocaleDateString(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );

  const currentTime =
    finalDate.toLocaleTimeString(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }
    );

  const completedIso =
    completedAt ||
    new Date().toISOString();

  // --------------------------------------------------------------------------
  // DONOR KEY
  // --------------------------------------------------------------------------

  const donorKey =
    `donor-${orderId}`
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      )
      .slice(0, 100);

  // --------------------------------------------------------------------------
  // FUNGSI COMMIT
  // --------------------------------------------------------------------------

  async function commitPayment(
    currentTransaction: DonationTransaction
  ) {
    let tx =
      client.transaction();

    // ------------------------------------------------------
    // UPDATE TRANSAKSI
    // ------------------------------------------------------

    tx =
      tx.patch(
        currentTransaction._id,
        (patch) =>
          patch
            .ifRevisionId(
              currentTransaction._rev
            )
            .set({
              txnId,

              status:
                'success',

              gatewayStatus:
                'completed',

              completedAt:
                completedIso,

              paidAt:
                completedIso,

              isSandbox,
            })
      );

    // ------------------------------------------------------
    // UPDATE PROGRAM
    // ------------------------------------------------------

    tx =
      tx.patch(
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

    // ------------------------------------------------------
    // FUNDRAISER 10%
    // ------------------------------------------------------

    if (fundraiser) {
      const ujrah =
        Math.round(
          amount * 0.1
        );

      tx =
        tx.patch(
          fundraiser._id,
          (patch) =>
            patch
              .setIfMissing({
                totalDanaDihimpun: 0,
                sisaSaldoFee: 0,
                totalTransaksiSukses: 0,
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
        `💸 UJRAH Rp ${formatRupiah(ujrah)} → ${
          fundraiser.name ||
          fundraiser.phone
        }`
      );
    }

    return tx.commit({
      visibility: 'sync',
    });
  }

  // --------------------------------------------------------------------------
  // COMMIT PERTAMA
  // --------------------------------------------------------------------------

  try {
    await commitPayment(
      transaction
    );

    console.log(
      `✅ PEMBAYARAN BERHASIL: ${orderId}`
    );

  } catch (firstError: any) {

    console.error(
      '⚠️ COMMIT PERTAMA GAGAL:',
      firstError?.message ||
      firstError
    );

    // ------------------------------------------------------------------------
    // AMBIL REVISION TERBARU
    // ------------------------------------------------------------------------

    const refreshed =
      await findTransaction(
        txnId,
        orderId
      );

    if (!refreshed) {
      throw new Error(
        'Transaksi hilang ketika retry commit.'
      );
    }

    // ------------------------------------------------------------------------
    // Kalau webhook lain sudah berhasil
    // ------------------------------------------------------------------------

    if (
      refreshed.status ===
        'success' ||
      refreshed.gatewayStatus ===
        'completed'
    ) {
      console.log(
        `✅ TRANSAKSI SUDAH DIPROSES WEBHOOK LAIN: ${orderId}`
      );

      return {
        alreadyProcessed: true,
        transaction: refreshed,
      };
    }

    // ------------------------------------------------------------------------
    // RETRY DENGAN REVISION TERBARU
    // ------------------------------------------------------------------------

    console.log(
      `🔄 RETRY COMMIT SANITY: ${orderId}`
    );

    await commitPayment(
      refreshed
    );

    console.log(
      `✅ RETRY COMMIT BERHASIL: ${orderId}`
    );
  }

  // --------------------------------------------------------------------------
  // GOOGLE SHEETS
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // WHATSAPP
  // --------------------------------------------------------------------------

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

  return {
    alreadyProcessed: false,
    success: true,
  };
}

// ============================================================================
// POST = WEBHOOK PAKASIR
// ============================================================================

export async function POST(
  request: Request
) {
  try {
    // ------------------------------------------------------------------------
    // ENV
    // ------------------------------------------------------------------------

    if (!SANITY_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message:
            'SANITY_API_WRITE_TOKEN belum dikonfigurasi.',
        },
        {
          status: 500,
        }
      );
    }

    if (!PAKASIR_WEBHOOK_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message:
            'PAKASIR_WEBHOOK_SECRET belum dikonfigurasi.',
        },
        {
          status: 500,
        }
      );
    }

    // ------------------------------------------------------------------------
    // SECRET
    // ------------------------------------------------------------------------

    const incomingSecret =
      request.headers.get(
        'x-secret'
      ) || '';

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

    // ------------------------------------------------------------------------
    // PAYLOAD
    // ------------------------------------------------------------------------

    const payload =
      await request.json();

    const txnId =
      String(
        payload?.txn_id ||
        ''
      ).trim();

    const orderId =
      String(
        payload?.order_id ||
        ''
      ).trim();

    const amount =
      safeNumber(
        payload?.amount
      );

    const status =
      String(
        payload?.status ||
        ''
      )
        .toLowerCase()
        .trim();

    const completedAt =
      String(
        payload?.completed_at ||
        ''
      ).trim();

    const isSandbox =
      Boolean(
        payload?.is_sandbox
      );

    console.log(
      '📥 PAKASIR WEBHOOK:',
      {
        txnId,
        orderId,
        amount,
        status,
        isSandbox,
      }
    );

    // ------------------------------------------------------------------------
    // VALIDASI
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
    // HANYA COMPLETED
    // ------------------------------------------------------------------------

    if (
      status !==
      'completed'
    ) {
      console.warn(
        `⚠️ Status ${status} diabaikan.`
      );

      return NextResponse.json(
        {
          success: true,
          message:
            `Status ${status || '-'} diabaikan.`,
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------------------------------------
    // PROSES
    // ------------------------------------------------------------------------

    const result =
      await processSuccessfulPayment({
        txnId,
        orderId,
        amount,
        completedAt,
        isSandbox,
      });

    return NextResponse.json(
      {
        success: true,

        message:
          result.alreadyProcessed
            ? 'Transaksi sudah diproses sebelumnya.'
            : 'Webhook Pakasir berhasil diproses.',

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

        stack:
          error?.stack,

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

// ============================================================================
// GET = CEK STATUS PAKASIR V2 + SINKRONISASI
//
// Contoh:
// /api/pakasir/webhook?order_id=INV-ASYIQ-xxxx
//
// atau:
// /api/pakasir/webhook?txn_id=xxxx
//
// Wajib header:
// x-sync-secret: PAKASIR_WEBHOOK_SECRET
// ============================================================================

export async function GET(
  request: Request
) {
  try {

    // ------------------------------------------------------------------------
    // SECURITY
    // ------------------------------------------------------------------------

    const syncSecret =
      request.headers.get(
        'x-sync-secret'
      ) || '';

    if (
      !syncSecret ||
      syncSecret !==
        PAKASIR_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Unauthorized.',
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------------------------------------
    // QUERY
    // ------------------------------------------------------------------------

    const url =
      new URL(
        request.url
      );

    const requestedTxnId =
      String(
        url.searchParams.get(
          'txn_id'
        ) || ''
      ).trim();

    const requestedOrderId =
      String(
        url.searchParams.get(
          'order_id'
        ) || ''
      ).trim();

    if (
      !requestedTxnId &&
      !requestedOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Masukkan txn_id atau order_id.',
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // CARI TRANSAKSI SANITY
    // ------------------------------------------------------------------------

    const transaction =
      await findTransaction(
        requestedTxnId,
        requestedOrderId
      );

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Transaksi tidak ditemukan di Sanity.',
        },
        {
          status: 404,
        }
      );
    }

    const txnId =
      String(
        transaction.txnId ||
        requestedTxnId ||
        ''
      ).trim();

    const orderId =
      String(
        transaction.orderId ||
        requestedOrderId ||
        ''
      ).trim();

    if (!txnId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'txnId transaksi tidak tersedia.',
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // CEK STATUS PAKASIR
    // ------------------------------------------------------------------------

    if (!PAKASIR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            'PAKASIR_API_KEY belum dikonfigurasi.',
        },
        {
          status: 500,
        }
      );
    }

    const pakasirUrl =
      `https://app.pakasir.com/api/v2/transaction-status/` +
      `${encodeURIComponent(PAKASIR_PROJECT)}/` +
      `${encodeURIComponent(txnId)}`;

    const response =
      await fetch(
        pakasirUrl,
        {
          method: 'GET',

          headers: {
            'X-Api-Key':
              PAKASIR_API_KEY,

            Accept:
              'application/json',
          },

          cache:
            'no-store',
        }
      );

    const data =
      await response
        .json()
        .catch(() => null);

    console.log(
      '🔎 PAKASIR STATUS:',
      {
        txnId,
        orderId,
        httpStatus:
          response.status,
        data,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          message:
            data?.message ||
            data?.error ||
            `Pakasir HTTP ${response.status}`,

          pakasir:
            data,
        },
        {
          status:
            response.status,
        }
      );
    }

    const gatewayStatus =
      String(
        data?.status ||
        ''
      )
        .toLowerCase()
        .trim();

    // ------------------------------------------------------------------------
    // BELUM LUNAS
    // ------------------------------------------------------------------------

    if (
      gatewayStatus !==
      'completed'
    ) {
      return NextResponse.json(
        {
          success: true,

          synchronized:
            false,

          message:
            `Status Pakasir masih ${gatewayStatus || 'unknown'}.`,

          data: {
            txnId,
            orderId,
            sanityStatus:
              transaction.status ||
              'pending',

            pakasirStatus:
              gatewayStatus,
          },
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------------------------------------
    // VALIDASI NOMINAL
    // ------------------------------------------------------------------------

    const pakasirAmount =
      safeNumber(
        data?.amount
      );

    const sanityAmount =
      safeNumber(
        transaction.amount
      );

    if (
      pakasirAmount > 0 &&
      sanityAmount !==
        pakasirAmount
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            'Nominal Pakasir dan Sanity tidak cocok.',

          data: {
            txnId,
            orderId,
            sanityAmount,
            pakasirAmount,
          },
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------------------------------
    // SINKRONISASI
    // ------------------------------------------------------------------------

    const result =
      await processSuccessfulPayment({
        txnId,

        orderId,

        amount:
          pakasirAmount ||
          sanityAmount,

        completedAt:
          String(
            data?.completed_at ||
            ''
          ).trim(),

        isSandbox:
          Boolean(
            data?.is_sandbox
          ),
      });

    return NextResponse.json(
      {
        success: true,

        synchronized:
          true,

        alreadyProcessed:
          result.alreadyProcessed,

        message:
          result.alreadyProcessed
            ? 'Transaksi sudah success.'
            : 'Transaksi berhasil disinkronkan menjadi success.',

        data: {
          txnId,
          orderId,
          pakasirStatus:
            gatewayStatus,
          sanityStatus:
            'success',
        },
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {

    console.error(
      '🔥 PAKASIR STATUS ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          'Gagal mengecek status Pakasir.',
      },
      {
        status: 500,
      }
    );
  }
}