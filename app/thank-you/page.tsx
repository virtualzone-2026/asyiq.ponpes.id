'use client';
import { useEffect, useState } from 'react';
export default function ThankYouPage() {
  const [state, setState] = useState<'loading' | 'paid' | 'other'>('loading');
  const [orderId, setOrderId] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const id = new URLSearchParams(window.location.search).get('order_id') || '';
    setOrderId(id);
    if (!id) { setState('other'); return; }
    fetch(`/api/payment-status?order_id=${encodeURIComponent(id)}`, { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json()).then((data) => {
        if (!controller.signal.aborted) setState(data.success === true && data.status === 'completed' && data.isSandbox === false ? 'paid' : 'other');
      }).catch(() => { if (!controller.signal.aborted) setState('other'); });
    return () => controller.abort();
  }, []);
  return <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
    <section className="mx-auto max-w-lg rounded-2xl border bg-white p-7 text-center space-y-5">
      <h1 className="text-2xl font-bold">{state === 'paid' ? 'Terima Kasih atas Donasi Anda' : state === 'loading' ? 'Memeriksa Pembayaran…' : 'Pembayaran Belum Terkonfirmasi'}</h1>
      {state === 'paid' ? <>
        <p className="text-emerald-700 font-semibold">Pembayaran berhasil diterima.</p>
        <p>Jazakumullah khairan. Semoga Allah menerima amal kebaikan Anda, memberkahi rezeki, dan memberikan kebaikan untuk Anda serta keluarga. Aamiin.</p>
        <p className="text-sm text-gray-600">Donasi Anda mendukung program Pondok Pesantren Aasyiqul Quran.</p>
      </> : state === 'other' ? <p className="text-sm">Silakan kembali ke halaman pembayaran untuk memeriksa status. Jika sudah membayar, jangan membayar ulang.</p> : null}
      {orderId && <p className="break-all text-xs text-gray-500">No. pesanan: {orderId}</p>}
      {state === 'other' && orderId && <a className="block underline" href={`/payment?order_id=${encodeURIComponent(orderId)}`}>Periksa pembayaran</a>}
      <a className="inline-block rounded-lg bg-emerald-600 px-5 py-3 text-white" href="/">Kembali ke Beranda</a>
    </section>
  </main>;
}
