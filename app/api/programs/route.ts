// app/api/programs/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const client = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lsnco71s',

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  apiVersion: '2026-01-01',

  useCdn: false,

  token:
    process.env.SANITY_API_READ_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN ||
    undefined,
});

function safeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const number = Number(
      value.replace(/[^\d.-]/g, '')
    );

    return Number.isFinite(number) ? number : 0;
  }

  return 0;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export async function GET() {
  try {
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
        donors
      }
    `;

    const programs = await client.fetch<any[]>(
      query,
      {},
      {
        cache: 'no-store',
      }
    );

    const data = programs.map((program) => {
      const collectedRaw = safeNumber(
        program.collectedRaw
      );

      const targetAmount =
        safeNumber(program.targetAmount) ||
        50000000;

      return {
        id: program._id,
        _id: program._id,

        slug: program.slug || '',

        title:
          program.title || 'Program Donasi',

        category:
          program.category || 'Kemanusiaan',

        image:
          program.image ||
          'https://via.placeholder.com/385x176?text=No+Image',

        collected:
          formatRupiah(collectedRaw),

        collectedRaw,

        target:
          formatRupiah(targetAmount),

        targetAmount,

        description:
          program.description || null,

        donors:
          Array.isArray(program.donors)
            ? program.donors
            : [],

        reports: [],
      };
    });

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          count: data.length,
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
        },
      }
    );
  } catch (error: unknown) {
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