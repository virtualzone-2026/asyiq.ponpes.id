import { createClient } from '@sanity/client';
import { google } from 'googleapis';


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

const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG?.trim() || 'pondok-pesantren-aasyiqul-quran';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.asyiq.ponpes.id';

// ============================================================================
// SANITY CLIENT
// ============================================================================

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: SANITY_TOKEN,
  timeout: 15000, maxRetries: 0,
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
  fee?: number;
  totalAmount?: number;

  status?: string;
  gatewayStatus?: string;

  slug?: string;

  paymentMethod?: string;
  paymentNumber?: string;
  paymentUrl?: string;
  qrString?: string;
  vaNumber?: string;

  expiredAt?: string;

  isSandbox?: boolean;

  createdAt?: string;
  createdAtWib?: string;
  completedAt?: string;
  paidAt?: string;

  fundraiserPhone?: string;
  pakasirProject?: string;
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
// HELPER
// ============================================================================

function safeNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

// ============================================================================
// NORMALIZE NOMOR WHATSAPP
// ============================================================================

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

// ============================================================================
// FORMAT RUPIAH
// ============================================================================

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

    await sheets.spreadsheets.values.append({
      spreadsheetId,

      range:
        'Sheet1!A:G',

      valueInputOption:
        'RAW',

      requestBody: {
        values: [
          [
            data.date,
            data.orderId,
            data.txnId,
            data.name,
            cleanPhone ? `https://wa.me/${cleanPhone}` : '-',
            data.amount,
            data.program,
          ],
        ],
      },
    }, { timeout: 10000 });

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
// FONNTE WHATSAPP
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
      console.warn(
        `⚠️ Nomor WhatsApp kosong: ${data.orderId}`
      );

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

          body:
            new URLSearchParams({
              target: phone,
              message,
            }),

          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
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
// CARI TRANSAKSI DI SANITY
// ============================================================================

