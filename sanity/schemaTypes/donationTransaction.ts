import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'donationTransaction',
  title: 'Donation Transaction',
  type: 'document',

  fields: [
    // ============================================================
    // IDENTITAS TRANSAKSI PAKASIR
    // ============================================================

    defineField({
      name: 'txnId',
      title: 'Pakasir Transaction ID',
      type: 'string',
      readOnly: true,
    }),

    defineField({
      name: 'orderId',
      title: 'Order ID / Invoice',
      type: 'string',
      readOnly: true,
    }),

    defineField({
      name: 'pakasirProject',
      title: 'Pakasir Project',
      type: 'string',
      readOnly: true,
    }),

    // ============================================================
    // DATA DONATUR
    // ============================================================

    defineField({
      name: 'donorName',
      title: 'Nama Donatur',
      type: 'string',
    }),

    defineField({
      name: 'donorPhone',
      title: 'Nomor WhatsApp Donatur',
      type: 'string',
    }),

    // ============================================================
    // TARGET PROGRAM
    // ============================================================

    defineField({
      name: 'slug',
      title: 'Target Program Slug',
      type: 'string',
      readOnly: true,
    }),

    // ============================================================
    // NOMINAL TRANSAKSI
    // ============================================================

    defineField({
      name: 'amount',
      title: 'Nominal Donasi',
      type: 'number',
      readOnly: true,
    }),

    defineField({
      name: 'fee',
      title: 'Fee Pakasir',
      type: 'number',
      readOnly: true,
    }),

    defineField({
      name: 'totalAmount',
      title: 'Total Pembayaran',
      type: 'number',
      readOnly: true,
    }),

    // ============================================================
    // METODE PEMBAYARAN
    // ============================================================

    defineField({
      name: 'paymentMethod',
      title: 'Metode Pembayaran',
      type: 'string',
      readOnly: true,
    }),

    defineField({
      name: 'paymentUrl',
      title: 'URL Pembayaran Pakasir',
      type: 'url',
      readOnly: true,
    }),

    defineField({
      name: 'paymentNumber',
      title: 'Nomor Pembayaran',
      type: 'string',
      readOnly: true,
    }),

    defineField({
      name: 'qrString',
      title: 'QRIS String',
      type: 'text',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'vaNumber',
      title: 'Nomor Virtual Account',
      type: 'string',
      readOnly: true,
    }),

    // ============================================================
    // MASA BERLAKU PEMBAYARAN
    // ============================================================

    defineField({
      name: 'expiredAt',
      title: 'Pembayaran Kedaluwarsa',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'isSandbox',
      title: 'Sandbox',
      type: 'boolean',
      readOnly: true,
    }),

    // ============================================================
    // STATUS PEMBAYARAN
    // ============================================================

    defineField({
      name: 'status',
      title: 'Status Pembayaran',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {
            title: 'Pending',
            value: 'pending',
          },
          {
            title: 'Success',
            value: 'success',
          },
          {
            title: 'Failed',
            value: 'failed',
          },
        ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
    }),

    defineField({
      name: 'gatewayStatus',
      title: 'Status Gateway Pakasir',
      type: 'string',
      readOnly: true,
    }),

    // ============================================================
    // WAKTU TRANSAKSI
    // ============================================================

    defineField({
      name: 'createdAt',
      title: 'Waktu Transaksi',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'createdAtWib',
      title: 'Waktu Transaksi (WIB)',
      type: 'string',
      readOnly: true,
    }),

    defineField({
      name: 'completedAt',
      title: 'Waktu Pembayaran Berhasil',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'paidAt',
      title: 'Waktu Dibayar',
      type: 'datetime',
      readOnly: true,
    }),

    // ============================================================
    // FUNDRAISER / RELAWAN
    // ============================================================

    defineField({
      name: 'fundraiserPhone',
      title: 'Nomor WhatsApp Fundraiser',
      type: 'string',
      readOnly: true,
    }),
  ],

  // ================================================================
  // PREVIEW DI SANITY STUDIO
  // ================================================================

  preview: {
    select: {
      title: 'donorName',
      orderId: 'orderId',
      amount: 'amount',
      status: 'status',
      paymentMethod: 'paymentMethod',
      txnId: 'txnId',
    },

    prepare({
      title,
      orderId,
      amount,
      status,
      paymentMethod,
      txnId,
    }) {
      const formattedAmount =
        typeof amount === 'number'
          ? new Intl.NumberFormat('id-ID').format(amount)
          : '-';

      return {
        title: title || 'Hamba Allah',
        subtitle:
          `${orderId || '-'} • Rp ${formattedAmount} • ` +
          `${paymentMethod || '-'} • ${status || 'pending'}`,
        media: undefined,
      };
    },
  },
});