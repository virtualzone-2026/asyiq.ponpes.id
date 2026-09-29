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

const sanityToken = process.env.SANITY_API_WRITE_TOKEN;

const pakasirApiKey = process.env.PAKASIR_API_KEY;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.asyiq.ponpes.id';

// ==========================================================
// SANITY CLIENT
// ==========================================================

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,

  // PENTING:
  // Token hanya dibaca dari server ENV
  token: sanityToken,
});

// ==========================================================
// POST CHECKOUT
// ==========================================================

export async function POST(request: Request) {
  try {
    // ======================================================
    // VALIDASI ENV SERVER
    // ======================================================

    if (!sanityToken) {
      console.error(
        '❌ SANITY_API_WRITE_TOKEN belum tersedia di environment variable.'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Konfigurasi Sanity server belum lengkap.',
        },
        { status: 500 }
      );
    }

    if (!pakasirApiKey) {
      console.error(
        '❌ PAKASIR_API_KEY belum tersedia di environment variable.'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Konfigurasi payment gateway belum lengkap.',
        },
        { status: 500 }
      );
    }

    // ======================================================
    // BODY REQUEST
    // ======================================================

    const body = await request.json();

    const slug = String(body.slug || '').trim();

    const donorName = String(
      body.donorName ||
        body.name ||
        'Hamba Allah'
    ).trim();

    const donorPhone = String(
      body.donorPhone ||
        body.phone ||
        body.whatsapp ||
        ''
    ).trim();

    // ======================================================
    // FUNDRAISER
    // ======================================================

    const fundraiserPhone = String(
      body.fundraiserPhone ||
        body.referral ||
        ''
    ).trim();

    // ======================================================
    // PAYMENT METHOD
    // ======================================================

    const paymentMethod =
      body.paymentMethod || 'qris';

    const cleanMethod = String(paymentMethod)
      .toLowerCase()
      .trim();

    // ======================================================
    // AMOUNT
    // ======================================================

    const rawAmount =
      body.amount ||
      body.nominal ||
      0;

    const cleanAmountNumber = Number(
      String(rawAmount).replace(/\D/g, '')
    );

    if (
      !slug ||
      !cleanAmountNumber ||
      cleanAmountNumber < 1000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Data tidak valid. Minimal donasi adalah Rp 1.000',
        },
        { status: 400 }
      );
    }

    // ======================================================
    // ORDER ID
    // ======================================================

    const cleanSlug = slug.toUpperCase();

    let prefix = 'ASYIQ';

    if (cleanSlug.includes('ASRAMA')) {
      prefix = 'ASRAMA';
    } else if (cleanSlug.includes('SANTRI')) {
      prefix = 'SANTRI';
    }

    const generatedOrderId =
      `INV-${prefix}-${Date.now()}`;

    // ======================================================
    // PAKASIR
    // ======================================================

    const pakasirProjectSlug =
      'pondok-pesantren-aasyiqul-quran';

    const targetPakasirUrl =
      `https://app.pakasir.com/api/transactioncreate/${cleanMethod}`;

    console.log(
      `💳 Membuat transaksi Pakasir: ${generatedOrderId}`
    );

    const pakasirResponse = await fetch(
      targetPakasirUrl,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          project: pakasirProjectSlug,
          order_id: generatedOrderId,
          amount: cleanAmountNumber,
          api_key: pakasirApiKey,
        }),

        cache: 'no-store',
      }
    );

    // ======================================================
    // PARSE RESPONSE PAKASIR
    // ======================================================

    let pakasirData: any;

    try {
      pakasirData =
        await pakasirResponse.json();
    } catch {
      throw new Error(
        'Response payment gateway tidak valid.'
      );
    }

    console.log(
      '📦 Response Pakasir:',
      {
        status: pakasirResponse.status,
        hasPayment: !!pakasirData?.payment,
      }
    );

    if (
      !pakasirResponse.ok ||
      !pakasirData?.payment
    ) {
      throw new Error(
        pakasirData?.message ||
          `Gagal membuat transaksi ${cleanMethod}.`
      );
    }

    // ======================================================
    // PAYMENT NUMBER
    // ======================================================

    const paymentNumber =
      pakasirData.payment.payment_number || '';

    // ======================================================
    // PAYMENT URL
    // ======================================================

    const isQrisOnly =
      cleanMethod === 'qris'
        ? '&qris_only=1'
        : '';

    const redirectUrl =
      `${siteUrl}/thank-you?order_id=${generatedOrderId}`;

    const fallbackUrlWeb =
      `https://app.pakasir.com/pay/` +
      `${pakasirProjectSlug}/` +
      `${cleanAmountNumber}` +
      `?order_id=${generatedOrderId}` +
      `${isQrisOnly}` +
      `&redirect=${encodeURIComponent(
        redirectUrl
      )}`;

    const paymentUrl =
      pakasirData.payment.payment_url ||
      fallbackUrlWeb;

    // ======================================================
    // WIB TIMESTAMP
    // ======================================================

    const currentWibTimestamp =
      new Date().toLocaleString(
        'id-ID',
        {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'medium',
          timeStyle: 'medium',
        }
      );

    // ======================================================
    // SIMPAN SANITY
    // ======================================================

    try {
      const createdTransaction =
        await client.create({
          _type: 'donationTransaction',

          orderId:
            String(generatedOrderId),

          donorName:
            String(donorName),

          donorPhone:
            String(donorPhone),

          amount:
            Number(cleanAmountNumber),

          totalAmount:
            Number(
              pakasirData.payment
                .total_payment ||
                cleanAmountNumber
            ),

          status: 'pending',

          slug:
            String(slug),

          paymentMethod:
            String(cleanMethod),

          paymentUrl:
            String(paymentUrl),

          paymentNumber:
            String(paymentNumber),

          fundraiserPhone:
            fundraiserPhone
              ? String(
                  fundraiserPhone
                ).trim()
              : '',

          createdAtWib:
            currentWibTimestamp,
        });

      console.log(
        `✅ TRANSAKSI SANITY BERHASIL:`,
        createdTransaction._id
      );

    } catch (sanityError: any) {
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
            Boolean(sanityToken),
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
    // GOOGLE SHEET
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
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              orderId:
                generatedOrderId,

              donorName:
                String(donorName),

              donorPhone:
                `'${String(
                  donorPhone
                )}`,

              amount:
                cleanAmountNumber,

              programSlug:
                String(slug),

              paymentMethod:
                cleanMethod,

              fundraiserPhone:
                fundraiserPhone
                  ? `'${String(
                      fundraiserPhone
                    )}`
                  : '-',

              status:
                'pending',

              createdAt:
                currentWibTimestamp,
            }),
          }
        );

        console.log(
          `📊 GOOGLE SHEET BERHASIL: ${generatedOrderId}`
        );
      } catch (sheetError) {
        // Google Sheet tidak boleh menggagalkan transaksi utama
        console.error(
          '⚠️ GOOGLE SHEET ERROR:',
          sheetError
        );
      }
    }

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return NextResponse.json({
      success: true,

      orderId:
        generatedOrderId,

      amount:
        cleanAmountNumber,

      paymentMethod:
        cleanMethod,

      paymentUrl,

      paymentNumber,
    });

  } catch (error: any) {
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
        success: false,

        error:
          error?.message ||
          'Terjadi kesalahan saat membuat transaksi.',
      },
      {
        status: 500,
      }
    );
  }
}