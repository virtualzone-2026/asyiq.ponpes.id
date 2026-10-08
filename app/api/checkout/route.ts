import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE_NAME = 'Pondok Pesantren Aasyiqul Quran';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://asyiq.ponpes.id';
const PROJECT = process.env.PAKASIR_PROJECT_SLUG?.trim() || 'pondok-pesantren-aasyiqul-quran';
const API_KEY = process.env.PAKASIR_API_KEY?.trim() || '';
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN?.trim() || '';
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'lsnco71s',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production',
  useCdn: false,
  apiVersion: '2026-09-30',
  token: WRITE_TOKEN || undefined,
  timeout: 15000,
  maxRetries: 0,
});

const METHODS = ['payment_link', 'qris', 'bri_va', 'bni_va', 'cimb_niaga_va',
  'permata_va', 'maybank_va', 'bnc_va', 'artha_graha_va', 'sampoerna_va'] as const;
type PaymentMethod = (typeof METHODS)[number];
type JsonObject = Record<string, unknown>;

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
function firstText(...values: unknown[]): string {
  return values.map(text).find(Boolean) || '';
}
function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

// Terima integer, angka polos, atau format ribuan Indonesia (24.000).
// Jangan menghapus semua karakter: -24000/24000.50/1e6 harus ditolak.
function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== 'string') return null;
  const input = value.trim().replace(/^Rp\s*/i, '');
  if (!/^\d+$/.test(input) && !/^\d{1,3}(?:\.\d{3})+$/.test(input)) return null;
  const amount = Number(input.replace(/\./g, ''));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
