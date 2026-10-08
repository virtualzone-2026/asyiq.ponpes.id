import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { processSuccessfulPayment } from '@/lib/asyiq-pakasir';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const secret = process.env.PAKASIR_WEBHOOK_SECRET?.trim() || '';
  if (!secret || !process.env.SANITY_API_WRITE_TOKEN) return NextResponse.json({ success: false, error: 'Konfigurasi webhook belum lengkap.' }, { status: 500 });
  const a = Buffer.from(request.headers.get('x-secret') || '');
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ success: false }, { status: 401 });
  const data = await request.json().catch(() => null);
  if (!data || Array.isArray(data) || typeof data.txn_id !== 'string' || !data.txn_id ||
      typeof data.order_id !== 'string' || !data.order_id ||
      !Number.isSafeInteger(data.amount) || data.amount <= 0 || typeof data.is_sandbox !== 'boolean' ||
      !['pending', 'completed', 'canceled'].includes(data.status) ||
      (data.status === 'completed' && (typeof data.completed_at !== 'string' || !Number.isFinite(Date.parse(data.completed_at))))) {
    return NextResponse.json({ success: false, error: 'Payload tidak valid.' }, { status: 400 });
  }
  if (data.status !== 'completed') return NextResponse.json({ success: true, ignored: true });
  try {
    const result = await processSuccessfulPayment({ txnId: data.txn_id, orderId: data.order_id,
      amount: data.amount, completedAt: data.completed_at, isSandbox: data.is_sandbox });
    return NextResponse.json({ success: true, alreadyProcessed: result.alreadyProcessed });
  } catch {
    return NextResponse.json({ success: false, error: 'Pencatatan belum selesai; ulangi webhook.' }, { status: 503 });
  }
}
