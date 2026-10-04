// app/api/campaign/[slug]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// ============================================================================
// KONFIGURASI
// ============================================================================
//
// Endpoint ini mengambil detail campaign berdasarkan slug.
//
// Karena data campaign dapat berubah setelah pembayaran,
// gunakan:
//   - force-dynamic
//   - useCdn: false
//   - cache: no-store
//
// ============================================================================

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// SANITY CLIENT
// ============================================================================
//
// JANGAN menaruh token langsung di source code.
//
// Jika data yang dibutuhkan hanya data publik, sebenarnya token tidak
// diperlukan. Jika project Sanity Anda membutuhkan token untuk membaca,
// gunakan SANITY_API_READ_TOKEN dari environment variable.
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

  ...(process.env.SANITY_API_READ_TOKEN
    ? {
        token:
          process.env.SANITY_API_READ_TOKEN,
      }
    : {}),
});

// ============================================================================
// GET CAMPAIGN
// ============================================================================

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    // ========================================================================
    // PARAMETER
    // ========================================================================

    const { slug } = await params;

    const cleanSlug =
      typeof slug === 'string'
        ? slug.trim()
        : '';

    if (!cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Slug campaign tidak valid.',
        },
        {
          status: 400,
          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    // ========================================================================
    // QUERY
    // ========================================================================
    //
    // Schema program Anda menggunakan:
    //
    // image
    // title
    // description
    // slug
    //
    // Namun tetap kita pertahankan kompatibilitas dengan schema lama yang
    // mungkin memiliki:
    //
    // mainImage
    // thumbnail
    // banner
    //
    // ========================================================================

    const query = `
      *[
        (_type == "program" || _type == "campaign")
        && slug.current == $slug
      ][0] {
        _id,
        _type,

        title,

        "slug": slug.current,

        description,

        "mainImageUrl":
          mainImage.asset->url,

        "imageUrl":
          image.asset->url,

        "thumbnailUrl":
          thumbnail.asset->url,

        "bannerUrl":
          banner.asset->url,

        collectedRaw,

        targetAmount,

        category,

        donors,

        reports
      }
    `;

    // ========================================================================
    // FETCH REAL-TIME
    // ========================================================================

    const data =
      await client.fetch(
        query,
        {
          slug: cleanSlug,
        },
        {
          cache: 'no-store',
          next: {
            revalidate: 0,
          },
        }
      );

    // ========================================================================
    // NOT FOUND
    // ========================================================================

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Campaign tidak ditemukan.',
        },
        {
          status: 404,
          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    // ========================================================================
    // PILIH GAMBAR
    // ========================================================================
    //
    // Prioritas:
    //
    // 1. image       ← schema program Anda sekarang
    // 2. mainImage   ← schema lama
    // 3. thumbnail
    // 4. banner
    //
    // ========================================================================

    const finalImageUrl =
      data.imageUrl ||
      data.mainImageUrl ||
      data.thumbnailUrl ||
      data.bannerUrl ||
      null;

    // ========================================================================
    // NORMALISASI DATA
    // ========================================================================

    const collectedRaw =
      Number(
        data.collectedRaw || 0
      );

    const targetAmount =
      Number(
        data.targetAmount ||
          50_000_000
      );

    // ========================================================================
    // RESPONSE
    // ========================================================================

    return NextResponse.json(
      {
        success: true,

        data: {
          _id:
            data._id || null,

          type:
            data._type || 'program',

          title:
            data.title || '',

          slug:
            data.slug ||
            cleanSlug,

          description:
            data.description ||
            null,

          imageUrl:
            finalImageUrl,

          category:
            data.category ||
            'Kemanusiaan',

          collectedRaw:
            Number.isFinite(
              collectedRaw
            )
              ? Math.max(
                  collectedRaw,
                  0
                )
              : 0,

          targetAmount:
            Number.isFinite(
              targetAmount
            )
              ? Math.max(
                  targetAmount,
                  1
                )
              : 50_000_000,

          donors:
            Array.isArray(
              data.donors
            )
              ? data.donors
              : [],

          reports:
            Array.isArray(
              data.reports
            )
              ? data.reports
              : [],
        },
      },
      {
        status: 200,

        headers: {
          'Content-Type':
            'application/json',

          // ================================================================
          // JANGAN CACHE
          // ================================================================

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
    // ERROR
    // ========================================================================

    console.error(
      '🔥 [API CAMPAIGN] Error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat mengambil data campaign.';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,

        headers: {
          'Cache-Control':
            'no-store',
        },
      }
    );
  }
}