import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// 🚀 BYPASS TEST: Memasukkan string token Editor langsung ke kode untuk melewati sumbatan Env Hosting
const client = createClient({
  projectId: 'lsnco71s', 
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skpBKfAgOlsao6h2yQVemNTmfhXmjv5eRPrlp273GmHqOaaif4WnoH4PRfiOT6AZf7MVz7UxkVnUKo6DvxSL3XhohEvym6I9YgQhCnLhWAQMHiUlt2lEh1LbDSTLqNbKc9mG3AqXB9K4AcMbjTO6Iy4cRqcPa6LOr2h9QmHQqicCZGO1xvKh', 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const slug = body.slug || '';
    const donorName = body.donorName || body.name || 'Hamba Allah';
    const donorPhone = body.donorPhone || body.phone || body.whatsapp || ''; 
    
    // 🚀 LOGIKA AFILIASI: Tangkap nomor WhatsApp fundraiser yang dioper oleh frontend
    const fundraiserPhone = body.fundraiserPhone || body.referral || '';
    
    // 🚀 DUKUNGAN MULTI-PAYMENT: Mengambil pilihan dari frontend. Fallback otomatis ke 'qris'
    const paymentMethod = body.paymentMethod || 'qris';
    const cleanMethod = String(paymentMethod).toLowerCase().trim();
    
    const rawAmount = body.amount || body.nominal || 0;
    const cleanAmountNumber = Number(String(rawAmount).replace(/\D/g, ''));

    // Validasi dasar transaksi diturunkan menjadi Rp 1.000 agar sinkron dengan Pakasir QRIS
    if (!slug || !cleanAmountNumber || cleanAmountNumber < 1000) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid. Minimal donasi adalah Rp 1.000' },
        { status: 400 }
      );
    }

    // Kustomisasi invoice prefix berdasarkan slug program donasi pesantren
    const cleanSlug = String(slug).toUpperCase();
    const prefix = cleanSlug.includes('ASRAMA') ? 'ASRAMA' : cleanSlug.includes('SANTRI') ? 'SANTRI' : 'ASYIQ';
    const generatedOrderId = `INV-${prefix}-${Date.now()}`;

    // Mengubah default project slug gateway ke identitas Pondok Pesantren Asyiq
    const pakasirProjectSlug = process.env.PAKASIR_PROJECT || process.env.PAKASIR_SLUG || 'pesantren-asyiq';
    const pakasirApiKey = process.env.PAKASIR_API_KEY || '';

    // Validasi internal sebelum fetch dilakukan agar parameter tidak kosong ke API Pakasir
    if (!pakasirProjectSlug || !pakasirProjectSlug.trim()) {
      return NextResponse.json(
        { success: false, error: 'Internal Server Error: Identitas nama project gateway kosong.' },
        { status: 500 }
      );
    }

    if (!pakasirApiKey || !pakasirApiKey.trim()) {
      console.error('⚠️ Kredensial PAKASIR_API_KEY belum dikonfigurasi di file environment variables server!');
    }

    // Endpoint dinamis sesuai pilihan (qris, bri_va, bni_va, dll.)
    const targetPakasirUrl = `https://app.pakasir.com/api/transactioncreate/${cleanMethod}`;

    const pakasirResponse = await fetch(targetPakasirUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: pakasirProjectSlug.trim(),
        order_id: generatedOrderId,
        amount: cleanAmountNumber,
        api_key: pakasirApiKey,
      }),
    });

    const pakasirData = await pakasirResponse.json();

    // Memeriksa kegagalan respon atau ketiadaan data objek payment dari Pakasir
    if (!pakasirResponse.ok || !pakasirData.payment) {
      throw new Error(pakasirData.message || `Gagal membuat transaksi ${cleanMethod} ke gateway API Pakasir.`);
    }

    // Properti ini berisi raw QR string jika memilih qris, atau nomor VA jika memilih bank transfer
    const paymentNumber = pakasirData.payment.payment_number || '';
    
    // Penyusunan Link web-checkout alternatif
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asyiq.ponpes.id';
    const isQrisOnly = cleanMethod === 'qris' ? '&qris_only=1' : '';
    
    const fallbackUrlWeb = `https://app.pakasir.com/pay/${pakasirProjectSlug}/${cleanAmountNumber}?order_id=${generatedOrderId}${isQrisOnly}&redirect=${encodeURIComponent(`${siteUrl}/thank-you?order_id=${generatedOrderId}`)}`;
    
    // Gunakan payment_url bawaan dari objek gateway jika tersedia, atau arahkan ke fallback link web checkout
    const paymentUrl = pakasirData.payment.payment_url || fallbackUrlWeb;

    // 🚀 1. MENULIS DATA TRANSAKSI LENGKAP KE SANITY
    await client.create({
      _type: 'donationTransaction',
      orderId: String(generatedOrderId),
      donorName: String(donorName),
      donorPhone: String(donorPhone),
      amount: Number(cleanAmountNumber),         
      totalAmount: Number(pakasirData.payment.total_payment || cleanAmountNumber), 
      status: 'pending',
      slug: String(slug),
      paymentMethod: String(cleanMethod), 
      paymentUrl: String(paymentUrl), 
      paymentNumber: String(paymentNumber), 
      fundraiserPhone: fundraiserPhone ? String(fundraiserPhone).trim() : '',
    });

    console.log(`🔒 TRANSAKSI BERHASIL DICATAT DI SANITY: ${generatedOrderId} | Fundraiser: ${fundraiserPhone || 'Non-Afiliasi'}`);

    // 🚀 2. SYNC KE GOOGLE SHEET (Ditempatkan sebelum response agar serverless Vercel tidak memutus koneksi)
    const googleSheetScriptUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || '';

    if (googleSheetScriptUrl && googleSheetScriptUrl.trim()) {
      try {
        await fetch(googleSheetScriptUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: generatedOrderId,
            donorName: String(donorName),
            donorPhone: `'${String(donorPhone)}`, // Ditambah petik agar awalan 08 tidak terpotong di Google Sheet
            amount: cleanAmountNumber,
            programSlug: String(slug),
            paymentMethod: cleanMethod,
            fundraiserPhone: fundraiserPhone ? `'${String(fundraiserPhone)}` : '-',
            status: 'pending',
            createdAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
          }),
        });
        console.log(`📊 DATA SINKRON KE GOOGLE SHEET: ${generatedOrderId}`);
      } catch (sheetError) {
        console.error('🔥 Gagal mengirim data transaksi ke Google Sheet:', sheetError);
      }
    } else {
      console.warn('⚠️ GOOGLE_SHEET_WEBHOOK_URL belum dipasang di environment variables.');
    }

    // Mengembalikan response sukses ke komponen frontend
    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      amount: cleanAmountNumber,
      paymentMethod: cleanMethod,
      paymentUrl: paymentUrl,       
      paymentNumber: paymentNumber, 
    });

  } catch (error: any) {
    console.error('🔥 BACKEND CHECKOUT ERROR VIA API PAKASIR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}