// app/api/programs/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// ============================================================================
// KONFIGURASI
// ============================================================================
//
// PENTING:
// Endpoint ini menampilkan nominal donasi.
// Karena collectedRaw dapat berubah setelah pembayaran sukses,
// JANGAN menggunakan Sanity CDN / cache lama di sini.
//
// ============================================================================

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// SANITY CLIENT
// ============================================================================
//
// useCdn: false
// = selalu membaca data terbaru dari Sanity.
//
// Tidak perlu SANITY_API_WRITE_TOKEN karena endpoint ini hanya membaca data.
//
// ============================================================================

const client = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    'lsnco71s',

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',

  apiVersion: '2026-01-01',

  useCdn: false,
});

// ============================================================================
// HELPER
// ============================================================================

function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return fallback;
  }

  return number;
}

// ============================================================================
// GET PROGRAM
// ============================================================================

export async function GET() {
  try {
    // ========================================================================
    // QUERY
    // ========================================================================
    //
    // _id sengaja dikembalikan karena CampaignDetailClient menggunakan:
    //
    // program?._id || program?.id
    //
    // collectedRaw juga dibaca langsung dari Sanity.
    //
    // ========================================================================

    const query = `
      *[_type == "program"]
      | order(_createdAt desc)
      {
        _id,

        "id": _id,

        "slug": slug.current,

        title,

        category,

        "image": image.asset->url,

        collectedRaw,

        targetAmount,

        description,

        donors,

        reports
      }
    `;

    // ========================================================================
    // FETCH TANPA CDN
    // ========================================================================
    //
    // Ini bagian paling penting untuk kasus:
    //
    // Sanity:
    // status = Success
    // gatewayStatus = completed
    // collectedRaw = sudah bertambah
    //
    // tetapi website masih menampilkan Rp 0.
    //
    // useCdn:false memastikan request membaca data terbaru.
    //
    // ========================================================================

    const sanityPrograms =
      await client.fetch(
        query,
        {},
        {
          cache: 'no-store',
          next: {
            revalidate: 0,
          },
        }
      );

    // ========================================================================
    // VALIDASI DATA
    // ========================================================================

    if (
      !Array.isArray(
        sanityPrograms
      )
    ) {
      throw new Error(
        'Data program dari Sanity tidak valid.'
      );
    }

    // ========================================================================
    // FORMAT DATA
    // ========================================================================

    const formattedData =
      sanityPrograms.map(
        (program: any) => {
          const rawAmount =
            safeNumber(
              program?.collectedRaw,
              0
            );

          const targetAmount =
            safeNumber(
              program?.targetAmount,
              50_000_000
            );

          return {
            // ================================================================
            // IDENTITAS
            // ================================================================

            _id:
              program?._id ||
              null,

            id:
              program?.id ||
              program?._id ||
              null,

            slug:
              typeof program?.slug ===
                'string'
                ? program.slug
                : '',

            title:
              typeof program?.title ===
                'string'
                ? program.title
                : 'Program Donasi',

            // ================================================================
            // KATEGORI
            // ================================================================

            category:
              typeof program?.category ===
                'string' &&
              program.category.trim()
                ? program.category
                : 'Kemanusiaan',

            // ================================================================
            // IMAGE
            // ================================================================

            image:
              typeof program?.image ===
                'string' &&
              program.image.trim()
                ? program.image
                : '/images/placeholder.jpg',

            // ================================================================
            // DANA TERKUMPUL
            // ================================================================

            collected:
              `Rp ${rawAmount.toLocaleString(
                'id-ID'
              )}`,

            collectedRaw:
              rawAmount,

            // ================================================================
            // TARGET
            // ================================================================

            target:
              `Rp ${targetAmount.toLocaleString(
                'id-ID'
              )}`,

            targetAmount:
              targetAmount,

            // ================================================================
            // DESKRIPSI
            // ================================================================

            description:
              program?.description ||
              null,

            // ================================================================
            // DONATUR
            // ================================================================

            donors:
              Array.isArray(
                program?.donors
              )
                ? program.donors
                : [],

            // ================================================================
            // LAPORAN
            // ================================================================

            reports:
              Array.isArray(
                program?.reports
              )
                ? program.reports
                : [],
          };
        }
      );

    // ========================================================================
    // RESPONSE
    // ========================================================================
    //
    // JANGAN gunakan:
    //
    // s-maxage=60
    //
    // karena angka donasi harus segera berubah setelah webhook Pakasir
    // memperbarui collectedRaw.
    //
    // ========================================================================

    return NextResponse.json(
      {
        success: true,

        data: formattedData,

        meta: {
          count:
            formattedData.length,

          fetchedAt:
            new Date().toISOString(),
        },
      },
      {
        status: 200,

        headers: {
          'Content-Type':
            'application/json',

          // Tidak boleh disimpan oleh browser/CDN.
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',

          Pragma:
            'no-cache',

          Expires:
            '0',
        },
      }
    );

  } catch (error: unknown) {

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    console.error(
      '🔥 [API PROGRAMS] Sanity Fetch Error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data program dari Sanity.';

    return NextResponse.json(
      {
        success: false,

        error:
          message,

        data: [],
      },
      {
        status: 500,

        headers: {
          'Content-Type':
            'application/json',

          'Cache-Control':
            'no-store',
          },
        }
      }
    );
  }
}