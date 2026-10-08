'use client';
import { useEffect, useRef, useState } from 'react';

interface Payment {
  orderId: string; amount: number; fee: number | null; totalAmount: number | null;
  paymentMethod: string; qrString: string; vaNumber: string; expiredAt: string | null;
  isSandbox: boolean | null; status: 'pending' | 'completed' | 'canceled';
}
const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
export default function PaymentPage() {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const [qrError, setQrError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get('order_id') || '';
    if (!orderId) { setError('Nomor pesanan tidak tersedia.'); return; }
    let stopped = false;
    let busy = false;
    let terminal = false;
    let lastStarted = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    async function check() {
      if (stopped || busy || terminal || document.hidden) return;
      if (Date.now() - lastStarted < 5000) return;
      lastStarted = Date.now(); busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 20000);
      try {
        const response = await fetch(`/api/payment-status?order_id=${encodeURIComponent(orderId)}`, {
          cache: 'no-store', signal: controller.signal,
        });
        const data = await response.json();
        if (stopped) return;
        if (!response.ok || data.success !== true) {
          setError(typeof data.error === 'string' ? data.error : 'Status belum dapat diperiksa.');
          if ([400, 404, 409].includes(response.status)) terminal = true;
          return;
        }
        setPayment(data); setError('');
        if (data.status === 'canceled') terminal = true;
        if (data.status === 'completed') {
          terminal = true;
          if (data.isSandbox === false) {
            window.location.replace(`/thank-you?order_id=${encodeURIComponent(orderId)}`);
          }
        }
      } catch {
        if (!stopped) setError('Koneksi terganggu. Pemeriksaan akan dilanjutkan otomatis. Jangan membayar ulang.');
      } finally {
        clearTimeout(timeout); busy = false;
        if (!stopped && !terminal) timer = setTimeout(() => { void check(); }, 5000);
      }
    }
    const resume = () => {
      if (document.hidden || terminal || stopped || busy) return;
      clearTimeout(timer);
      timer = setTimeout(() => { void check(); }, Math.max(0, 5000 - (Date.now() - lastStarted)));
    };
    void check();
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('focus', resume);
    return () => { stopped = true; clearTimeout(timer); controller?.abort();
      document.removeEventListener('visibilitychange', resume); window.removeEventListener('focus', resume); };
  }, []);
  useEffect(() => {
    let active = true;
    if (!payment?.qrString || !canvas.current) return;
    const target = canvas.current;
    setQrError('');
    import('qrcode').then((module) => {
      if (!active) return;
      return module.toCanvas(target, payment.qrString, {
        width: 320, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' },
      });
    }).catch(() => { if (active) setQrError('QRIS belum bisa ditampilkan. Muat ulang halaman ini; jangan membuat pesanan baru.'); });
    return () => { active = false; };
  }, [payment?.qrString]);
  async function copyVA() {
    if (!payment?.vaNumber) return;
    try { await navigator.clipboard.writeText(payment.vaNumber); setCopyMessage('Nomor VA berhasil disalin.'); }
    catch { setCopyMessage('Salin nomor VA yang ditampilkan secara manual.'); }
  }
  return <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900">
    <section className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
      <h1 className="text-2xl font-bold">Selesaikan Donasi</h1>
      <p className="text-sm text-gray-600">Bayar melalui aplikasi bank atau e-wallet. Halaman ini otomatis beralih setelah pembayaran berhasil.</p>
      {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {!payment && !error && <p role="status">Menyiapkan pembayaran…</p>}
      {payment && <>
        <p className="break-all text-xs text-gray-500">No. pesanan: {payment.orderId}</p>
        <div className="rounded-xl bg-gray-50 p-4 space-y-2">
          <p>Donasi: <strong>{rupiah(payment.amount)}</strong></p>
          {payment.fee !== null && <p className="text-sm">Biaya: {rupiah(payment.fee)}</p>}
          <p className="text-lg font-bold">Total bayar: {payment.totalAmount === null ? 'Belum tersedia' : rupiah(payment.totalAmount)}</p>
          <p className="text-sm">Metode: {payment.paymentMethod.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
        {payment.isSandbox && <p className="text-sm text-amber-800">Transaksi percobaan (sandbox), bukan donasi nyata.</p>}
        {payment.status === 'pending' && <>
          {payment.paymentMethod === 'qris' && payment.qrString && <div className="text-center space-y-2">
            <canvas ref={canvas} aria-label="Kode QRIS pembayaran" className="mx-auto h-auto max-w-full" />
            {qrError && <p role="alert" className="text-sm text-red-700">{qrError}</p>}
            <p className="text-sm text-gray-600">Scan QRIS. Jika memakai HP yang sama, simpan tangkapan layar QRIS lalu pilih gambar tersebut di aplikasi pembayaran yang mendukungnya.</p>
          </div>}
          {payment.vaNumber && <div className="space-y-3">
            <p className="text-sm">Nomor Virtual Account</p>
            <p className="select-all break-all text-2xl font-bold">{payment.vaNumber}</p>
            <button onClick={copyVA} className="rounded-lg bg-emerald-600 px-4 py-3 text-white">Salin Nomor VA</button>
            <p role="status" className="text-sm">{copyMessage}</p>
          </div>}
          {payment.expiredAt && <p className="text-xs text-gray-500">Batas pembayaran: {new Date(payment.expiredAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>}
          <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Menunggu pembayaran. Tidak perlu klik konfirmasi. Kembali ke halaman ini setelah membayar.</p>
        </>}
        {payment.status === 'canceled' && <p role="status" className="text-red-700">Transaksi dibatalkan atau kedaluwarsa. Jika dana sudah terpotong, hubungi admin sebelum membayar lagi.</p>}
        {payment.status === 'completed' && <p role="status" className="text-emerald-700">{payment.isSandbox ? 'Pembayaran percobaan selesai.' : 'Pembayaran berhasil. Membuka halaman terima kasih…'}</p>}
      </>}
      <a href="/" className="inline-block text-sm underline">Kembali ke beranda</a>
    </section>
  </main>;
}