async function findTransaction(
  txnId: string,
  orderId: string
): Promise<DonationTransaction | null> {
  return client.fetch<DonationTransaction | null>(
    `
    *[
      _type == "donationTransaction"
      &&
      (
        ($txnId != "" && txnId == $txnId)
        ||
        ($orderId != "" && orderId == $orderId)
      )
    ][0]{
      _id,
      _rev,

      txnId,
      orderId,

      donorName,
      donorPhone,

      amount,
      fee,
      totalAmount,

      status,
      gatewayStatus,

      slug,

      paymentMethod,
      paymentNumber,
      paymentUrl,
      qrString,
      vaNumber,

      expiredAt,

      isSandbox,

      createdAt,
      createdAtWib,
      completedAt,
      paidAt,

      fundraiserPhone,
      pakasirProject
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
): Promise<ProgramDocument | null> {
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
): Promise<FundraiserDocument | null> {
  if (!phone) {
    return null;
  }

  const international =
    normalizePhone(phone);

  const local =
    international.startsWith('62')
      ? `0${international.slice(2)}`
      : phone;

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
// PROSES PEMBAYARAN BERHASIL
// ============================================================================

export async function processSuccessfulPayment(data: {
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

  // ==========================================================================
  // CARI TRANSAKSI
  // ==========================================================================

  let transaction =
    await findTransaction(
      txnId,
      orderId
    );

  if (!transaction) {
    throw new Error(
      `Transaksi tidak ditemukan di Sanity: ${orderId}`
    );
  }

  // ==========================================================================
  // VALIDASI TXN ID
  // ==========================================================================

  if (
    transaction.txnId &&
    transaction.txnId !== txnId
  ) {
    throw new Error(
      `Txn ID tidak cocok. Sanity=${transaction.txnId}, Pakasir=${txnId}`
    );
  }

  // ==========================================================================
  // VALIDASI ORDER ID
  // ==========================================================================

  if (
    transaction.orderId !== orderId
  ) {
    throw new Error(
      `Order ID tidak cocok. Sanity=${transaction.orderId}, Pakasir=${orderId}`
    );
  }

  // ==========================================================================
  // VALIDASI NOMINAL
  // ==========================================================================

  const localAmount =
    safeNumber(
      transaction.amount
    );

  if (
    localAmount !== amount
  ) {
    throw new Error(
      `Nominal tidak cocok. Sanity=${localAmount}, Pakasir=${amount}`
    );
  }

  // ==========================================================================
  // IDEMPOTENCY
  // ==========================================================================

  if (transaction.pakasirProject !== PAKASIR_PROJECT ||
      (typeof transaction.isSandbox === 'boolean' && transaction.isSandbox !== isSandbox)) {
    throw new Error('Project atau mode transaksi tidak cocok.');
  }
  if (!Number.isSafeInteger(amount) || amount <= 0 || !completedAt || !Number.isFinite(Date.parse(completedAt))) {
    throw new Error('Nominal atau waktu pembayaran tidak valid.');
  }
  if (
    transaction.status === 'success' || transaction.status === 'completed' || transaction.status === 'sandbox_completed'
  ) {
    console.log(
      `ℹ️ TRANSAKSI SUDAH SUCCESS: ${orderId}`
    );

    return {
      alreadyProcessed: true,
      transaction,
    };
  }

  if (isSandbox) {
    await client.patch(transaction._id).ifRevisionId(transaction._rev).set({
      txnId, status: 'sandbox_completed', gatewayStatus: 'completed', isSandbox: true,
      completedAt: new Date(completedAt).toISOString(),
    }).commit({ visibility: 'sync' });
    return { alreadyProcessed: false, success: true };
  }

  // ==========================================================================
  // DATA TRANSAKSI
  // ==========================================================================

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
      `Slug program tidak ditemukan untuk transaksi ${orderId}.`
    );
  }

  // ==========================================================================
  // CARI PROGRAM
  // ==========================================================================

  const program =
    await findProgram(
      programSlug
    );

  if (!program) {
    throw new Error(
      `Program tidak ditemukan: ${programSlug}`
    );
  }

  // ==========================================================================
  // FIX TYPESCRIPT
  //
  // Jangan menggunakan "program._id" langsung di dalam closure.
  // Ambil nilai primitif setelah null-check.
  // ==========================================================================

  const programId =
    program._id;

  const programTitle =
    program.title ||
    programSlug;

  // ==========================================================================
  // FUNDRAISER
  // ==========================================================================

  const fundraiserPhone =
    String(
      transaction.fundraiserPhone ||
      ''
    ).trim();

  const fundraiser =
    await findFundraiser(
      fundraiserPhone
    );

  // ==========================================================================
  // WAKTU PEMBAYARAN
  // ==========================================================================

  const finalDate =
    completedAt
      ? new Date(completedAt)
      : new Date();

  const currentDate =
    finalDate.toLocaleDateString(
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
    finalDate.toLocaleTimeString(
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

  const completedIso =
    completedAt ||
    new Date().toISOString();

  // ==========================================================================
  // DONOR KEY
  //
  // Dibuat unik berdasarkan order ID.
  // ==========================================================================

  const donorKey =
    `donor-${orderId}`
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      )
      .slice(0, 100);

  // ==========================================================================
  // COMMIT KE SANITY
  // ==========================================================================

  async function commitPayment(
    currentTransaction: DonationTransaction
  ) {
    let tx =
      client.transaction();

    // ------------------------------------------------------------------------
    // UPDATE TRANSAKSI
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
    // UPDATE PROGRAM
    // ------------------------------------------------------------------------

    tx =
      tx.patch(
        programId,
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
    // FUNDRAISER 10%
    // ------------------------------------------------------------------------

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
          fundraiser.phone ||
          fundraiser._id
        }`
      );
    }

    // ------------------------------------------------------------------------
    // COMMIT
    // ------------------------------------------------------------------------

    return tx.commit({
      visibility:
        'sync',
    });
  }

  // ==========================================================================
  // COMMIT PERTAMA
  // ==========================================================================

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

    // ========================================================================
    // AMBIL REVISION TERBARU
    // ========================================================================

    const refreshed =
      await findTransaction(
        txnId,
        orderId
      );

    if (!refreshed) {
      throw new Error(
        'Transaksi tidak ditemukan ketika melakukan retry commit.'
      );
    }

    // ========================================================================
    // CEK APAKAH WEBHOOK LAIN SUDAH BERHASIL
    // ========================================================================

    if (
      refreshed.status ===
        'success' ||
      refreshed.status === 'completed' || refreshed.status === 'sandbox_completed'
    ) {
      console.log(
        `✅ TRANSAKSI SUDAH DIPROSES WEBHOOK LAIN: ${orderId}`
      );

      return {
        alreadyProcessed:
          true,

        transaction:
          refreshed,
      };
    }

    // ========================================================================
    // RETRY DENGAN REVISION TERBARU
    // ========================================================================

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

  // ==========================================================================
  // GOOGLE SHEETS
  // ==========================================================================

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
      programTitle,
  });

  // ==========================================================================
  // WHATSAPP DONATUR
  // ==========================================================================

  if (donorPhone) {
    await sendWhatsappReceipt({
      phone:
        donorPhone,

      donorName,

      orderId,

      programName:
        programTitle,

      amount,

      paymentMethod,

      date:
        currentDate,

      time:
        currentTime,
    });
  }

  // ==========================================================================
  // SELESAI
  // ==========================================================================

  return {
    alreadyProcessed:
      false,

    success:
      true,
  };
}

// ============================================================================
// POST
// WEBHOOK PAKASIR V2
// ============================================================================

