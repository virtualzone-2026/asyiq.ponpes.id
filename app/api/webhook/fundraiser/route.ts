// app/api/webhook/fundraiser/route.ts

import { NextResponse } from 'next/server';

// ============================================================================
// CONFIG
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_URL = 'https://www.asyiq.ponpes.id';
const FUNDRAISER_STATS_URL = `${SITE_URL}/fundraiser/stats`;

// ============================================================================
// HELPERS
// ============================================================================

function normalizePhone(phone: string): string {
  let formatted = phone.replace(/\D/g, '');

  // 0812xxxx -> 62812xxxx
  if (formatted.startsWith('0')) {
    formatted = `62${formatted.slice(1)}`;
  }

  // 812xxxx -> 62812xxxx
  else if (formatted.startsWith('8')) {
    formatted = `62${formatted}`;
  }

  return formatted;
}

function isValidPhone(phone: string): boolean {
  return /^62[0-9]{8,13}$/.test(phone);
}

// ============================================================================
// POST WEBHOOK
// ============================================================================

export async function POST(request: Request) {
  try {
    // =========================================================================
    // 1. PARSE PAYLOAD
    // =========================================================================

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Payload webhook tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================================
    // 2. AMBIL DATA DARI SANITY WEBHOOK
    // =========================================================================

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : '';

    const rawPhone =
      typeof body.phone === 'string'
        ? body.phone.trim()
        : '';

    const status =
      typeof body.status === 'string'
        ? body.status.trim().toLowerCase()
        : '';

    const programTitle =
      typeof body.programTitle === 'string' &&
      body.programTitle.trim()
        ? body.programTitle.trim()
        : 'Program Kebaikan';

    // =========================================================================
    // 3. HANYA PROSES JIKA STATUS APPROVED
    // =========================================================================

    if (status !== 'approved') {
      return NextResponse.json(
        {
          success: true,
          skipped: true,
          message: 'Webhook diterima, tetapi status belum approved.',
        },
        {
          status: 200,
        }
      );
    }

    // =========================================================================
    // 4. VALIDASI NAMA
    // =========================================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama fundraiser tidak ditemukan.',
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================================
    // 5. VALIDASI WHATSAPP
    // =========================================================================

    if (!rawPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor WhatsApp fundraiser tidak ditemukan.',
        },
        {
          status: 400,
        }
      );
    }

    const phone = normalizePhone(rawPhone);

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor WhatsApp fundraiser tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================================
    // 6. CEK TOKEN FONNTE
    // =========================================================================

    const fonnteToken = process.env.FONNTE_TOKEN;

    if (!fonnteToken) {
      console.error(
        `[${SITE_NAME}] FONNTE_TOKEN belum dikonfigurasi.`
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Token WhatsApp belum dikonfigurasi.',
        },
        {
          status: 500,
        }
      );
    }

    // =========================================================================
    // 7. SUSUN PESAN WHATSAPP
    // =========================================================================

    const messageText =
      `*Pendaftaran Fundraiser ${SITE_NAME} Disetujui!* 🎉\n\n` +

      `Assalamu'alaikum *${name}*,\n\n` +

      `Alhamdulillah, pengajuan Anda sebagai fundraiser untuk program:\n\n` +

      `*${programTitle}*\n\n` +

      `telah resmi *DISETUJUI & DIAKTIFKAN* oleh admin ${SITE_NAME}.\n\n` +

      `Sekarang Anda dapat mengambil tautan fundraiser pribadi dan memantau perolehan donasi secara transparan melalui halaman resmi berikut:\n\n` +

      `👉 ${FUNDRAISER_STATS_URL}\n\n` +

      `Cukup masukkan nomor WhatsApp yang Anda gunakan saat mendaftar:\n` +

      `*${phone}*\n\n` +

      `Pada halaman tersebut Anda dapat melihat tautan fundraiser pribadi serta riwayat donasi yang masuk melalui tautan Anda.\n\n` +

      `Silakan bagikan tautan fundraiser tersebut kepada keluarga, sahabat, dan masyarakat agar semakin banyak yang ikut mendukung program kebaikan ini.\n\n` +

      `Jazakumullahu khairan katsiran atas kontribusi terbaik Anda. 🤲\n\n` +

      `*${SITE_NAME}*\n` +
      `${SITE_URL}`;

    // =========================================================================
    // 8. KIRIM VIA FONNTE
    // =========================================================================

    const resFonnte = await fetch(
      'https://api.fonnte.com/send',
      {
        method: 'POST',

        headers: {
          Authorization: fonnteToken,
          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body: new URLSearchParams({
          target: phone,
          message: messageText,
        }),

        cache: 'no-store',
      }
    );

    // =========================================================================
    // 9. BACA RESPONS FONNTE
    // =========================================================================

    const responseText = await resFonnte
      .text()
      .catch(() => '');

    let fonnteResult: unknown = responseText;

    try {
      fonnteResult = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      // Jika respons bukan JSON, gunakan teks mentah.
    }

    // =========================================================================
    // 10. CEK HASIL FONNTE
    // =========================================================================

    if (!resFonnte.ok) {
      console.error(
        `[${SITE_NAME}] Gagal mengirim WA fundraiser:`,
        {
          status: resFonnte.status,
          response: fonnteResult,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Webhook berhasil diterima, tetapi notifikasi WhatsApp gagal dikirim.',
        },
        {
          status: 502,
        }
      );
    }

    console.log(
      `[${SITE_NAME}] Notifikasi fundraiser berhasil dikirim:`,
      {
        name,
        phone,
        programTitle,
        response: fonnteResult,
      }
    );

    // =========================================================================
    // 11. SUCCESS
    // =========================================================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Webhook fundraiser berhasil diproses dan notifikasi WhatsApp telah dikirim.',
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    // =========================================================================
    // GLOBAL ERROR
    // =========================================================================

    console.error(
      `[${SITE_NAME}] Webhook Fundraiser Error:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi gangguan internal saat memproses webhook fundraiser.',
      },
      {
        status: 500,
      }
    );
  }
}