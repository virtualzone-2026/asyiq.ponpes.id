// app/api/fundraiser/route.ts

import { NextResponse } from 'next/server';
import { clientInternal as client } from '@/lib/sanity';

// ============================================================================
// CONFIG
// ============================================================================

const SITE_NAME = 'asyiq.ponpes.id';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalisasi nomor WhatsApp Indonesia ke format internasional.
 *
 * Contoh:
 * 08123456789   -> 628123456789
 * +628123456789 -> 628123456789
 * 628123456789  -> 628123456789
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
 * Validasi sederhana nomor WhatsApp Indonesia.
 */
function isValidPhone(phone: string): boolean {
  return /^62[0-9]{8,13}$/.test(phone);
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
        {
          status: 400,
        }
      );
    }

    // =========================================================================
    // 2. AMBIL DATA
    // =========================================================================

    const rawName =
      typeof body.name === 'string'
        ? body.name.trim()
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
        {
          status: 400,
        }
      );
    }

    if (rawName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap terlalu pendek.',
        },
        {
          status: 400,
        }
      );
    }

    if (rawName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap maksimal 100 karakter.',
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
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
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    // =========================================================================
    // 6. CEK PROGRAM DI SANITY
    // =========================================================================

    const programExists = await client.fetch<
      {
        _id: string;
        title?: string;
      } | null
    >(
      `
        *[
          _id == $programId
        ][0]{
          _id,
          title
        }
      `,
      {
        programId,
      }
    );

    if (!programExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Program yang dipilih tidak ditemukan.',
        },
        {
          status: 404,
        }
      );
    }

    // =========================================================================
    // 7. CEK PENDAFTARAN DUPLIKAT
    // =========================================================================

    const existingFundraiser = await client.fetch<
      {
        _id: string;
        status?: string;
      } | null
    >(
      `
        *[
          _type == "fundraiser" &&
          phone == $phone &&
          program._ref == $programId &&
          status in ["pending", "active"]
        ][0]{
          _id,
          status
        }
      `,
      {
        phone: formattedPhone,
        programId,
      }
    );

    if (existingFundraiser) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingFundraiser.status === 'active'
              ? 'Nomor WhatsApp ini sudah terdaftar sebagai fundraiser pada program tersebut.'
              : 'Pengajuan fundraiser dengan nomor WhatsApp ini masih dalam proses verifikasi.',
        },
        {
          status: 409,
        }
      );
    }

    // =========================================================================
    // 8. SIMPAN FUNDRAISER KE SANITY
    // =========================================================================

    const newFundraiser = await client.create({
      _type: 'fundraiser',

      name: rawName,

      phone: formattedPhone,

      program: {
        _type: 'reference',
        _ref: programId,
      },

      status: 'pending',

      createdAt: new Date().toISOString(),
    });

    // =========================================================================
    // 9. KIRIM NOTIFIKASI WHATSAPP VIA FONNTE
    // =========================================================================
    //
    // Kegagalan WhatsApp tidak boleh membatalkan pendaftaran karena data
    // fundraiser sudah berhasil masuk ke Sanity.
    //
    // =========================================================================

    if (process.env.FONNTE_TOKEN) {
      try {
        const programTitle =
          programExists.title || 'program kebaikan';

        const messageText =
          `*Pendaftaran Fundraiser ${SITE_NAME}* 📢\n\n` +
          `Assalamu'alaikum *${rawName}*,\n\n` +
          `Terima kasih telah mendaftarkan diri sebagai fundraiser di ${SITE_NAME}.\n\n` +
          `Pengajuan Anda untuk program:\n` +
          `*${programTitle}*\n\n` +
          `telah kami terima dan saat ini sedang menunggu proses verifikasi oleh tim admin.\n\n` +
          `Setelah akun fundraiser Anda disetujui, kami akan mengirimkan informasi lanjutan beserta tautan fundraiser yang dapat Anda gunakan untuk mengajak keluarga, sahabat, dan masyarakat ikut berpartisipasi dalam program ini.\n\n` +
          `Jazakumullahu khairan katsiran atas partisipasi dan kepeduliannya.\n\n` +
          `_${SITE_NAME}_`;

        const fonnteResponse = await fetch(
          'https://api.fonnte.com/send',
          {
            method: 'POST',

            headers: {
              Authorization: process.env.FONNTE_TOKEN,
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

        // =====================================================================
        // LOG JIKA FONNTE GAGAL
        // =====================================================================

        if (!fonnteResponse.ok) {
          const errorText =
            await fonnteResponse.text().catch(() => '');

          console.error(
            `[${SITE_NAME}] Fonnte gagal mengirim WhatsApp:`,
            {
              status: fonnteResponse.status,
              response: errorText,
            }
          );
        }
      } catch (fonnteError) {
        console.error(
          `[${SITE_NAME}] Fonnte Error:`,
          fonnteError
        );
      }
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
          name: newFundraiser.name,
          phone: newFundraiser.phone,
          status: newFundraiser.status,
        },
      },
      {
        status: 201,
      }
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
      {
        status: 500,
      }
    );
  }
}