import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ==========================================================
// KONFIGURASI
// ==========================================================

const DEFAULT_COMMISSION_RATE = 0.1; // 10%

const MINIMUM_WITHDRAWAL = Number(
  process.env.FUNDRAISER_MIN_WITHDRAWAL || 50000
);

const WITHDRAWAL_ENABLED =
  process.env.FUNDRAISER_WITHDRAWAL_ENABLED !== 'false';

// ==========================================================
// SANITY WRITE CLIENT
// ==========================================================
//
// PENTING:
// Endpoint penarikan membutuhkan WRITE TOKEN.
//
// Jangan menggunakan NEXT_PUBLIC_ untuk token.
// Token hanya boleh berada di server.
//
// .env.local:
//
// SANITY_API_WRITE_TOKEN=xxxxxxxxxxxxxxxxxxxx
//
// ==========================================================

const writeClient = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    'ID_PROJECT_ANDA',

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',

  apiVersion: '2026-09-20',

  useCdn: false,

  token: process.env.SANITY_API_WRITE_TOKEN,
});

// ==========================================================
// TYPES
// ==========================================================

type WithdrawalRequestBody = {
  phone?: string;
  amount?: number | string;
  note?: string;
};

type FundraiserProfile = {
  _id: string;
  _rev: string;

  name?: string;
  phone?: string;
  status?: string;

  feePaid?: number;
  commissionRate?: number;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

type DonationItem = {
  amount?: number;
};

type WithdrawalItem = {
  amount?: number;
  status?: string;
};

type WithdrawalData = {
  profile: FundraiserProfile | null;
  donations: DonationItem[];
  withdrawals: WithdrawalItem[];
};

// ==========================================================
// HELPERS
// ==========================================================

function normalizePhone(input: string) {
  const raw = String(input || '').trim();

  const digits = raw.replace(/[^0-9]/g, '');

  let international = digits;

  if (digits.startsWith('0')) {
    international = `62${digits.slice(1)}`;
  } else if (digits.startsWith('8')) {
    international = `62${digits}`;
  }

  let local = digits;

  if (international.startsWith('62')) {
    local = `0${international.slice(2)}`;
  }

  const plus = international
    ? `+${international}`
    : '';

  return {
    raw,
    digits,
    international,
    local,
    plus,
  };
}

// ==========================================================
// NORMALISASI COMMISSION RATE
// ==========================================================
//
// Mendukung:
//
// commissionRate = 10
// berarti 10%
//
// commissionRate = 0.1
// berarti 10%
//
// ==========================================================

function normalizeCommissionRate(
  input?: number | null
) {
  const rate = Number(input);

  if (!Number.isFinite(rate) || rate <= 0) {
    return DEFAULT_COMMISSION_RATE;
  }

  if (rate > 1) {
    return Math.min(rate / 100, 1);
  }

  return Math.min(rate, 1);
}

// ==========================================================
// RESPONSE NO CACHE
// ==========================================================

function jsonNoStore(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,

    headers: {
      'Cache-Control':
        'no-store, no-cache, max-age=0, must-revalidate',

      Pragma: 'no-cache',

      Expires: '0',
    },
  });
}

// ==========================================================
// POST
// ==========================================================

