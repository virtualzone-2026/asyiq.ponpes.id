import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { processSuccessfulPayment } from '@/lib/asyiq-pakasir';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const project = process.env.PAKASIR_PROJECT_SLUG?.trim() || 'pondok-pesantren-aasyiqul-quran';
const key = process.env.PAKASIR_API_KEY?.trim() || '';
const token = process.env.SANITY_API_WRITE_TOKEN?.trim() || '';
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'lsnco71s',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production',
  apiVersion: '2026-09-30', useCdn: false, token: token || undefined,
  timeout: 10000, maxRetries: 0,
});
type GatewayStatus = 'pending' | 'completed' | 'canceled';
interface Transaction {
  _id: string; _rev: string; orderId: string; txnId?: string;
  pakasirProject: string; amount: number; fee?: number | null;
  totalAmount?: number | null; qrString?: string; vaNumber?: string;
  paymentMethod: string; paymentUrl?: string; expiredAt?: string | null;
  isSandbox?: boolean | null; lastVerifiedStatus?: GatewayStatus;
  lastVerifiedCompletedAt?: string | null; statusCheckAfter?: string;
}
const reply = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { 'Cache-Control': 'no-store, private' },
});
const query = `*[_type == "donationTransaction" && orderId == $orderId][0...2]{
  _id, _rev, orderId, txnId, pakasirProject, amount, fee, totalAmount,
  qrString, vaNumber, paymentMethod, paymentUrl, expiredAt, isSandbox,
  lastVerifiedStatus, lastVerifiedCompletedAt, statusCheckAfter
}`;
function paymentData(t: Transaction, checking = false) {
  return { success: true, orderId: t.orderId, amount: t.amount,
    fee: t.fee ?? null, totalAmount: t.totalAmount ?? null,
    paymentMethod: t.paymentMethod, qrString: t.qrString || '', vaNumber: t.vaNumber || '',
    expiredAt: t.expiredAt || null, isSandbox: t.isSandbox ?? null,
    status: t.lastVerifiedStatus || 'pending', completedAt: t.lastVerifiedCompletedAt || null,
    checking, retryAfterMs: 5000 };
}
export async function GET(request: Request) {
  try {
    if (!project || !key || !token) return reply({ success: false, error: 'Konfigurasi pembayaran belum lengkap.' }, 500);
    const orderId = new URL(request.url).searchParams.get('order_id') || '';
    if (!/^INV-[A-Z]+-\d{13}-[a-f0-9]{12}$/.test(orderId)) {
      return reply({ success: false, error: 'Nomor pesanan tidak valid.' }, 400);
    }
    const matches = await client.fetch<Transaction[]>(query, { orderId });
    if (matches.length !== 1 || matches[0].pakasirProject !== project) {
      return reply({ success: false, error: 'Pesanan tidak ditemukan atau perlu diperiksa admin.' }, 404);
    }
    const t = matches[0];
    if (!t.txnId) return reply({ success: false, error: 'Pembayaran belum siap. Hubungi admin dengan nomor pesanan ini.' }, 409);
    if (t.lastVerifiedStatus === 'completed' || t.lastVerifiedStatus === 'canceled') return reply(paymentData(t));
    if (Date.parse(t.statusCheckAfter || '') > Date.now()) return reply(paymentData(t, true));
    // Lease terdistribusi: satu transaksi tidak memanggil Pakasir dari dua tab/server sekaligus.
    // Lease melebihi timeout fetch dan diperpendek setelah respons selesai.
    try {
      await client.patch(t._id).ifRevisionId(t._rev).set({
        statusCheckAfter: new Date(Date.now() + 15000).toISOString(),
      }).commit({ visibility: 'sync' });
    } catch {
      return reply(paymentData(t, true));
    }
    const response = await fetch(`https://app.pakasir.com/api/v2/transaction-status/${encodeURIComponent(project)}/${encodeURIComponent(t.txnId)}`, {
      headers: { 'X-Api-Key': key }, cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply({ success: false, error: 'Status Pakasir belum dapat diperiksa. Pemeriksaan akan diulang otomatis.' }, 503);
    const data = await response.json();
    if (!data || data.txn_id !== t.txnId || data.order_id !== t.orderId ||
        data.amount !== t.amount || typeof data.is_sandbox !== 'boolean' ||
        (typeof t.isSandbox === 'boolean' && data.is_sandbox !== t.isSandbox) ||
        !['pending', 'completed', 'canceled'].includes(data.status) ||
        (data.status === 'completed' && (typeof data.completed_at !== 'string' || !Number.isFinite(Date.parse(data.completed_at))))) {
      return reply({ success: false, error: 'Data status pembayaran tidak cocok. Hubungi admin.' }, 502);
    }
    // Polling dan webhook memakai satu fungsi atomic/idempotent yang sama.
    if (data.status === 'completed') {
      await processSuccessfulPayment({ txnId: t.txnId, orderId: t.orderId, amount: t.amount,
        completedAt: data.completed_at, isSandbox: data.is_sandbox });
    }
    const update = { lastVerifiedStatus: data.status as GatewayStatus,
      lastVerifiedCompletedAt: data.status === 'completed' ? data.completed_at : null,
      isSandbox: data.is_sandbox, statusCheckAfter: new Date(Date.now() + 5000).toISOString() };
    await client.patch(t._id).set(update).commit({ visibility: 'sync' });
    return reply(paymentData({ ...t, ...update }));
  } catch {
    return reply({ success: false, error: 'Pemeriksaan pembayaran terganggu. Akan dicoba kembali otomatis.' }, 503);
  }
}
