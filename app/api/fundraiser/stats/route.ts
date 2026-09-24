// app/api/fundraiser/stats/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// ============================================================================
// NEXT CONFIG
// ============================================================================

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// SANITY CONFIG
// ============================================================================

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  'lsnco71s';

const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  'production';

/**
 * Untuk membaca draft, kita membutuhkan token server.
 *
 * Prioritas:
 *
 * 1. SANITY_API_READ_TOKEN
 * 2. SANITY_API_WRITE_TOKEN
 *
 * Jangan pernah memakai NEXT_PUBLIC_ untuk token.
 */
const SANITY_TOKEN =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN;

// ============================================================================
// SANITY SERVER CLIENT
// ============================================================================

const serverClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,

  apiVersion: '2026-09-24',

  useCdn: false,

  ...(SANITY_TOKEN
    ? {
        token: SANITY_TOKEN,
      }
    : {}),
});

// ============================================================================
// CONFIG FUNDRAISER
// ============================================================================

const DEFAULT_COMMISSION_RATE = 0.1;

const MINIMUM_WITHDRAWAL = Number(
  process.env.FUNDRAISER_MIN_WITHDRAWAL ||
    50000
);

const WITHDRAWAL_ENABLED =
  process.env.FUNDRAISER_WITHDRAWAL_ENABLED !==
  'false';

// ============================================================================
// TYPES
// ============================================================================

type FundraiserProfile = {
  _id: string;

  _updatedAt?: string;

  name?: string;
  phone?: string;
  status?: string;

  feePaid?: number;

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
  profileCandidates?: FundraiserProfile[];

  donations?: DonationItem[];

  withdrawals?: WithdrawalItem[];

  programs?: ProgramItem[];
};

// ============================================================================
// PHONE NORMALIZER
// ============================================================================

function normalizePhone(input: string) {
  const raw = input.trim();

  const digits =
    raw.replace(/[^0-9]/g, '');

  let international = digits;

  if (digits.startsWith('0')) {
    international =
      `62${digits.slice(1)}`;
  } else if (
    digits.startsWith('8')
  ) {
    international =
      `62${digits}`;
  }

  let local = digits;

  if (
    international.startsWith('62')
  ) {
    local =
      `0${international.slice(2)}`;
  }

  const plus =
    international
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

// ============================================================================
// STATUS NORMALIZER
// ============================================================================

function normalizeFundraiserStatus(
  value?: string
): string {
  const status =
    String(value || '')
      .trim()
      .toLowerCase();

  // APPROVED
  if (
    status === 'approved' ||
    status === 'active' ||
    status === 'aktif' ||
    status === 'disetujui' ||
    status === 'verified' ||
    status === 'terverifikasi'
  ) {
    return 'approved';
  }

  // REJECTED
  if (
    status === 'rejected' ||
    status === 'ditolak'
  ) {
    return 'rejected';
  }

  // CANCELLED
  if (
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'dibatalkan'
  ) {
    return 'cancelled';
  }

  // PENDING
  if (
    status === 'pending' ||
    status === 'waiting' ||
    status === 'menunggu' ||
    status === 'menunggu verifikasi'
  ) {
    return 'pending';
  }

  return status || 'pending';
}

// ============================================================================
// RESOLVE PROFILE
// ============================================================================
//
// Sanity bisa memiliki:
//
// abc123
//
// dan:
//
// drafts.abc123
//
// Jika keduanya ditemukan, draft diprioritaskan.
//
// ============================================================================

function resolveFundraiserProfile(
  candidates:
    | FundraiserProfile[]
    | undefined
): FundraiserProfile | null {
  if (
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {
    return null;
  }

  /**
   * Kelompokkan dokumen berdasarkan ID asli.
   *
   * drafts.abc123
   *
   * menjadi:
   *
   * abc123
   */
  const documents =
    new Map<
      string,
      FundraiserProfile
    >();

  for (const candidate of candidates) {
    if (!candidate?._id) {
      continue;
    }

    const isDraft =
      candidate._id.startsWith(
        'drafts.'
      );

    const baseId =
      candidate._id.replace(
        /^drafts\./,
        ''
      );

    const existing =
      documents.get(baseId);

    /**
     * Jika belum ada → gunakan.
     */
    if (!existing) {
      documents.set(
        baseId,
        candidate
      );

      continue;
    }

    /**
     * Draft SELALU lebih diprioritaskan
     * daripada versi published dengan ID yang sama.
     */
    if (isDraft) {
      documents.set(
        baseId,
        candidate
      );
    }
  }

  const resolved =
    Array.from(
      documents.values()
    );

  if (resolved.length === 0) {
    return null;
  }

  /**
   * Jika ternyata terdapat beberapa dokumen
   * fundraiser dengan nomor HP sama,
   * gunakan yang terakhir diperbarui.
   */
  resolved.sort(
    (a, b) => {
      const aTime =
        a._updatedAt
          ? new Date(
              a._updatedAt
            ).getTime()
          : 0;

      const bTime =
        b._updatedAt
          ? new Date(
              b._updatedAt
            ).getTime()
          : 0;

      return bTime - aTime;
    }
  );

  return resolved[0];
}

// ============================================================================
// COMMISSION RATE
// ============================================================================

function normalizeCommissionRate(
  input?: number | null
): number {
  const rate =
    Number(input);

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    return DEFAULT_COMMISSION_RATE;
  }

  /**
   * 10 dianggap 10%.
   */
  if (rate > 1) {
    return Math.min(
      rate / 100,
      1
    );
  }

  /**
   * 0.1 dianggap 10%.
   */
  return Math.min(
    rate,
    1
  );
}

// ============================================================================
// MASK ACCOUNT NUMBER
// ============================================================================

function maskAccountNumber(
  accountNumber?: string
): string | undefined {
  if (!accountNumber) {
    return undefined;
  }

  const clean =
    String(
      accountNumber
    ).replace(
      /\s+/g,
      ''
    );

  if (
    clean.length <= 4
  ) {
    return clean;
  }

  return `${'*'.repeat(
    clean.length - 4
  )}${clean.slice(-4)}`;
}

// ============================================================================
// NO CACHE RESPONSE
// ============================================================================

function jsonNoStore(
  body: unknown,
  status = 200
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        'Cache-Control':
          'no-store, no-cache, max-age=0, must-revalidate',

        Pragma:
          'no-cache',

        Expires:
          '0',
      },
    }
  );
}

