// app/api/fundraiser/route.ts

import { NextResponse } from 'next/server';
import { clientInternal as client } from '@/lib/sanity';

// ============================================================================
// CONFIG
// ============================================================================

const SITE_NAME = 'asyiq.ponpes.id';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalisasi nomor WhatsApp Indonesia.
 *
 * Contoh:
 * 08123456789   -> 628123456789
 * +628123456789 -> 628123456789
 * 628123456789  -> 628123456789
 * 8123456789    -> 628123456789
 */
function normalizePhone(phone: string): string {
  let formatted = phone.replace(/\D/g, '');

  if (formatted.startsWith('0')) {
    formatted = `62${formatted.slice(1)}`;
  } else if (formatted.startsWith('8')) {
    formatted = `62${formatted}`;
  }

  return formatted;
}

/**
 * Validasi nomor WhatsApp Indonesia.
 */
function isValidPhone(phone: string): boolean {
  return /^62[0-9]{8,13}$/.test(phone);
}

/**
 * Escape karakter sederhana untuk pesan WhatsApp.
 */
function sanitizeText(value: string): string {
  return value
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================================
// POST /api/fundraiser
// ============================================================================

export async function POST(request: Request) {
  try {
    // =========================================================================
    // 1. PARSE BODY
    // =========================================================================

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Format body JSON tidak valid.',
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // 2. AMBIL DATA
    // =========================================================================

    const rawName =
      typeof body.name === 'string'
        ? sanitizeText(body.name)
        : '';

    const rawPhone =
      typeof body.phone === 'string'
        ? body.phone.trim()
        : '';

    const programId =
      typeof body.programId === 'string'
        ? body.programId.trim()
        : '';

    // =========================================================================
    // 3. VALIDASI NAMA
    // =========================================================================

    if (!rawName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (rawName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap terlalu pendek.',
        },
        { status: 400 }
      );
    }

    if (rawName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap maksimal 100 karakter.',
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // 4. VALIDASI NOMOR WHATSAPP
    // =========================================================================

    if (!rawPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor WhatsApp wajib diisi.',
        },
        { status: 400 }
      );
    }

    const formattedPhone = normalizePhone(rawPhone);

    if (!isValidPhone(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor WhatsApp tidak valid. Gunakan nomor Indonesia yang aktif.',
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // 5. VALIDASI PROGRAM
    // =========================================================================

    if (!programId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID program tidak terdeteksi.',
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // 6. CEK PROGRAM DI SANITY
    // =========================================================================

    const programExists = await client.fetch<{
      _id: string;
      _type: string;
      title?: string;
      slug?: {
        current?: string;
      };
    } | null>(
      `*[
        _type == "program" &&
        _id == $programId
      ][0]{
        _id,
        _type,
        title,
        slug
      }`,
      {
        programId,
      },
      {
        cache: 'no-store',
      }
    );

    if (!programExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Program yang dipilih tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    // =========================================================================
    // 7. CEK PENDAFTARAN DUPLIKAT
    // =========================================================================

    const existingFundraiser = await client.fetch<{
      _id: string;
      status?: string;
      name?: string;
    } | null>(
      `*[
        _type == "fundraiser" &&
        phone == $phone &&
        program._ref == $programId &&
        status in ["pending", "active"]
      ][0]{
        _id,
        status,
        name
      }`,
      {
        phone: formattedPhone,
        programId,
      },
      {
        cache: 'no-store',
      }
    );

    if (existingFundraiser) {
      const message =
        existingFundraiser.status === 'active'
          ? 'Nomor WhatsApp ini sudah terdaftar sebagai fundraiser pada program tersebut.'
          : 'Pengajuan fundraiser dengan nomor WhatsApp ini masih dalam proses verifikasi.';

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );
    }

    // =========================================================================
    // 8. SIMPAN FUNDRAISER KE SANITY
    // =========================================================================

    const createdAt = new Date().toISOString();

    const newFundraiser = await client.create({
      _type: 'fundraiser',

      name: rawName,

      phone: formattedPhone,

      program: {
        _type: 'reference',
        _ref: programExists._id,
      },

      status: 'pending',

      createdAt,
    });

    // =========================================================================
    // 9. NOTIFIKASI WHATSAPP VIA FONNTE
    // =========================================================================
    //
    // Kegagalan Fonnte tidak membatalkan pendaftaran.
    //
    // Data fundraiser sudah tersimpan di Sanity.
    //
    // =========================================================================

    const fonnteToken = process.env.FONNTE_TOKEN;

    if (fonnteToken) {
      try {
        const programTitle =
          programExists.title?.trim() || 'program kebaikan';

        const messageText =
          `*Pendaftaran Fundraiser ${SITE_NAME}* 📢\n\n` +
          `Assalamu'alaikum *${rawName}*,\n\n` +
          `Terima kasih telah mendaftarkan diri sebagai fundraiser di *${SITE_NAME}*.\n\n` +
          `Pengajuan Anda untuk program:\n` +
          `*${programTitle}*\n\n` +
          `telah kami terima dan saat ini sedang menunggu proses verifikasi oleh tim admin.\n\n` +
          `Setelah akun fundraiser disetujui, kami akan mengirimkan informasi lanjutan beserta tautan fundraiser yang dapat digunakan untuk mengajak keluarga, sahabat, dan masyarakat ikut berpartisipasi dalam program ini.\n\n` +
          `Jazakumullahu khairan katsiran atas partisipasi dan kepeduliannya.\n\n` +
          `_${SITE_NAME}_`;

        const fonnteResponse = await fetch(
          'https://api.fonnte.com/send',
          {
            method: 'POST',
            headers: {
              Authorization: fonnteToken,
              'Content-Type':
                'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              target: formattedPhone,
              message: messageText,
            }),
            cache: 'no-store',
          }
        );

        if (!fonnteResponse.ok) {
          const errorText =
            await fonnteResponse.text().catch(() => '');

          console.error(
            `[${SITE_NAME}] Fonnte gagal mengirim WhatsApp`,
            {
              status: fonnteResponse.status,
              response: errorText,
              phone: formattedPhone,
              fundraiserId: newFundraiser._id,
            }
          );
        } else {
          const fonnteResult =
            await fonnteResponse
              .json()
              .catch(() => null);

          console.log(
            `[${SITE_NAME}] WhatsApp fundraiser berhasil dikirim`,
            {
              fundraiserId: newFundraiser._id,
              phone: formattedPhone,
              response: fonnteResult,
            }
          );
        }
      } catch (fonnteError) {
        console.error(
          `[${SITE_NAME}] Fonnte Error`,
          {
            fundraiserId: newFundraiser._id,
            error: fonnteError,
          }
        );
      }
    } else {
      console.warn(
        `[${SITE_NAME}] FONNTE_TOKEN belum dikonfigurasi. Notifikasi WhatsApp dilewati.`
      );
    }

    // =========================================================================
    // 10. SUCCESS RESPONSE
    // =========================================================================

    return NextResponse.json(
      {
        success: true,

        message:
          'Pendaftaran fundraiser berhasil dikirim dan sedang menunggu verifikasi admin.',

        data: {
          id: newFundraiser._id,
          name: rawName,
          phone: formattedPhone,
          status: 'pending',
          program: {
            id: programExists._id,
            title: programExists.title || null,
            slug: programExists.slug?.current || null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // =========================================================================
    // GLOBAL ERROR
    // =========================================================================

    console.error(
      `[${SITE_NAME}] Gagal mendaftarkan fundraiser:`,
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi gangguan internal pada server.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}