function money(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function sheetText(value: string): string {
  return /^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
}

// Ambil hanya pesan singkat, bukan HTML, stack trace, atau seluruh respons gateway.
function safeGatewayMessage(value: unknown): string {
  if (typeof value !== 'string') return '';
  let message = value.trim();
  if (!message || /<[^>]+>|\bat\s+\S+\s*\([^)]*:\d+|Traceback|SQLSTATE/i.test(message)) return '';
  for (const secret of [API_KEY, WRITE_TOKEN, process.env.PAKASIR_WEBHOOK_SECRET || '']) {
    if (secret) message = message.split(secret).join('[disembunyikan]');
  }
  message = message.replace(/(?:X-Api-Key|api[_ -]?key|token|secret|authorization)\s*[:=]\s*["']?[^\s,"'}]+/gi, '[kredensial disembunyikan]')
    .replace(/\b[a-f0-9]{32,}\b/gi, '[disembunyikan]')
    .replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
  return message.slice(0, 300);
}

function extractGatewayMessage(value: unknown): string {
  if (typeof value === 'string') return safeGatewayMessage(value);
  if (!object(value)) return '';
  for (const candidate of [value.message, value.error, value.detail,
      object(value.error) ? value.error.message : undefined]) {
    const message = safeGatewayMessage(candidate);
    if (message) return message;
  }
  return '';
}

type Stage = 'config' | 'input' | 'sanity_create' | 'pakasir_request' |
  'pakasir_response' | 'sanity_txn_id' | 'payment_validation' | 'payment_url' | 'sanity_finalize';

class CheckoutError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; this.name = 'CheckoutError'; }
}

function errorStatus(error: unknown): number | null {
  if (!object(error)) return null;
  if (typeof error.statusCode === 'number') return error.statusCode;
  if (typeof error.status === 'number') return error.status;
  if (object(error.response) && typeof error.response.statusCode === 'number') return error.response.statusCode;
  return null;
}

function diagnosis(stage: Stage, error: unknown): { code: string; message: string; status: number } {
  if (error instanceof CheckoutError) return { code: error.code, message: error.message, status: 502 };
  const status = errorStatus(error);
  if (stage.startsWith('sanity_')) {
    const action = stage === 'sanity_create' ? 'menyimpan pesanan awal' : 'menyimpan data pembayaran';
    if (status === 401 || status === 403) return {
      code: 'SANITY_WRITE_DENIED', status: 500,
      message: `Sanity menolak akses saat ${action}. Periksa SANITY_API_WRITE_TOKEN dan izin Editor pada project/dataset yang dipakai.`,
    };
    return { code: stage.toUpperCase(), status: 503,
      message: `Gagal ${action} ke Sanity${status ? ` (HTTP ${status})` : ''}. Periksa koneksi dan konfigurasi Sanity.` };
  }
  if (stage === 'pakasir_request') return { code: 'PAKASIR_CONNECTION_FAILED', status: 502,
    message: 'Koneksi ke Pakasir gagal atau melewati batas waktu. Pesanan belum terkonfirmasi; hubungi admin dengan nomor pesanan ini.' };
  if (stage === 'pakasir_response') return { code: 'PAKASIR_INVALID_RESPONSE', status: 502,
    message: 'Pakasir mengembalikan respons yang tidak dapat dibaca sebagai JSON transaksi v2.' };
  if (stage === 'config' || stage === 'payment_url') return { code: 'INVALID_SITE_OR_PAYMENT_URL', status: 500,
    message: 'URL situs atau URL pembayaran tidak valid. Periksa NEXT_PUBLIC_SITE_URL dan respons payment_link.' };
  return { code: 'CHECKOUT_FAILED', status: 500, message: `Checkout gagal pada tahap ${stage}. Hubungi admin dengan nomor pesanan ini.` };
}

// Hanya log metadata diagnosis; jangan log token, body donatur, atau QR/VA.
function logFailure(stage: Stage, error: unknown, orderId: string, code: string) {
  console.error(`[${SITE_NAME}] Checkout gagal`, {
    stage, code, orderId: orderId || null, httpStatus: errorStatus(error),
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
}

export async function POST(request: Request) {
  let documentId = '';
  let orderId = '';
  let gatewayConfirmed = false;
  let gatewayRequested = false;
  let stage: Stage = 'config';
  let knownTxnId = '';
  let localCreated = false;
  try {
    if (!WRITE_TOKEN || !PROJECT || !API_KEY) {
      console.error(`[${SITE_NAME}] Konfigurasi server belum lengkap.`);
      const missing = [!WRITE_TOKEN && 'SANITY_API_WRITE_TOKEN', !PROJECT && 'PAKASIR_PROJECT_SLUG', !API_KEY && 'PAKASIR_API_KEY'].filter(Boolean);
      return fail(`Konfigurasi server belum lengkap: ${missing.join(', ')}. Isi di Vercel lalu redeploy.`, 500);
    }
    const site = new URL(SITE_URL);
    if (!['https:', 'http:'].includes(site.protocol)) return fail('URL situs tidak valid.', 500);

    stage = 'input';
    const body: unknown = await request.json().catch(() => null);
    if (!object(body)) return fail('Format data transaksi tidak valid.');
    const slug = text(body.slug);
    const donorName = firstText(body.donorName, body.name) || 'Hamba Allah';
    const donorPhone = firstText(body.donorPhone, body.phone, body.whatsapp);
    const fundraiserPhone = firstText(body.fundraiserPhone, body.referral);
    if (!slug || slug.length > 200 || donorName.length > 150 ||
        donorPhone.length > 40 || fundraiserPhone.length > 40) {
      return fail('Data program atau donatur tidak valid.');
    }
    const methodInput = body.paymentMethod === undefined
      ? 'qris' : text(body.paymentMethod).toLowerCase();
    if (!METHODS.includes(methodInput as PaymentMethod)) return fail('Metode pembayaran tidak tersedia.');
    const method = methodInput as PaymentMethod;
    const amount = parseAmount(body.amount ?? body.nominal);
    if (amount === null) return fail('Nominal harus berupa bilangan bulat rupiah yang valid.');
    const minimum = method === 'qris' || method === 'payment_link' ? 500 : 10000;
    const maximum = method === 'qris' ? 10000000 : 50000000;
    const format = (n: number) => new Intl.NumberFormat('id-ID').format(n);
    if (amount < minimum || amount > maximum) {
      return fail(`Nominal ${method.toUpperCase()} harus antara Rp ${format(minimum)} dan Rp ${format(maximum)}.`);
    }
    if (body.qrisOnly !== undefined && typeof body.qrisOnly !== 'boolean') {
      return fail('qrisOnly harus bernilai true atau false.');
    }
    if (method === 'payment_link' && body.qrisOnly === true && amount > 10000000) {
      return fail('Maksimal pembayaran QRIS adalah Rp 10.000.000.');
    }

    const upperSlug = slug.toUpperCase();
    const prefix = ['ASRAMA', 'SANTRI', 'TAHFIDZ', 'WAKAF', 'ZAKAT']
      .find((value) => upperSlug.includes(value)) || 'ASYIQ';
    orderId = `INV-${prefix}-${Date.now()}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    documentId = `donationTransaction.${orderId}`;
    const createdAt = new Date().toISOString();
    const createdAtWib = new Date(createdAt).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'medium',
    });

    // Catat dahulu agar transaksi gateway selalu mempunyai pasangan lokal.
    // Status pembayaran tetap pending; creationStatus membedakan proses checkout.
    stage = 'sanity_create';
    await client.create({
      _id: documentId, _type: 'donationTransaction', orderId,
      pakasirProject: PROJECT, donorName, donorPhone, fundraiserPhone, slug,
      amount, paymentMethod: method, status: 'pending', gatewayStatus: 'pending',
      creationStatus: 'creating', createdAt, createdAtWib,
      siteName: SITE_NAME, siteUrl: site.origin,
    }, { visibility: 'sync' });
    localCreated = true;
    const endpoint = `https://app.pakasir.com/api/v2/create-transaction/${encodeURIComponent(PROJECT)}/${encodeURIComponent(orderId)}`;
    stage = 'pakasir_request';
    gatewayRequested = true;
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
      body: JSON.stringify({ method, amount }), cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    // Baca sekali: respons error bisa JSON, teks biasa, HTML, atau kosong.
    const responseText = await response.text();
    let data: unknown = null;
    try { data = JSON.parse(responseText); } catch { /* Ditangani sesuai status di bawah. */ }
    if (!response.ok) {
      const gatewayCode = `PAKASIR_HTTP_${response.status}`;
      const contentType = response.headers.get('content-type') || '';
      const gatewayMessage = extractGatewayMessage(data) ||
        (contentType.toLowerCase().includes('text/plain') ? safeGatewayMessage(responseText) : '');
      logFailure(stage, { status: response.status }, orderId, gatewayCode);
      // Simpan diagnosis yang sudah dibersihkan. Jangan simpan respons mentah.
      await client.patch(documentId).set({
        creationStatus: response.status >= 500 ? 'unknown' : 'rejected',
        gatewayHttpStatus: response.status, checkoutErrorCode: gatewayCode,
        checkoutErrorStage: stage,
        gatewayErrorMessage: gatewayMessage || 'Tidak ada pesan aman yang tersedia.',
      }).commit().catch(() => undefined);
      const message = response.status === 401 || response.status === 403
        ? 'Pakasir menolak akses. Pastikan API Key dan slug berasal dari proyek yang sama.'
        : response.status === 404
          ? 'Endpoint atau project Pakasir tidak ditemukan. Periksa PAKASIR_PROJECT_SLUG.'
          : response.status === 429
            ? 'Batas request Pakasir tercapai. Tunggu beberapa saat sebelum mencoba lagi.'
            : response.status >= 500
              ? `Pakasir mengalami error saat membuat pembayaran (HTTP ${response.status}).`
              : `Pakasir menolak permintaan pembayaran (HTTP ${response.status}).`;
      const detail = gatewayMessage
        ? ` Pesan Pakasir: ${gatewayMessage}`
        : ' Pakasir tidak memberikan pesan error yang dapat ditampilkan.';
      const caution = response.status >= 500
        ? ' Pesanan mungkin sudah dibuat di gateway. Periksa dashboard Pakasir menggunakan nomor pesanan sebelum membuat transaksi baru.' : '';
      return NextResponse.json({ success: false, error: message + detail + caution,
        code: gatewayCode, orderId, gatewayStatus: response.status,
        needsReview: response.status >= 500 },
        { status: response.status === 429 ? 429 : 502, headers: { 'Cache-Control': 'no-store' } });
    }
    stage = 'pakasir_response';
    if (data === null) throw new CheckoutError('PAKASIR_INVALID_RESPONSE', 'Pakasir mengembalikan respons sukses yang bukan JSON transaksi.');
    if (!object(data) || !text(data.txn_id)) throw new CheckoutError('PAKASIR_MISSING_TXN_ID', 'Respons Pakasir v2 tidak menyediakan txn_id.');
    const txnId = text(data.txn_id);
    knownTxnId = txnId;
    // Simpan ID gateway segera, bahkan jika validasi respons selanjutnya gagal.
    stage = 'sanity_txn_id';
    await client.patch(documentId).set({ txnId, creationStatus: 'verifying' }).commit();
    stage = 'payment_validation';
    if ((data.project !== undefined && data.project !== PROJECT) ||
        (data.order_id !== undefined && data.order_id !== orderId) ||
        (data.amount !== undefined && data.amount !== amount) ||
        (data.payment_method !== undefined && data.payment_method !== method)) {
      throw new CheckoutError('PAKASIR_IDENTITY_MISMATCH', 'Project, order_id, amount, atau metode dalam respons Pakasir tidak cocok dengan pesanan.');
    }
    if (data.is_sandbox !== undefined && typeof data.is_sandbox !== 'boolean') {
      throw new CheckoutError('PAKASIR_SANDBOX_INVALID', 'Respons is_sandbox dari Pakasir bukan boolean.');
    }
    const qrString = text(data.qr_string);
    const vaNumber = text(data.va_number);
    let fee: number | null = null;
    let totalAmount: number | null = null;
    let expiredAt: string | null = null;
    let isSandbox: boolean | null = null;
    if (method !== 'payment_link') {
      // Identitas telah dibandingkan di atas; validasi setiap field secara terpisah.
      if (!money(data.fee)) throw new CheckoutError('PAKASIR_FEE_INVALID', 'Respons fee dari Pakasir tidak valid atau tidak tersedia.');
      if (!money(data.total_payment)) throw new CheckoutError('PAKASIR_TOTAL_INVALID', 'Respons total_payment dari Pakasir tidak valid atau tidak tersedia.');
      // Gunakan total_payment resmi dari Pakasir. Panduan v2 tidak menjamin
      // total_payment selalu sama dengan amount + fee.
      if (data.total_payment <= 0) throw new CheckoutError('PAKASIR_TOTAL_INVALID', 'Total pembayaran Pakasir harus lebih dari nol.');
      if (data.amount !== amount || data.project !== PROJECT || data.order_id !== orderId || data.payment_method !== method) {
        throw new CheckoutError('PAKASIR_DETAILS_MISSING', 'Respons QRIS/VA Pakasir tidak menyediakan identitas transaksi lengkap sesuai API v2.');
      }
      if (typeof data.is_sandbox !== 'boolean') throw new CheckoutError('PAKASIR_SANDBOX_MISSING', 'Respons QRIS/VA Pakasir tidak menyediakan is_sandbox.');
      if ((method === 'qris' && !qrString) || (method.endsWith('_va') && !vaNumber)) {
        throw new CheckoutError('PAKASIR_PAYMENT_DATA_MISSING', 'Pakasir tidak menyediakan qr_string untuk QRIS atau va_number untuk virtual account.');
      }
      // Waktu kedaluwarsa bukan bukti pembayaran. Jangan membuat waktu pengganti.
      const rawExpiry = text(data.expired_at);
      const parsedExpiry = rawExpiry ? Date.parse(rawExpiry) : NaN;
      expiredAt = Number.isFinite(parsedExpiry) ? new Date(parsedExpiry).toISOString() : null;
      if (expiredAt === null) {
        console.warn(`[${SITE_NAME}] Waktu kedaluwarsa tidak tersedia; order ${orderId}`);
      }
      fee = data.fee;
      totalAmount = data.total_payment;
      isSandbox = data.is_sandbox;
    }

    stage = 'payment_url';
    const returnUrl = new URL('/thank-you', site);
    returnUrl.searchParams.set('order_id', orderId);
    // payment_link menggunakan URL resmi dari respons.
    // QRIS/VA mengembalikan data langsung dan URL pay-v2 seperti pola checkout lama.
    const payment = method === 'payment_link'
      ? new URL(text(data.payment_link))
      : new URL(`https://app.pakasir.com/pay-v2/${encodeURIComponent(txnId)}`);
    if (payment.protocol !== 'https:' || payment.hostname !== 'app.pakasir.com' ||
        payment.port || payment.username || payment.password ||
        payment.pathname !== `/pay-v2/${encodeURIComponent(txnId)}`) {
      throw new CheckoutError('PAKASIR_URL_INVALID', 'URL pembayaran yang dikembalikan tidak cocok dengan domain atau ID transaksi Pakasir.');
    }
    payment.searchParams.set('redirect', returnUrl.toString());
    if (method === 'qris' || (method === 'payment_link' && body.qrisOnly === true)) {
      payment.searchParams.set('qris_only', '1');
    }
    const gatewayPaymentUrl = payment.toString();
    const internalPayment = new URL('/payment', site);
    internalPayment.searchParams.set('order_id', orderId);
    const paymentUrl = method === 'payment_link' ? gatewayPaymentUrl : internalPayment.toString();
    // Jangan set status di sini: webhook mungkin telah lebih dulu mencatat lunas.
    stage = 'sanity_finalize';
    await client.patch(documentId).set({
      txnId, fee, totalAmount, paymentUrl, gatewayPaymentUrl, qrString, vaNumber, expiredAt, isSandbox,
      paymentNumber: vaNumber || qrString,
      creationStatus: 'created',
    }).commit();
    gatewayConfirmed = true;

    const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL?.trim();
    if (sheetUrl) {
      try {
        const sheet = await fetch(sheetUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txnId, orderId, donorName: sheetText(donorName),
            donorPhone: donorPhone ? `'${donorPhone}` : '',
            amount, fee, totalAmount, programSlug: sheetText(slug), paymentMethod: method,
            fundraiserPhone: fundraiserPhone ? `'${fundraiserPhone}` : '-',
            status: 'pending', expiredAt, createdAt: createdAtWib,
            site: SITE_NAME, siteUrl: site.origin,
          }), cache: 'no-store', signal: AbortSignal.timeout(8000),
        });
        if (!sheet.ok) throw new Error(`Google Sheet HTTP ${sheet.status}`);
      } catch {
        // Gangguan Sheet tidak menggagalkan checkout yang sudah tersimpan.
        console.error(`[${SITE_NAME}] Sinkron Google Sheet gagal; order ${orderId}`);
      }
    }
    return NextResponse.json({
      success: true, txnId, orderId, amount, fee, totalAmount,
      paymentMethod: method, paymentUrl, qrString, vaNumber, expiredAt, isSandbox,
      paymentNumber: vaNumber || qrString,
      totalPayment: totalAmount,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const result = diagnosis(stage, error);
    logFailure(stage, error, orderId, result.code);
    if (localCreated && !gatewayConfirmed) {
      await client.patch(documentId).set({
        ...(knownTxnId ? { txnId: knownTxnId } : {}),
        creationStatus: gatewayRequested ? 'unknown' : 'failed',
        checkoutErrorCode: result.code, checkoutErrorStage: stage,
      }).commit().catch(() => undefined);
    }
    return NextResponse.json({
      success: false, error: result.message, code: result.code, stage,
      ...(orderId ? { orderId } : {}),
      // ID untuk rekonsiliasi admin; tidak mengembalikan QR/VA saat penyimpanan gagal.
      ...(knownTxnId ? { txnId: knownTxnId } : {}),
    }, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  }
}