// ============================================================================
// GET
// ============================================================================

export async function GET(
  request: Request
) {
  try {
    // ========================================================================
    // 1. PHONE PARAMETER
    // ========================================================================

    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    const phone =
      searchParams.get(
        'phone'
      );

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

    // ========================================================================
    // 2. NORMALIZE PHONE
    // ========================================================================

    const normalized =
      normalizePhone(
        phone
      );

    if (
      !normalized.digits ||
      normalized.digits.length <
        8
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

    // ========================================================================
    // 3. GROQ
    // ========================================================================
    //
    // PENTING:
    //
    // profileCandidates TIDAK membuang draft.
    //
    // Donations / withdrawal / program tetap hanya memakai published data.
    //
    // ========================================================================

    const query = `
      {
        "profileCandidates": *[
          _type == "fundraiser" &&
          (
            phone == $phoneInternational ||
            phone == $phoneLocal ||
            phone == $phonePlus ||
            phone == $phoneRaw ||
            phone == $phoneDigits
          )
        ]
        | order(_updatedAt desc) {
          _id,
          _updatedAt,

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
            coalesce(
              paidAt,
              _createdAt
            ) desc
          ) {
          _id,

          amount,

          donorName,

          slug,

          "programTitle": coalesce(
            programTitle,

            *[
              _type == "program" &&
              slug.current == ^.slug &&
              !(_id in path("drafts.**"))
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
            coalesce(
              requestedAt,
              _createdAt
            ) desc
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

          defined(
            slug.current
          )
        ]
        | order(
            title asc
          ) {
          title,

          "slug":
            slug.current
        }
      }
    `;

    // ========================================================================
    // 4. FETCH SANITY
    // ========================================================================

    /**
     * Jika token tersedia gunakan RAW perspective.
     *
     * RAW memungkinkan server melihat:
     *
     * - dokumen published
     * - drafts.xxx
     *
     * Tanpa token, fallback hanya published.
     */

    const perspective:
      | 'raw'
      | 'published' =
      SANITY_TOKEN
        ? 'raw'
        : 'published';

    const data =
      await serverClient.fetch<StatsQueryResult>(
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
          cache:
            'no-store',

          perspective,
        }
      );

    // ========================================================================
    // 5. RESOLVE PROFILE
    // ========================================================================

    const profile =
      resolveFundraiserProfile(
        data?.profileCandidates
      );

    if (!profile) {
      return jsonNoStore(
        {
          success: false,

          message:
            'Data fundraiser tidak ditemukan.',
        },
        404
      );
    }

    // ========================================================================
    // 6. NORMALIZE STATUS
    // ========================================================================

    const fundraiserStatus =
      normalizeFundraiserStatus(
        profile.status
      );

    // ========================================================================
    // 7. NORMALIZE ARRAY
    // ========================================================================

    const donations =
      Array.isArray(
        data?.donations
      )
        ? data.donations
        : [];

    const withdrawals =
      Array.isArray(
        data?.withdrawals
      )
        ? data.withdrawals
        : [];

    const programs =
      Array.isArray(
        data?.programs
      )
        ? data.programs.filter(
            (program) =>
              Boolean(
                program?.slug &&
                  program?.title
              )
          )
        : [];

    // ========================================================================
    // 8. TOTAL DONATION
    // ========================================================================

    const totalEarnings =
      donations.reduce(
        (
          sum,
          item
        ) => {
          const amount =
            Number(
              item.amount ||
                0
            );

          if (
            !Number.isFinite(
              amount
            ) ||
            amount < 0
          ) {
            return sum;
          }

          return (
            sum + amount
          );
        },
        0
      );

    // ========================================================================
    // 9. COMMISSION RATE
    // ========================================================================

    const commissionRate =
      normalizeCommissionRate(
        profile.commissionRate
      );

    const commissionPercent =
      Math.round(
        commissionRate *
          100
      );

    // ========================================================================
    // 10. TOTAL COMMISSION
    // ========================================================================

    const totalCommission =
      Math.max(
        0,

        Math.round(
          totalEarnings *
            commissionRate
        )
      );

    // ========================================================================
    // 11. WITHDRAWAL TOTAL
    // ========================================================================

    let paidFromWithdrawalHistory =
      0;

    let pendingWithdrawal =
      0;

    for (
      const item of
      withdrawals
    ) {
      const amount =
        Number(
          item.amount || 0
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        continue;
      }

      const status =
        String(
          item.status || ''
        )
          .trim()
          .toLowerCase();

      // SUDAH DIBAYAR

      if (
        status === 'paid' ||
        status ===
          'completed'
      ) {
        paidFromWithdrawalHistory +=
          amount;
      }

      // SEDANG DIPROSES

      if (
        status ===
          'pending' ||
        status ===
          'approved'
      ) {
        pendingWithdrawal +=
          amount;
      }
    }

    // ========================================================================
    // 12. LEGACY FEE PAID
    // ========================================================================

    const legacyFeePaid =
      Math.max(
        0,

        Number(
          profile.feePaid ||
            0
        )
      );

    /**
     * Jangan dijumlahkan.
     *
     * feePaid lama bisa saja sudah mencerminkan
     * withdrawal history.
     */
    const totalWithdrawn =
      Math.max(
        legacyFeePaid,

        paidFromWithdrawalHistory
      );

    // ========================================================================
    // 13. AVAILABLE COMMISSION
    // ========================================================================

    const availableCommission =
      Math.max(
        0,

        totalCommission -
          totalWithdrawn -
          pendingWithdrawal
      );

    // ========================================================================
    // 14. SAFE PROFILE
    // ========================================================================

    const safeProfile = {
      /**
       * Hilangkan prefix drafts.
       *
       * Frontend tidak perlu mengetahui
       * apakah dokumen berasal dari drafts.xxx.
       */
      _id:
        profile._id.replace(
          /^drafts\./,
          ''
        ),

      name:
        profile.name ||
        'Fundraiser',

      /**
       * Gunakan nomor international
       * agar tracking referral konsisten.
       */
      phone:
        normalizePhone(
          profile.phone ||
            phone
        ).international,

      /**
       * INI YANG DIPAKAI DASHBOARD.
       */
      status:
        fundraiserStatus,

      feePaid:
        Number(
          profile.feePaid ||
            0
        ),

      commissionRate,

      programTitle:
        profile.programTitle,

      programSlug:
        profile.programSlug,

      bankName:
        profile.bankName,

      accountName:
        profile.accountName,

      accountNumber:
        maskAccountNumber(
          profile.accountNumber
        ),
    };

    // ========================================================================
    // 15. SAFE WITHDRAWALS
    // ========================================================================

    const safeWithdrawals =
      withdrawals.map(
        (item) => ({
          ...item,

          amount:
            Number(
              item.amount ||
                0
            ),

          status:
            String(
              item.status ||
                'pending'
            )
              .trim()
              .toLowerCase(),

          accountNumber:
            maskAccountNumber(
              item.accountNumber
            ),
        })
      );

    // ========================================================================
    // 16. RESPONSE
    // ========================================================================

    return jsonNoStore({
      success: true,

      // ----------------------------------------------------------------------
      // PROFILE
      // ----------------------------------------------------------------------

      profile:
        safeProfile,

      // ----------------------------------------------------------------------
      // STATUS
      // ----------------------------------------------------------------------

      status:
        fundraiserStatus,

      isApproved:
        fundraiserStatus ===
        'approved',

      // ----------------------------------------------------------------------
      // DONATION
      // ----------------------------------------------------------------------

      totalEarnings,

      donationCount:
        donations.length,

      history:
        donations,

      // ----------------------------------------------------------------------
      // COMMISSION
      // ----------------------------------------------------------------------

      commissionRate,

      commissionPercent,

      totalCommission,

      // ----------------------------------------------------------------------
      // WITHDRAWAL
      // ----------------------------------------------------------------------

      totalWithdrawn,

      pendingWithdrawal,

      availableCommission,

      withdrawals:
        safeWithdrawals,

      withdrawalCount:
        safeWithdrawals.length,

      // ----------------------------------------------------------------------
      // WITHDRAW CONFIG
      // ----------------------------------------------------------------------

      withdrawalConfig: {
        enabled:
          WITHDRAWAL_ENABLED,

        minimum:
          MINIMUM_WITHDRAWAL,

        maximum:
          availableCommission,
      },

      // ----------------------------------------------------------------------
      // PROGRAM
      // ----------------------------------------------------------------------

      programs,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      '🔥 API Fundraiser Stats Error:',
      error
    );

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