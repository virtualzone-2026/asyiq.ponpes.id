// sanity/schemaTypes/fundraiserWithdrawal.ts

import { defineField, defineType } from 'sanity';

export const fundraiserWithdrawal = defineType({
  name: 'fundraiserWithdrawal',
  title: 'Penarikan Komisi Fundraiser',
  type: 'document',

  fields: [
    defineField({
      name: 'fundraiser',
      title: 'Fundraiser',
      type: 'reference',
      to: [{ type: 'fundraiser' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'fundraiserPhone',
      title: 'Nomor WhatsApp Fundraiser',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'amount',
      title: 'Nominal Penarikan',
      type: 'number',
      validation: (Rule) =>
        Rule.required().positive(),
    }),

    defineField({
      name: 'status',
      title: 'Status Penarikan',
      type: 'string',
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

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'requestedAt',
      title: 'Tanggal Pengajuan',
      type: 'datetime',
      initialValue: () =>
        new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'processedAt',
      title: 'Tanggal Diproses',
      type: 'datetime',
    }),

    defineField({
      name: 'paidAt',
      title: 'Tanggal Dibayar',
      type: 'datetime',
      hidden: ({ document }) =>
        document?.status !== 'paid',
    }),

    defineField({
      name: 'bankName',
      title: 'Bank / E-Wallet',
      type: 'string',
    }),

    defineField({
      name: 'accountNumber',
      title: 'Nomor Rekening',
      type: 'string',
    }),

    defineField({
      name: 'accountName',
      title: 'Nama Pemilik Rekening',
      type: 'string',
    }),

    defineField({
      name: 'referenceNumber',
      title: 'Nomor Referensi Pembayaran',
      type: 'string',
      description:
        'Nomor referensi transfer dari bank atau payment gateway.',
      hidden: ({ document }) =>
        document?.status !== 'paid',
    }),

    defineField({
      name: 'note',
      title: 'Catatan Fundraiser',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'adminNote',
      title: 'Catatan Admin',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: {
      name: 'fundraiser.name',
      amount: 'amount',
      status: 'status',
      phone: 'fundraiserPhone',
    },

    prepare({
      name,
      amount,
      status,
      phone,
    }) {
      const statusLabel: Record<
        string,
        string
      > = {
        pending: '⏳ Menunggu',
        approved: '✅ Disetujui',
        paid: '💸 Dibayar',
        rejected: '❌ Ditolak',
        cancelled: '🚫 Dibatalkan',
      };

      return {
        title:
          name ||
          phone ||
          'Fundraiser',

        subtitle: `${statusLabel[status] || status} • Rp ${Number(
          amount || 0
        ).toLocaleString('id-ID')}`,
      };
    },
  },

  orderings: [
    {
      title: 'Terbaru',
      name: 'requestedAtDesc',
      by: [
        {
          field: 'requestedAt',
          direction: 'desc',
        },
      ],
    },

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
  ],
});