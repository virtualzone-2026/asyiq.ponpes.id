import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ==========================================================
// ENVIRONMENT
// ==========================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lsnco71s';

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const sanityToken =
  process.env.SANITY_API_WRITE_TOKEN || '';

const pakasirApiKey =
  process.env.PAKASIR_API_KEY || '';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.asyiq.ponpes.id';

// ==========================================================
// PAKASIR CONFIG
// ==========================================================

const pakasirProjectSlug =
  'pondok-pesantren-aasyiqul-quran';

// ==========================================================
// SANITY CLIENT
// ==========================================================

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: sanityToken,
});

// ==========================================================
// TYPES
// ==========================================================

type PaymentMethod =
  | 'payment_link'
  | 'qris'
  | 'bri_va'
  | 'bni_va'
  | 'cimb_niaga_va'
  | 'permata_va'
  | 'maybank_va'
  | 'bnc_va'
  | 'artha_graha_va'
  | 'sampoerna_va';

interface PakasirCreateResponse {
  txn_id?: string;

  project?: string;
  order_id?: string;

  amount?: number;
  fee?: number;
  total_payment?: number;

  payment_method?: string;

  qr_string?: string;
  va_number?: string;

  expired_at?: string;

  payment_link?: string;

  is_sandbox?: boolean;

  message?: string;
  error?: string;
}

// ==========================================================
// PAYMENT METHODS
// ==========================================================

const PAYMENT_METHODS: PaymentMethod[] = [
  'payment_link',
  'qris',
  'bri_va',
  'bni_va',
  'cimb_niaga_va',
  'permata_va',
  'maybank_va',
  'bnc_va',
  'artha_graha_va',
  'sampoerna_va',
];

// ==========================================================
// HELPERS
// ==========================================================

function isValidPaymentMethod(
  value: string
): value is PaymentMethod {
  return PAYMENT_METHODS.includes(
    value as PaymentMethod
  );
}

function getMinimumAmount(
  method: PaymentMethod
): number {
  if (
    method === 'payment_link' ||
    method === 'qris'
  ) {
    return 500;
  }

  return 10000;
}

function getMaximumAmount(
  method: PaymentMethod
): number {
  if (method === 'qris') {
    return 10000000;
  }

  return 50000000;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat(
    'id-ID'
  ).format(value);
}

// ==========================================================
// POST CHECKOUT
// ==========================================================

