// sanity/schemaTypes/fundraiserWithdrawal.ts

import { defineField, defineType } from 'sanity';

// =========================================================
// SCHEMA: PENARIKAN KOMISI FUNDRAISER
// =========================================================
//
// Digunakan untuk menyimpan:
//
// - pengajuan penarikan fundraiser
// - nominal pencairan
// - rekening tujuan
// - status approval
// - tanggal pembayaran
// - nomor referensi transfer
// - histori pencairan
// - snapshot saldo ketika pengajuan dibuat
//
// =========================================================

export default defineType({
  name: 'fundraiserWithdrawal',

  title: 'Penarikan Komisi Fundraiser',

  type: 'document',

  // =======================================================
  // GROUP / TAB
  // =======================================================

  groups: [
    {
      name: 'main',
      title: 'Pengajuan',
      default: true,
    },

    {
      name: 'payment',
      title: 'Pembayaran',
    },

    {
      name: 'notes',
      title: 'Catatan',
    },

    {
      name: 'audit',
      title: 'Audit Komisi',
    },
  ],

  // =======================================================
  // FIELDS
  // =======================================================

  fields: [
    // =====================================================
    // FUNDRAISER
    // =====================================================

    defineField({
      name: 'fundraiser',

      title: 'Fundraiser',

      type: 'reference',

      group: 'main',

      to: [
        {
          type: 'fundraiser',
        },
      ],

      description:
        'Fundraiser yang mengajukan pencairan komisi.',

      validation: (Rule) =>
        Rule.required().error(
          'Fundraiser wajib dipilih.'
        ),
    }),

    // =====================================================
    // NOMOR WHATSAPP
    // =====================================================

    defineField({
      name: 'fundraiserPhone',

      title: 'Nomor WhatsApp Fundraiser',

      type: 'string',

      group: 'main',

      description:
        'Nomor WhatsApp fundraiser pada saat pengajuan dibuat.',

      readOnly: true,

      validation: (Rule) =>
        Rule.required().error(
          'Nomor WhatsApp fundraiser wajib tersedia.'
        ),
    }),

    // =====================================================
    // NOMINAL
    // =====================================================

    defineField({
      name: 'amount',

      title: 'Nominal Penarikan',

      type: 'number',

      group: 'main',

      description:
        'Jumlah komisi yang diajukan untuk dicairkan.',

      validation: (Rule) =>
        Rule.required()
          .positive()
          .integer()
          .error(
            'Nominal penarikan harus berupa angka positif.'
          ),
    }),

    // =====================================================
    // STATUS
    // =====================================================

    defineField({
      name: 'status',

      title: 'Status Penarikan',

      type: 'string',

      group: 'main',

      initialValue: 'pending',

      options: {
        list: [
          {
            title: '⏳ Menunggu',
            value: 'pending',
          },

          {
            title: '✅ Disetujui',
            value: 'approved',
          },

          {
            title: '💸 Sudah Dibayar',
            value: 'paid',
          },

          {
            title: '❌ Ditolak',
            value: 'rejected',
          },

          {
            title: '🚫 Dibatalkan',
            value: 'cancelled',
          },
        ],

        layout: 'radio',
      },

      validation: (Rule) =>
        Rule.required()
          .custom((value) => {
            const allowedStatus = [
              'pending',
              'approved',
              'paid',
              'rejected',
              'cancelled',
            ];

            if (!value) {
              return 'Status wajib dipilih.';
            }

            if (!allowedStatus.includes(value)) {
              return 'Status penarikan tidak valid.';
            }

            return true;
          }),
    }),

    // =====================================================
    // TANGGAL PENGAJUAN
    // =====================================================

    defineField({
      name: 'requestedAt',

      title: 'Tanggal Pengajuan',

      type: 'datetime',

      group: 'main',

      initialValue: () =>
        new Date().toISOString(),

      readOnly: true,

      validation: (Rule) =>
        Rule.required().error(
          'Tanggal pengajuan wajib tersedia.'
        ),
    }),

    // =====================================================
    // TANGGAL DIPROSES
    // =====================================================

    defineField({
      name: 'processedAt',

      title: 'Tanggal Diproses',

      type: 'datetime',

      group: 'main',

      description:
        'Tanggal ketika admin mulai menyetujui atau memproses pengajuan.',
    }),

    // =====================================================
    // REKENING TUJUAN
    // =====================================================

    defineField({
      name: 'bankName',

      title: 'Bank / E-Wallet',

      type: 'string',

      group: 'payment',

      description:
        'Snapshot bank atau e-wallet fundraiser saat pengajuan dibuat.',

      readOnly: true,
    }),

    defineField({
      name: 'accountNumber',

      title: 'Nomor Rekening',

      type: 'string',

      group: 'payment',

      description:
        'Nomor rekening tujuan pencairan.',

      readOnly: true,
    }),

    defineField({
      name: 'accountName',

      title: 'Nama Pemilik Rekening',

      type: 'string',

      group: 'payment',

      description:
        'Nama pemilik rekening sesuai data fundraiser.',

      readOnly: true,
    }),

    // =====================================================
    // TANGGAL DIBAYAR
    // =====================================================

    defineField({
      name: 'paidAt',

      title: 'Tanggal Dibayar',

      type: 'datetime',

      group: 'payment',

      description:
        'Isi setelah dana benar-benar ditransfer kepada fundraiser.',

      hidden: ({ document }) =>
        document?.status !== 'paid',

      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status =
            context.document?.status;

          if (
            status === 'paid' &&
            !value
          ) {
            return 'Tanggal pembayaran wajib diisi jika status sudah dibayar.';
          }

          return true;
        }),
    }),

    // =====================================================
    // NOMOR REFERENSI TRANSFER
    // =====================================================

    defineField({
      name: 'referenceNumber',

      title: 'Nomor Referensi Pembayaran',

      type: 'string',

      group: 'payment',

      description:
        'Nomor referensi transfer dari bank, e-wallet, atau payment gateway.',

      hidden: ({ document }) =>
        document?.status !== 'paid',

      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status =
            context.document?.status;

          if (
            status === 'paid' &&
            !value
          ) {
            return 'Nomor referensi pembayaran wajib diisi jika status sudah dibayar.';
          }

          return true;
        }),
    }),

    // =====================================================
    // CATATAN FUNDRAISER
    // =====================================================

    defineField({
      name: 'note',

      title: 'Catatan Fundraiser',

      type: 'text',

      group: 'notes',

      rows: 3,

      description:
        'Catatan tambahan yang dikirim fundraiser ketika mengajukan pencairan.',

      readOnly: true,

      validation: (Rule) =>
        Rule.max(500),
    }),

    // =====================================================
    // CATATAN ADMIN
    // =====================================================

    defineField({
      name: 'adminNote',

      title: 'Catatan Admin',

      type: 'text',

      group: 'notes',

      rows: 4,

      description:
        'Catatan internal admin, misalnya alasan penolakan atau informasi transfer.',

      validation: (Rule) =>
        Rule.max(1000),
    }),

    // =====================================================
    // SNAPSHOT PERHITUNGAN KOMISI
    // =====================================================
    //
    // Bagian ini dibuat otomatis oleh:
    //
    // POST /api/fundraiser/withdraw
    //
    // Tidak perlu diubah admin.
    //
    // Sangat berguna untuk audit jika suatu hari nominal
    // komisi atau transaksi berubah.
    //
    // =====================================================

    defineField({
      name: 'commissionSnapshot',

      title: 'Snapshot Perhitungan Komisi',

      type: 'object',

      group: 'audit',

      readOnly: true,

      description:
        'Data perhitungan saldo ketika permintaan penarikan dibuat.',

      fields: [
        // =================================================
        // TOTAL DONASI
        // =================================================

        defineField({
          name: 'totalEarnings',

          title: 'Total Dana Dihimpun',

          type: 'number',
        }),

        // =================================================
        // RATE
        // =================================================

        defineField({
          name: 'commissionRate',

          title: 'Rate Komisi',

          type: 'number',

          description:
            'Contoh: 0.1 berarti 10%.',
        }),

        // =================================================
        // TOTAL KOMISI
        // =================================================

        defineField({
          name: 'totalCommission',

          title: 'Total Hak Komisi',

          type: 'number',
        }),

        // =================================================
        // SUDAH DICAIRKAN
        // =================================================

        defineField({
          name: 'totalWithdrawn',

          title: 'Sudah Dicairkan',

          type: 'number',
        }),

        // =================================================
        // PENDING SEBELUMNYA
        // =================================================

        defineField({
          name: 'pendingBefore',

          title: 'Penarikan Pending Sebelumnya',

          type: 'number',
        }),

        // =================================================
        // SALDO SEBELUM
        // =================================================

        defineField({
          name: 'availableBefore',

          title: 'Saldo Sebelum Pengajuan',

          type: 'number',
        }),

        // =================================================
        // NOMINAL PENGAJUAN
        // =================================================

        defineField({
          name: 'requestedAmount',

          title: 'Nominal Pengajuan',

          type: 'number',
        }),

        // =================================================
        // SALDO SESUDAH
        // =================================================

        defineField({
          name: 'availableAfter',

          title: 'Sisa Saldo Setelah Pengajuan',

          type: 'number',
        }),
      ],
    }),
  ],

  // =======================================================
  // PREVIEW DI SANITY STUDIO
  // =======================================================

  preview: {
    select: {
      name: 'fundraiser.name',

      phone: 'fundraiserPhone',

      amount: 'amount',

      status: 'status',

      requestedAt: 'requestedAt',

      bankName: 'bankName',
    },

    prepare({
      name,
      phone,
      amount,
      status,
      requestedAt,
      bankName,
    }) {
      // ===================================================
      // LABEL STATUS
      // ===================================================

      const statusLabel: Record<
        string,
        string
      > = {
        pending: '⏳ Menunggu',

        approved: '✅ Disetujui',

        paid: '💸 Sudah Dibayar',

        rejected: '❌ Ditolak',

        cancelled: '🚫 Dibatalkan',
      };

      // ===================================================
      // FORMAT NOMINAL
      // ===================================================

      const formattedAmount =
        Number(
          amount || 0
        ).toLocaleString('id-ID');

      // ===================================================
      // FORMAT TANGGAL
      // ===================================================

      let formattedDate = '';

      if (requestedAt) {
        try {
          formattedDate =
            new Intl.DateTimeFormat(
              'id-ID',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            ).format(
              new Date(requestedAt)
            );
        } catch {
          formattedDate = '';
        }
      }

      // ===================================================
      // SUBTITLE
      // ===================================================

      const subtitleParts = [
        statusLabel[
          String(status || '')
        ] || 'Status Tidak Diketahui',

        `Rp ${formattedAmount}`,

        bankName || null,

        formattedDate || null,
      ].filter(Boolean);

      return {
        title:
          name ||
          phone ||
          'Fundraiser',

        subtitle:
          subtitleParts.join(' • '),
      };
    },
  },

  // =======================================================
  // ORDERING
  // =======================================================

  orderings: [
    // =====================================================
    // TERBARU
    // =====================================================

    {
      title: 'Pengajuan Terbaru',

      name: 'requestedAtDesc',

      by: [
        {
          field: 'requestedAt',

          direction: 'desc',
        },
      ],
    },

    // =====================================================
    // TERLAMA
    // =====================================================

    {
      title: 'Pengajuan Terlama',

      name: 'requestedAtAsc',

      by: [
        {
          field: 'requestedAt',

          direction: 'asc',
        },
      ],
    },

    // =====================================================
    // NOMINAL TERBESAR
    // =====================================================

    {
      title: 'Nominal Terbesar',

      name: 'amountDesc',

      by: [
        {
          field: 'amount',

          direction: 'desc',
        },
      ],
    },

    // =====================================================
    // NOMINAL TERKECIL
    // =====================================================

    {
      title: 'Nominal Terkecil',

      name: 'amountAsc',

      by: [
        {
          field: 'amount',

          direction: 'asc',
        },
      ],
    },
  ],
});