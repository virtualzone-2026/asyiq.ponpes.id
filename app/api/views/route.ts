// app/api/views/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// ============================================================================
// TYPES
// ============================================================================

type ContentType =
  | 'blog'
  | 'campaign'
  | 'fundraiser';

// ============================================================================
// VALIDATOR
// ============================================================================

function isValidType(
  value: unknown
): value is ContentType {
  return (
    value === 'blog' ||
    value === 'campaign' ||
    value === 'fundraiser'
  );
}

function isValidKey(
  value: unknown
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 300
  );
}

// ============================================================================
// BOT DETECTOR
// ============================================================================

function isBot(userAgent: string) {
  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|twitterbot|linkedinbot|pinterest|preview/i.test(
    userAgent
  );
}

// ============================================================================
// GET CLIENT IP
// ============================================================================

function getClientIp(
  request: NextRequest
) {
  const forwarded =
    request.headers.get(
      'x-forwarded-for'
    );

  if (forwarded) {
    return (
      forwarded
        .split(',')[0]
        ?.trim() || 'unknown'
    );
  }

  return (
    request.headers.get(
      'x-real-ip'
    ) || 'unknown'
  );
}

// ============================================================================
// VIEWER HASH
// ============================================================================

function createViewerHash(
  request: NextRequest
) {
  const ip =
    getClientIp(request);

  const userAgent =
    request.headers.get(
      'user-agent'
    ) || 'unknown';

  const secret =
    process.env.VIEW_HASH_SECRET ||
    'asyiqul-quran-view-secret';

  return createHash('sha256')
    .update(
      `${ip}|${userAgent}|${secret}`
    )
    .digest('hex');
}

// ============================================================================
// GET
// ============================================================================
//
// GET:
//
// /api/views?type=blog&key=judul-artikel
//
// ============================================================================

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const type =
      searchParams.get('type');

    const key =
      searchParams.get('key');

    if (
      !isValidType(type) ||
      !isValidKey(key)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Parameter views tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    const cleanKey =
      key.trim();

    const { data, error } =
      await supabaseAdmin
        .from('content_views')
        .select('views')
        .eq(
          'content_type',
          type
        )
        .eq(
          'content_key',
          cleanKey
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,

        type,

        key: cleanKey,

        views:
          Number(data?.views) || 0,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error(
      '[Asyiqul Quran] GET views error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        views: 0,
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================================
// POST
// ============================================================================
//
// POST digunakan untuk mencatat view.
//
// {
//    type: "blog",
//    key: "slug-artikel"
// }
//
// ============================================================================

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================================================
    // JANGAN HITUNG BOT
    // ========================================================================

    const userAgent =
      request.headers.get(
        'user-agent'
      ) || '';

    if (isBot(userAgent)) {
      return NextResponse.json(
        {
          success: true,
          ignored: true,
          views: null,
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================================
    // BODY
    // ========================================================================

    const body =
      await request
        .json()
        .catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Body tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    const {
      type,
      key,
    } = body;

    if (
      !isValidType(type) ||
      !isValidKey(key)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data views tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    const cleanKey =
      key.trim();

    // ========================================================================
    // HASH VIEWER
    // ========================================================================

    const viewerHash =
      createViewerHash(
        request
      );

    // ========================================================================
    // REGISTER VIA RPC
    // ========================================================================

    const {
      data,
      error,
    } =
      await supabaseAdmin.rpc(
        'register_content_view',
        {
          p_content_type:
            type,

          p_content_key:
            cleanKey,

          p_viewer_hash:
            viewerHash,
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,

        type,

        key:
          cleanKey,

        views:
          Number(data) || 0,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error(
      '[Asyiqul Quran] POST views error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        views: 0,
      },
      {
        status: 500,
      }
    );
  }
}