export async function POST(
  request: Request
) {
  try {
    // ======================================================
    // ENV VALIDATION
    // ======================================================

    if (!sanityToken) {
      console.error(
        '❌ SANITY_API_WRITE_TOKEN belum tersedia.'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Konfigurasi Sanity server belum lengkap.',
        },
        {
          status: 500,
        }
      );
    }

    if (!pakasirApiKey) {
      console.error(
        '❌ PAKASIR_API_KEY belum tersedia.'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Konfigurasi Pakasir belum lengkap.',
        },
        {
          status: 500,
        }
      );
    }

    // ======================================================
    // REQUEST BODY
    // ======================================================

    const body =
      await request.json();

    const slug =
      String(
        body?.slug || ''
      ).trim();

    const donorName =
      String(
        body?.donorName ||
        body?.name ||
        'Hamba Allah'
      ).trim();

    const donorPhone =
      String(
        body?.donorPhone ||
        body?.phone ||
        body?.whatsapp ||
        ''
      ).trim();

    const fundraiserPhone =
      String(
        body?.fundraiserPhone ||
        body?.referral ||
        ''
      ).trim();

    // ======================================================
    // PAYMENT METHOD
    // ======================================================

    const cleanMethod =
      String(
        body?.paymentMethod ||
        'qris'
      )
        .toLowerCase()
        .trim();

    if (
      !isValidPaymentMethod(
        cleanMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Metode pembayaran "${cleanMethod}" tidak tersedia.`,
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // AMOUNT
    // ======================================================

    const rawAmount =
      body?.amount ??
      body?.nominal ??
      0;

    const cleanAmountNumber =
      Number(
        String(rawAmount)
          .replace(/\D/g, '')
      );

    if (
      !slug ||
      !Number.isFinite(
        cleanAmountNumber
      ) ||
      cleanAmountNumber <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Data donasi tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // VALIDASI NOMINAL BERDASARKAN METODE
    // ======================================================

    const minimumAmount =
      getMinimumAmount(
        cleanMethod
      );

    const maximumAmount =
      getMaximumAmount(
        cleanMethod
      );

    if (
      cleanAmountNumber <
      minimumAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Minimal pembayaran untuk ${cleanMethod.toUpperCase()} adalah Rp ${formatRupiah(minimumAmount)}.`,
        },
        {
          status: 400,
        }
      );
    }

    if (
      cleanAmountNumber >
      maximumAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Maksimal pembayaran untuk ${cleanMethod.toUpperCase()} adalah Rp ${formatRupiah(maximumAmount)}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // ORDER ID
    // ======================================================

    const cleanSlug =
      slug.toUpperCase();

    let prefix =
      'ASYIQ';

    if (
      cleanSlug.includes(
        'ASRAMA'
      )
    ) {
      prefix =
        'ASRAMA';
    } else if (
      cleanSlug.includes(
        'SANTRI'
      )
    ) {
      prefix =
        'SANTRI';
    }

    const generatedOrderId =
      `INV-${prefix}-${Date.now()}`;

    // ======================================================
    // PAKASIR V2 ENDPOINT
    // ======================================================

    const targetPakasirUrl =
      `https://app.pakasir.com/api/v2/create-transaction/` +
      `${encodeURIComponent(pakasirProjectSlug)}/` +
      `${encodeURIComponent(generatedOrderId)}`;

    console.log(
      `💳 Membuat transaksi Pakasir v2: ${generatedOrderId}`
    );

    // ======================================================
    // CREATE TRANSACTION PAKASIR V2
    // ======================================================

    const pakasirResponse =
      await fetch(
        targetPakasirUrl,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',

            'X-Api-Key':
              pakasirApiKey,
          },

          body:
            JSON.stringify({
              method:
                cleanMethod,

              amount:
                cleanAmountNumber,
            }),

          cache:
            'no-store',
        }
      );

    // ======================================================
    // READ RESPONSE
    // ======================================================

    let pakasirData:
      PakasirCreateResponse;

    try {
      pakasirData =
        await pakasirResponse.json();
    } catch {
      throw new Error(
        'Response Pakasir tidak dapat dibaca.'
      );
    }

    if (
      !pakasirResponse.ok
    ) {
      console.error(
        '🔥 PAKASIR V2 ERROR:',
        {
          status:
            pakasirResponse.status,

          data:
            pakasirData,
        }
      );

      throw new Error(
        pakasirData?.message ||
        pakasirData?.error ||
        `Gagal membuat transaksi Pakasir. HTTP ${pakasirResponse.status}`
      );
    }

    // ======================================================
    // VALIDATE TXN ID
    // ======================================================

    const txnId =
      String(
        pakasirData?.txn_id ||
        ''
      ).trim();

    if (!txnId) {
      throw new Error(
        'Pakasir tidak mengembalikan txn_id.'
      );
    }

    // ======================================================
    // VALIDATE RESPONSE
    // ======================================================

    if (
      pakasirData.order_id &&
      pakasirData.order_id !==
        generatedOrderId
    ) {
      throw new Error(
        'Order ID response Pakasir tidak cocok.'
      );
    }

    if (
      pakasirData.amount !==
        undefined &&
      Number(
        pakasirData.amount
      ) !== cleanAmountNumber
    ) {
      throw new Error(
        'Nominal response Pakasir tidak cocok.'
      );
    }

    if (
      pakasirData.project &&
      pakasirData.project !==
        pakasirProjectSlug
    ) {
      throw new Error(
        'Project Pakasir tidak cocok.'
      );
    }

    // ======================================================
    // PAYMENT DATA
    // ======================================================

    const fee =
      Number(
        pakasirData.fee || 0
      );

    const totalPayment =
      Number(
        pakasirData.total_payment ||
        cleanAmountNumber
      );

    const paymentMethod =
      String(
        pakasirData.payment_method ||
        cleanMethod
      );

    const qrString =
      String(
        pakasirData.qr_string ||
        ''
      );

    const vaNumber =
      String(
        pakasirData.va_number ||
        ''
      );

    const expiredAt =
      pakasirData.expired_at
        ? String(
            pakasirData.expired_at
          )
        : null;

    const isSandbox =
      Boolean(
        pakasirData.is_sandbox
      );

    // ======================================================
    // PAYMENT URL
    // ======================================================

    const redirectUrl =
      `${siteUrl}/thank-you?order_id=${encodeURIComponent(generatedOrderId)}`;

    let paymentUrl = '';

    if (
      cleanMethod ===
      'payment_link'
    ) {
      const rawPaymentLink =
        String(
          pakasirData.payment_link ||
          ''
        ).trim();

      if (!rawPaymentLink) {
        throw new Error(
          'Pakasir tidak mengembalikan payment_link.'
        );
      }

      const separator =
        rawPaymentLink.includes('?')
          ? '&'
          : '?';

      paymentUrl =
        `${rawPaymentLink}` +
        `${separator}redirect=${encodeURIComponent(redirectUrl)}`;

    } else {
      const params =
        new URLSearchParams();

      if (
        cleanMethod ===
        'qris'
      ) {
        params.set(
          'qris_only',
          '1'
        );
      }

      params.set(
        'redirect',
        redirectUrl
      );

      paymentUrl =
        `https://app.pakasir.com/pay-v2/${encodeURIComponent(txnId)}` +
        `?${params.toString()}`;
    }

    // ======================================================
    // LOCAL WIB TIME
    // ======================================================

    const createdAtIso =
      new Date().toISOString();

    const currentWibTimestamp =
      new Date().toLocaleString(
        'id-ID',
        {
          timeZone:
            'Asia/Jakarta',

          dateStyle:
            'medium',

          timeStyle:
            'medium',
        }
      );

    // ======================================================
    // SAVE SANITY
    // ======================================================

    try {
      const createdTransaction =
        await client.create({
          _type:
            'donationTransaction',

          // Pakasir
          txnId:
            txnId,

          orderId:
            generatedOrderId,

          pakasirProject:
            pakasirProjectSlug,

          // Donor
          donorName:
            donorName,

          donorPhone:
            donorPhone,

          // Program
          slug:
            slug,

          // Amount
          amount:
            cleanAmountNumber,

          fee:
            fee,

          totalAmount:
            totalPayment,

          // Payment
          paymentMethod:
            paymentMethod,

          paymentUrl:
            paymentUrl,

          qrString:
            qrString,

          vaNumber:
            vaNumber,

          expiredAt:
            expiredAt,

          isSandbox:
            isSandbox,

          // Status
          status:
            'pending',

          gatewayStatus:
            'pending',

          // Referral
          fundraiserPhone:
            fundraiserPhone,

          // Time
          createdAt:
            createdAtIso,

          createdAtWib:
            currentWibTimestamp,
        });

      console.log(
        `✅ TRANSAKSI SANITY TERSIMPAN: ${createdTransaction._id}`
      );
    } catch (
      sanityError: any
    ) {
      console.error(
        '🔥 SANITY CREATE ERROR:',
        {
          message:
            sanityError?.message,

          statusCode:
            sanityError?.statusCode,

          projectId,
          dataset,

          tokenAvailable:
            Boolean(
              sanityToken
            ),
        }
      );

      throw new Error(
        `Gagal menyimpan transaksi ke Sanity: ${
          sanityError?.message ||
          'Unknown Sanity error'
        }`
      );
    }

    // ======================================================
    // GOOGLE SHEET - PENDING
    // ======================================================

    const googleSheetScriptUrl =
      process.env
        .GOOGLE_SHEET_WEBHOOK_URL ||
      '';

    if (
      googleSheetScriptUrl.trim()
    ) {
      try {
        await fetch(
          googleSheetScriptUrl.trim(),
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                txnId:
                  txnId,

                orderId:
                  generatedOrderId,

                donorName:
                  donorName,

                donorPhone:
                  donorPhone
                    ? `'${donorPhone}`
                    : '',

                amount:
                  cleanAmountNumber,

                fee:
                  fee,

                totalPayment:
                  totalPayment,

                programSlug:
                  slug,

                paymentMethod:
                  paymentMethod,

                fundraiserPhone:
                  fundraiserPhone
                    ? `'${fundraiserPhone}`
                    : '-',

                status:
                  'pending',

                expiredAt:
                  expiredAt,

                createdAt:
                  currentWibTimestamp,
              }),
          }
        );

        console.log(
          `📊 GOOGLE SHEET PENDING TERCATAT: ${generatedOrderId}`
        );
      } catch (
        sheetError
      ) {
        console.error(
          '⚠️ GOOGLE SHEET ERROR:',
          sheetError
        );
      }
    }

    // ======================================================
    // RESPONSE TO FRONTEND
    // ======================================================

    return NextResponse.json({
      success:
        true,

      txnId:
        txnId,

      orderId:
        generatedOrderId,

      amount:
        cleanAmountNumber,

      fee:
        fee,

      totalPayment:
        totalPayment,

      paymentMethod:
        paymentMethod,

      paymentUrl:
        paymentUrl,

      qrString:
        qrString,

      vaNumber:
        vaNumber,

      expiredAt:
        expiredAt,

      isSandbox:
        isSandbox,

      // Untuk kompatibilitas frontend lama
      paymentNumber:
        vaNumber,
    });

  } catch (
    error: any
  ) {
    console.error(
      '🔥 CHECKOUT ERROR:',
      {
        message:
          error?.message,

        statusCode:
          error?.statusCode,

        stack:
          process.env.NODE_ENV ===
          'development'
            ? error?.stack
            : undefined,
      }
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          'Terjadi kesalahan saat membuat transaksi.',
      },
      {
        status:
          500,
      }
    );
  }
}