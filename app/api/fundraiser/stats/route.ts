import { NextResponse } from 'next/server';
import { clientPublik as client } from '@/lib/sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ==========================================================
// KONFIGURASI KOMISI
// ==========================================================

const DEFAULT_COMMISSION_RATE = 0.1; // 10%

const MINIMUM_WITHDRAWAL = Number(
  process.env.FUNDRAISER_MIN_WITHDRAWAL || 50000
);

const WITHDRAWAL_ENABLED =
  process.env.FUNDRAISER_WITHDRAWAL_ENABLED !== 'false';

// ==========================================================
// TYPES
// ==========================================================

type FundraiserProfile = {
  _id: string;
  name?: string;
  phone?: string;
  status?: string;

  /**
   * Data lama:
   * total fee yang sebelumnya sudah ditandai dibayar admin.
   *
   * Tetap dipertahankan untuk backward compatibility.
   */
  feePaid?: number;

  /**
   * Opsional.
   *
   * Bisa disimpan:
   * 10   -> dianggap 10%
   * 0.1  -> dianggap 10%
   */
  commissionRate?: number;

  programTitle?: string;
  programSlug?: string;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

type DonationItem = {
  _id?: string;
  donorName?: string;
  amount?: number;
  slug?: string;
  programTitle?: string;
  createdAt?: string;
  paidAt?: string;
};

type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | string;

type WithdrawalItem = {
  _id?: string;
  amount?: number;
  status?: WithdrawalStatus;

  requestedAt?: string;
  processedAt?: string;
  paidAt?: string;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;

  referenceNumber?: string;
  note?: string;
  adminNote?: string;
};

type ProgramItem = {
  title?: string;
  slug?: string;
};

type StatsQueryResult = {
  profile: FundraiserProfile | null;
  donations: DonationItem[];
  withdrawals: WithdrawalItem[];
  programs: ProgramItem[];
};

// ==========================================================
// HELPERS
// ==========================================================

/**
 * Normalisasi nomor WhatsApp.
 *
 * Contoh:
 *
 * 08123456789
 * +628123456789
 * 628123456789
 *
 * semuanya bisa dicocokkan.
 */
function normalizePhone(input: string) {
  const raw = input.trim();

  const digits = raw.replace(/[^0-9]/g, '');

  let international = digits;

  if (digits.startsWith('0')) {
    international = `62${digits.slice(1)}`;
  }

  if (digits.startsWith('8')) {
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

/**
 * Commission rate bisa ditulis:
 *
 * 10  = 10%
 * 0.1 = 10%
 */
function normalizeCommissionRate(
  input?: number | null
): number {
  const rate = Number(input);

  if (!Number.isFinite(rate) || rate <= 0) {
    return DEFAULT_COMMISSION_RATE;
  }

  if (rate > 1) {
    return Math.min(rate / 100, 1);
  }

  return Math.min(rate, 1);
}

/**
 * Masking rekening karena endpoint saat ini
 * hanya memakai nomor WhatsApp.
 *
 * Contoh:
 * 1234567890 -> ******7890
 */
function maskAccountNumber(
  accountNumber?: string
): string | undefined {
  if (!accountNumber) return undefined;

  const clean = String(accountNumber).replace(
    /\s+/g,
    ''
  );

  if (clean.length <= 4) {
    return clean;
  }

  return `${'*'.repeat(clean.length - 4)}${clean.slice(
    -4
  )}`;
}

/**
 * Response finansial tidak boleh dicache.
 */
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
// GET
// ==========================================================

export async function GET(request: Request) {
  try {
    // ======================================================
    // 1. AMBIL NOMOR WHATSAPP
    // ======================================================

    const { searchParams } = new URL(request.url);

    const phone = searchParams.get('phone');

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

    // ======================================================
    // 2. NORMALISASI NOMOR
    // ======================================================

    const normalized = normalizePhone(phone);

    if (
      !normalized.digits ||
      normalized.digits.length < 8
    ) {
      return jsonNoStore(
        {
          success: false,
          message:
            'Format nomor WhatsApp tidak valid.',
        },
        400
      );
    }

    // ======================================================
    // 3. GROQ QUERY
    // ======================================================
    //
    // Mengambil:
    //
    // - profile fundraiser
    // - donasi sukses
    // - riwayat withdrawal
    // - seluruh program
    //
    // Schema penarikan yang digunakan:
    //
    // _type: fundraiserWithdrawal
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
          name,
          phone,
          status,
          feePaid,
          commissionRate,

          bankName,
          accountName,
          accountNumber,

          "programTitle": program->title,
          "programSlug": program->slug.current
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
        ]
        | order(
          coalesce(paidAt, _createdAt) desc
        ) {
          _id,
          amount,
          donorName,
          slug,

          "programTitle": coalesce(
            programTitle,
            *[
              _type == "program" &&
              slug.current == ^.slug
            ][0].title,
            "Sedekah Umum / Non-Slug"
          ),

          "createdAt": _createdAt,
          paidAt
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
        ]
        | order(
          coalesce(requestedAt, _createdAt) desc
        ) {
          _id,
          amount,
          status,

          "requestedAt": coalesce(
            requestedAt,
            _createdAt
          ),

          processedAt,
          paidAt,

          bankName,
          accountName,
          accountNumber,

          referenceNumber,
          note,
          adminNote
        },

        "programs": *[
          _type == "program" &&
          !(_id in path("drafts.**")) &&
          defined(slug.current)
        ]
        | order(title asc) {
          title,
          "slug": slug.current
        }
      }
    `;

    // ======================================================
    // 4. FETCH DATA SANITY
    // ======================================================

    const data =
      await client.fetch<StatsQueryResult>(
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
    // 5. PROFILE TIDAK DITEMUKAN
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

    // ======================================================
    // 6. NORMALISASI ARRAY
    // ======================================================

    const donations = Array.isArray(
      data.donations
    )
      ? data.donations
      : [];

    const withdrawals = Array.isArray(
      data.withdrawals
    )
      ? data.withdrawals
      : [];

    const programs = Array.isArray(data.programs)
      ? data.programs.filter(
          (program) =>
            program?.slug && program?.title
        )
      : [];

    // ======================================================
    // 7. HITUNG TOTAL DONASI
    // ======================================================

    const totalEarnings = donations.reduce(
      (sum, item) => {
        const amount = Number(item.amount || 0);

        if (!Number.isFinite(amount)) {
          return sum;
        }

        return sum + amount;
      },
      0
    );

    // ======================================================
    // 8. HITUNG COMMISSION RATE
    // ======================================================

    const commissionRate =
      normalizeCommissionRate(
        data.profile.commissionRate
      );

    // ======================================================
    // 9. TOTAL HAK KOMISI
    // ======================================================

    const totalCommission = Math.max(
      0,
      Math.round(
        totalEarnings * commissionRate
      )
    );

    // ======================================================
    // 10. HITUNG HISTORY PENARIKAN
    // ======================================================

    let paidFromWithdrawalHistory = 0;
    let pendingWithdrawal = 0;

    for (const item of withdrawals) {
      const amount = Number(item.amount || 0);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        continue;
      }

      const status = String(
        item.status || ''
      ).toLowerCase();

      /**
       * Sudah benar-benar dibayar
       */
      if (
        status === 'paid' ||
        status === 'completed'
      ) {
        paidFromWithdrawalHistory += amount;
      }

      /**
       * Pending dan approved sama-sama
       * mengunci saldo supaya tidak bisa
       * ditarik dua kali.
       */
      if (
        status === 'pending' ||
        status === 'approved'
      ) {
        pendingWithdrawal += amount;
      }
    }

    // ======================================================
    // 11. SUPPORT DATA LAMA feePaid
    // ======================================================
    //
    // feePaid adalah sistem lama.
    //
    // Jangan dijumlahkan dengan history withdrawal,
    // karena berisiko double-count.
    //
    // Ambil angka TERBESAR.
    //
    // Contoh:
    //
    // feePaid = 150.000
    // history paid = 150.000
    //
    // hasil tetap 150.000, bukan 300.000.
    //
    // ======================================================

    const legacyFeePaid = Math.max(
      0,
      Number(data.profile.feePaid || 0)
    );

    const totalWithdrawn = Math.max(
      legacyFeePaid,
      paidFromWithdrawalHistory
    );

    // ======================================================
    // 12. HITUNG SALDO TERSEDIA
    // ======================================================

    const availableCommission = Math.max(
      0,
      totalCommission -
        totalWithdrawn -
        pendingWithdrawal
    );

    // ======================================================
    // 13. MASK DATA REKENING
    // ======================================================

    const safeProfile = {
      ...data.profile,

      accountNumber: maskAccountNumber(
        data.profile.accountNumber
      ),
    };

    const safeWithdrawals = withdrawals.map(
      (item) => ({
        ...item,

        amount: Number(item.amount || 0),

        accountNumber: maskAccountNumber(
          item.accountNumber
        ),
      })
    );

    // ======================================================
    // 14. RESPONSE
    // ======================================================

    return jsonNoStore({
      success: true,

      // ====================================================
      // PROFILE
      // ====================================================

      profile: safeProfile,

      // ====================================================
      // DONATION STATS
      // ====================================================

      totalEarnings,

      donationCount: donations.length,

      history: donations,

      // ====================================================
      // COMMISSION
      // ====================================================

      commissionRate,

      commissionPercent: Math.round(
        commissionRate * 100
      ),

      totalCommission,

      // Yang benar-benar sudah dibayar
      totalWithdrawn,

      // Sedang pending / approved
      pendingWithdrawal,

      // Yang masih boleh diajukan
      availableCommission,

      // ====================================================
      // WITHDRAWAL HISTORY
      // ====================================================

      withdrawals: safeWithdrawals,

      withdrawalCount:
        safeWithdrawals.length,

      // ====================================================
      // KONFIGURASI PENARIKAN
      // ====================================================

      withdrawalConfig: {
        enabled: WITHDRAWAL_ENABLED,

        minimum: MINIMUM_WITHDRAWAL,

        /**
         * Maksimal nominal yang boleh
         * diajukan saat ini.
         */
        maximum: availableCommission,
      },

      // ====================================================
      // PROGRAM
      // ====================================================

      programs,
    });
  } catch (error: unknown) {
    console.error(
      '🔥 API Fundraiser Stats Error:',
      error
    );

    /**
     * Jangan kirim detail error server
     * ke browser pada production.
     */
    return jsonNoStore(
      {
        success: false,
        message:
          'Terjadi kesalahan saat mengambil data fundraiser.',
      },
      500
    );
  }
}