export async function POST(request: Request) {
  try {
    // ======================================================
    // 1. CEK FITUR PENARIKAN
    // ======================================================

    if (!WITHDRAWAL_ENABLED) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Fitur penarikan komisi sedang dinonaktifkan.',
        },
        403
      );
    }

    // ======================================================
    // 2. CEK SANITY WRITE TOKEN
    // ======================================================

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error(
        '🔥 SANITY_API_WRITE_TOKEN belum dikonfigurasi.'
      );

      return jsonNoStore(
        {
          success: false,

          message:
            'Konfigurasi server untuk penarikan belum lengkap.',
        },
        500
      );
    }

    // ======================================================
    // 3. PARSE BODY
    // ======================================================

    let body: WithdrawalRequestBody;

    try {
      body = await request.json();
    } catch {
      return jsonNoStore(
        {
          success: false,

          message:
            'Format request tidak valid.',
        },
        400
      );
    }

    const {
      phone,
      amount: rawAmount,
      note,
    } = body;

    // ======================================================
    // 4. VALIDASI NOMOR WA
    // ======================================================

    if (!phone) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Nomor WhatsApp wajib disertakan.',
        },
        400
      );
    }

    const normalized = normalizePhone(phone);

    if (
      !normalized.digits ||
      normalized.digits.length < 8
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Nomor WhatsApp tidak valid.',
        },
        400
      );
    }

    // ======================================================
    // 5. VALIDASI NOMINAL
    // ======================================================

    const amount = Number(
      String(rawAmount || '').replace(
        /[^0-9]/g,
        ''
      )
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Nominal penarikan tidak valid.',
        },
        400
      );
    }

    if (!Number.isInteger(amount)) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Nominal penarikan harus berupa angka bulat.',
        },
        400
      );
    }

    // ======================================================
    // 6. MINIMUM WITHDRAWAL
    // ======================================================

    if (amount < MINIMUM_WITHDRAWAL) {
      return jsonNoStore(
        {
          success: false,

          message: `Minimal penarikan adalah Rp ${MINIMUM_WITHDRAWAL.toLocaleString(
            'id-ID'
          )}.`,
        },
        400
      );
    }

    // ======================================================
    // 7. BATASI PANJANG CATATAN
    // ======================================================

    const cleanNote = String(
      note || ''
    )
      .trim()
      .slice(0, 500);

    // ======================================================
    // 8. AMBIL DATA TERBARU DARI SANITY
    // ======================================================
    //
    // Jangan percaya saldo dari frontend.
    //
    // Kita hitung ulang:
    //
    // - total donasi sukses
    // - total komisi
    // - sudah dicairkan
    // - pending
    // - saldo tersedia
    //
    // ======================================================

    const query = `
      {
        "profile": *[
          _type == "fundraiser" &&
          !(_id in path("drafts.**")) &&
          (
            phone == $phoneInternational ||
            phone == $phoneLocal ||
            phone == $phonePlus ||
            phone == $phoneRaw ||
            phone == $phoneDigits
          )
        ][0] {
          _id,
          _rev,

          name,
          phone,
          status,

          feePaid,
          commissionRate,

          bankName,
          accountName,
          accountNumber
        },

        "donations": *[
          _type == "donationTransaction" &&
          !(_id in path("drafts.**")) &&
          status == "success" &&
          (
            fundraiserPhone == $phoneInternational ||
            fundraiserPhone == $phoneLocal ||
            fundraiserPhone == $phonePlus ||
            fundraiserPhone == $phoneRaw ||
            fundraiserPhone == $phoneDigits
          )
        ] {
          amount
        },

        "withdrawals": *[
          _type == "fundraiserWithdrawal" &&
          !(_id in path("drafts.**")) &&
          (
            fundraiserPhone == $phoneInternational ||
            fundraiserPhone == $phoneLocal ||
            fundraiserPhone == $phonePlus ||
            fundraiserPhone == $phoneRaw ||
            fundraiserPhone == $phoneDigits ||

            fundraiser->phone == $phoneInternational ||
            fundraiser->phone == $phoneLocal ||
            fundraiser->phone == $phonePlus ||
            fundraiser->phone == $phoneRaw ||
            fundraiser->phone == $phoneDigits
          )
        ] {
          amount,
          status
        }
      }
    `;

    const data =
      await writeClient.fetch<WithdrawalData>(
        query,

        {
          phoneInternational:
            normalized.international,

          phoneLocal:
            normalized.local,

          phonePlus:
            normalized.plus,

          phoneRaw:
            normalized.raw,

          phoneDigits:
            normalized.digits,
        },

        {
          cache: 'no-store',
        }
      );

    // ======================================================
    // 9. CEK FUNDRAISER
    // ======================================================

    if (!data?.profile) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Data fundraiser tidak ditemukan.',
        },
        404
      );
    }

    const profile = data.profile;

    // ======================================================
    // 10. FUNDRAISER HARUS APPROVED
    // ======================================================

    if (profile.status !== 'approved') {
      return jsonNoStore(
        {
          success: false,

          message:
            'Akun fundraiser belum aktif atau belum disetujui.',
        },
        403
      );
    }

    // ======================================================
    // 11. CEK REKENING
    // ======================================================
    //
    // Penarikan sebaiknya tidak diizinkan jika
    // rekening belum lengkap.
    //
    // ======================================================

    if (
      !profile.bankName ||
      !profile.accountNumber ||
      !profile.accountName
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Data rekening fundraiser belum lengkap. Silakan lengkapi nama bank, nomor rekening, dan nama pemilik rekening terlebih dahulu.',
        },
        400
      );
    }

    // ======================================================
    // 12. HITUNG TOTAL DONASI
    // ======================================================

    const donations = Array.isArray(
      data.donations
    )
      ? data.donations
      : [];

    const totalEarnings = donations.reduce(
      (sum, item) => {
        const donationAmount = Number(
          item.amount || 0
        );

        if (
          !Number.isFinite(
            donationAmount
          ) ||
          donationAmount <= 0
        ) {
          return sum;
        }

        return sum + donationAmount;
      },
      0
    );

    // ======================================================
    // 13. TOTAL KOMISI
    // ======================================================

    const commissionRate =
      normalizeCommissionRate(
        profile.commissionRate
      );

    const totalCommission = Math.max(
      0,

      Math.round(
        totalEarnings * commissionRate
      )
    );

    // ======================================================
    // 14. HITUNG WITHDRAWAL
    // ======================================================

    const withdrawals = Array.isArray(
      data.withdrawals
    )
      ? data.withdrawals
      : [];

    let paidFromHistory = 0;
    let pendingWithdrawal = 0;

    for (const item of withdrawals) {
      const withdrawalAmount =
        Number(item.amount || 0);

      if (
        !Number.isFinite(
          withdrawalAmount
        ) ||
        withdrawalAmount <= 0
      ) {
        continue;
      }

      const status = String(
        item.status || ''
      ).toLowerCase();

      // ===============================================
      // SUDAH DIBAYAR
      // ===============================================

      if (
        status === 'paid' ||
        status === 'completed'
      ) {
        paidFromHistory +=
          withdrawalAmount;
      }

      // ===============================================
      // MASIH MENGUNCI SALDO
      // ===============================================

      if (
        status === 'pending' ||
        status === 'approved'
      ) {
        pendingWithdrawal +=
          withdrawalAmount;
      }
    }

    // ======================================================
    // 15. SUPPORT feePaid LAMA
    // ======================================================

    const legacyFeePaid = Math.max(
      0,
      Number(profile.feePaid || 0)
    );

    /**
     * Jangan dijumlahkan.
     *
     * Kalau data history adalah migrasi dari feePaid,
     * menjumlahkan keduanya membuat saldo terpotong
     * dua kali.
     */
    const totalWithdrawn = Math.max(
      legacyFeePaid,
      paidFromHistory
    );

    // ======================================================
    // 16. SALDO TERSEDIA
    // ======================================================

    const availableCommission = Math.max(
      0,

      totalCommission -
        totalWithdrawn -
        pendingWithdrawal
    );

    // ======================================================
    // 17. CEK SALDO
    // ======================================================

    if (availableCommission <= 0) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Saldo komisi belum tersedia untuk ditarik.',

          availableCommission,
        },
        400
      );
    }

    if (amount > availableCommission) {
      return jsonNoStore(
        {
          success: false,

          message: `Nominal penarikan melebihi saldo tersedia. Saldo Anda saat ini Rp ${availableCommission.toLocaleString(
            'id-ID'
          )}.`,

          availableCommission,
        },
        400
      );
    }

    // ======================================================
    // 18. ID WITHDRAWAL
    // ======================================================
    //
    // Gunakan ID Sanity otomatis.
    //
    // Data nomor rekening dibuat snapshot agar jika
    // rekening fundraiser berubah di kemudian hari,
    // history lama tetap mencatat rekening saat
    // pengajuan dibuat.
    //
    // ======================================================

    const now = new Date().toISOString();

    const withdrawalDocument = {
      _type: 'fundraiserWithdrawal',

      // ===============================================
      // REFERENCE FUNDRAISER
      // ===============================================

      fundraiser: {
        _type: 'reference',
        _ref: profile._id,
      },

      // ===============================================
      // IDENTITAS
      // ===============================================

      fundraiserPhone:
        normalized.international,

      // ===============================================
      // NOMINAL
      // ===============================================

      amount,

      // ===============================================
      // STATUS AWAL
      // ===============================================

      status: 'pending',

      // ===============================================
      // WAKTU PENGAJUAN
      // ===============================================

      requestedAt: now,

      // ===============================================
      // SNAPSHOT REKENING
      // ===============================================

      bankName: profile.bankName,

      accountName: profile.accountName,

      accountNumber:
        profile.accountNumber,

      // ===============================================
      // CATATAN
      // ===============================================

      ...(cleanNote
        ? {
            note: cleanNote,
          }
        : {}),

      // ===============================================
      // SNAPSHOT PERHITUNGAN
      // ===============================================
      //
      // Tidak wajib untuk dashboard,
      // tetapi sangat membantu audit.
      //
      // =================================================

      commissionSnapshot: {
        totalEarnings,

        commissionRate,

        totalCommission,

        totalWithdrawn,

        pendingBefore:
          pendingWithdrawal,

        availableBefore:
          availableCommission,

        requestedAmount: amount,

        availableAfter:
          Math.max(
            0,
            availableCommission - amount
          ),
      },
    };

    // ======================================================
    // 19. SIMPAN MENGGUNAKAN TRANSACTION
    // ======================================================
    //
    // Kita sekaligus "touch" dokumen fundraiser.
    //
    // ifRevisionId(profile._rev) mencegah dua request
    // paralel memakai revision fundraiser yang sama.
    //
    // Jika request lain lebih dulu mengubah fundraiser,
    // request kedua akan gagal dan pengguna dapat mencoba
    // kembali.
    //
    // ======================================================

    const transaction =
      writeClient.transaction();

    transaction.create(
      withdrawalDocument
    );

    transaction.patch(
      profile._id,

      (patch) =>
        patch
          .ifRevisionId(profile._rev)
          .set({
            lastWithdrawalRequestAt:
              now,
          })
    );

    const result =
      await transaction.commit({
        visibility: 'sync',
      });

    // ======================================================
    // 20. AMBIL ID DOKUMEN BARU
    // ======================================================

    const createdWithdrawal =
      result.results?.find(
        (item: any) =>
          item.operation === 'create'
      );

    // ======================================================
    // 21. RESPONSE SUKSES
    // ======================================================

    return jsonNoStore(
      {
        success: true,

        message:
          'Pengajuan penarikan berhasil dikirim dan sedang menunggu persetujuan admin.',

        withdrawal: {
          _id:
            createdWithdrawal?.id ||
            null,

          amount,

          status: 'pending',

          requestedAt: now,

          bankName:
            profile.bankName,

          accountName:
            profile.accountName,

          /**
           * Jangan mengirim nomor rekening lengkap
           * kembali ke browser.
           */
          accountNumber:
            maskAccountNumber(
              profile.accountNumber
            ),
        },

        balances: {
          totalEarnings,

          totalCommission,

          totalWithdrawn,

          pendingWithdrawal:
            pendingWithdrawal +
            amount,

          availableCommission:
            Math.max(
              0,
              availableCommission -
                amount
            ),
        },
      },

      201
    );
  } catch (error: any) {
    console.error(
      '🔥 API Fundraiser Withdraw Error:',
      error
    );

    // ======================================================
    // REVISION CONFLICT
    // ======================================================
    //
    // Biasanya terjadi bila ada dua permintaan
    // penarikan yang masuk hampir bersamaan.
    //
    // ======================================================

    const message = String(
      error?.message || ''
    ).toLowerCase();

    if (
      message.includes('revision') ||
      message.includes('conflict')
    ) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Data saldo baru saja berubah. Silakan refresh dashboard lalu ajukan penarikan kembali.',
        },
        409
      );
    }

    return jsonNoStore(
      {
        success: false,

        message:
          'Terjadi kesalahan saat mengajukan penarikan komisi.',
      },
      500
    );
  }
}

// ==========================================================
// MASK ACCOUNT
// ==========================================================

function maskAccountNumber(
  accountNumber?: string
) {
  if (!accountNumber) {
    return undefined;
  }

  const clean =
    String(accountNumber).replace(
      /\s+/g,
      ''
    );

  if (clean.length <= 4) {
    return clean;
  }

  return `${'*'.repeat(
    clean.length - 4
  )}${clean.slice(-4)}`;
}