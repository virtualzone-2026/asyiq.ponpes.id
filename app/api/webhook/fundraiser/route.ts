// app/api/webhook/fundraiser/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ success: false, message: 'Payload kosong' }, { status: 400 });
    }

    // Tangkap data status, nama, nomor telepon, dan judul program dari payload Sanity Webhook
    const { name, phone, status, programTitle } = body;

    // 🚀 VALIDASI KUNCI: Notifikasi HANYA dikirim jika status berubah menjadi 'approved'
    if (status === 'approved') {
      const fonnteToken = process.env.FONNTE_TOKEN;
      if (!fonnteToken) {
        console.error('🔥 Fonnte Token belum dikonfigurasi di .env.local');
        return NextResponse.json({ success: false, message: 'Token WA tidak ditemukan' }, { status: 500 });
      }

      const messageText = 
        `*Pendaftaran Fundraiser Asyiqul Quran Disetujui!* 🎉\n\n` +
        `Assalamu'alaikum *${name}*,\n\n` +
        `Alhamdulillah, pengajuan Anda sebagai fundraiser untuk program *"${programTitle}"* telah resmi *DISETUJUI & DIAKTIFKAN* oleh admin Asyiqul Quran.\n\n` +
        `Yuk, ambil tautan afiliasi unik Anda dan pantau perolehan donasi secara transparan melalui halaman resmi berikut:\n` +
        `👉 https://www.asyiq.ponpes.id/fundraiser/stats \n\n` +
        `Cukup masukkan nomor WhatsApp Anda (*${phone}*) pada halaman tersebut untuk memunculkan link dan melihat riwayat donatur.\n\n` +
        `Jazakumullah Khairan Katsiran atas kontribusi terbaik Anda! 🙏`;

      // Kirim via Fonnte
      const resFonnte = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': fonnteToken },
        body: new URLSearchParams({
          target: phone,
          message: messageText,
        }),
      });

      const resJson = await resFonnte.json();
      console.log('📌 Response Fonnte Webhook:', resJson);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('🔥 Webhook Fundraiser Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}