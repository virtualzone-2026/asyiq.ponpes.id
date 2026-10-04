// app/api/programs/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// ============================================================================
// CONFIG
// ============================================================================

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// SANITY CLIENT
// ============================================================================

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lsnco71s';

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const token =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN ||
  undefined;

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-01-01',
  useCdn: false,
  token,
});

// ============================================================================
// TYPES
// ============================================================================

interface SanityProgram {
  _id: string;
  slug?: string;
  title?: string;
  category?: string;
  image?: string | null;
  collectedRaw?: number | null;
  targetAmount?: number | null;
  description?: unknown;
  donors?: unknown[];
  reports?: unknown[];
}

interface FormattedProgram {
  id: string;
  _id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  collected: string;
  collectedRaw: number;
  target: string;
  targetAmount: number;
  description: unknown;
  donors: unknown[];
  reports: unknown[];
}

// ============================================================================
// HELPERS
// ============================================================================

function safeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

// ============================================================================
// GET /api/programs
// ============================================================================

export async function GET() {
  try {
    // ========================================================================
    // QUERY SANITY
    // ========================================================================

    const query = `
      *[_type == "program"] | order(_createdAt desc) {
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
    // FETCH DATA
    // ========================================================================

    const sanityPrograms = await client.fetch<SanityProgram[]>(
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
    // NORMALISASI DATA
    // ========================================================================

    const formattedData: FormattedProgram[] =
      Array.isArray(sanityPrograms)
        ? sanityPrograms.map((program) => {
            const rawAmount = safeNumber(
              program.collectedRaw
            );

            const targetAmount =
              safeNumber(program.targetAmount) || 50000000;

            return {
              id: program._id,
              _id: program._id,

              slug: program.slug || '',

              title:
                program.title ||
                'Program Donasi',

              category:
                program.category ||
                'Kemanusiaan',

              image:
                program.image ||
                'https://via.placeholder.com/385x176?text=No+Image',

              collected:
                formatRupiah(rawAmount),

              collectedRaw:
                rawAmount,

              target:
                formatRupiah(targetAmount),

              targetAmount,

              description:
                program.description || null,

              donors:
                Array.isArray(program.donors)
                  ? program.donors
                  : [],

              reports:
                Array.isArray(program.reports)
                  ? program.reports
                  : [],
            };
          })
        : [];

    // ========================================================================
    // RESPONSE
    // ========================================================================

    return NextResponse.json(
      {
        success: true,

        data: formattedData,

        meta: {
          count: formattedData.length,
          fetchedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,

        headers: {
          'Content-Type': 'application/json',

          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',

          Pragma: 'no-cache',

          Expires: '0',

          Surrogate-Control: 'no-store',
        },
      }
    );
  } catch (error: unknown) {
    // ========================================================================
    // ERROR
    // ========================================================================

    console.error(
      '🔥 Sanity Fetch Error [/api/programs]:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Gagal mengambil data program.';

    return NextResponse.json(
      {
        success: false,

        error: message,

        data: [],
      },
      {
        status: 500,

        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}