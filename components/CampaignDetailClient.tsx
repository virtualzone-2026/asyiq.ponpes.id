'use client';

import React, { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';

// ===================================================================
// IDENTITAS WEBSITE
// ===================================================================
const SITE_NAME = 'asyiq.ponpes.id';

const normalizePhone = (value: string) => value.replace(/[^0-9]/g, '');
const isValidPhone = (value: string) => {
  const phone = normalizePhone(value);
  return !phone || (phone.length >= 9 && phone.length <= 15);
};

// ===================================================================
// IN-LINE WIDGET KALKULATOR ZAKAT (SUDUT SIKU / ROUNDED-NONE)
// ===================================================================
function EmbeddedZakatCalculator({ onApplyAmount }: { onApplyAmount: (val: string) => void }) {
  const [activeTab, setActiveTab] = useState<'penghasilan' | 'maal' | 'emas'>('penghasilan');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const HARGA_EMAS = 1400000;
  const NISHAB_TAHUNAN = 85 * HARGA_EMAS;
  const NISHAB_BULANAN = Math.round(NISHAB_TAHUNAN / 12);

  const formatRupiah = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    return raw ? Number(raw).toLocaleString('id-ID') : '';
  };
  const getNum = (val: string) => Number(val.replace(/\./g, '')) || 0;

  let totalZakat = 0;
  let isWajib = false;

  if (activeTab === 'penghasilan') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_BULANAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'maal') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_TAHUNAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'emas') {
    const berat = Number(input1) || 0;
    isWajib = berat >= 85;
    totalZakat = isWajib ? Math.round((berat * HARGA_EMAS) * 0.025) : 0;
  }

  return (
    <div className="border border-gray-200 rounded-none bg-white overflow-hidden mt-6">
      <div className="flex border-b border-gray-200 text-[10px] font-black bg-gray-50/50">
        <button onClick={() => { setActiveTab('penghasilan'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'penghasilan' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>PENGHASILAN</button>
        <button onClick={() => { setActiveTab('maal'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'maal' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>MAAL / TABUNGAN</button>
        <button onClick={() => { setActiveTab('emas'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'emas' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>EMAS SIMPANAN</button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="space-y-3 text-left">
          {activeTab !== 'emas' ? (
            <>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Pendapatan Utama / Tabungan (Rp)</label>
                <input type="text" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="0" value={input1} onChange={(e) => setInput1(formatRupiah(e.target.value))} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Bonus / Aset Lainnya (Rp)</label>
                <input type="text" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="0" value={input2} onChange={(e) => setInput2(formatRupiah(e.target.value))} />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Total Berat Emas (Gram)</label>
              <input type="number" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="Contoh: 90" value={input1} onChange={(e) => setInput1(e.target.value)} />
            </div>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-100 p-4 text-center rounded-none space-y-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Wajib Zakat Anda</span>
          <span className="text-xl font-black text-emerald-600 block">Rp {totalZakat.toLocaleString('id-ID')}</span>
          <button 
            disabled={totalZakat <= 0} 
            onClick={() => onApplyAmount(totalZakat.toLocaleString('id-ID'))}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 rounded-none uppercase tracking-wider disabled:bg-gray-300"
          >
            Masukkan ke Form 📥
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// MAIN DETAIL COMPONENT
// ===================================================================
interface FormProps {
  donorName: string;
  setDonorName: (v: string) => void;
  donorPhone: string;
  setDonorPhone: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDonate: () => Promise<void>;
  submitting: boolean;
}

const DonationFormFields = ({
  donorName,
  setDonorName,
  donorPhone,
  setDonorPhone,
  paymentMethod,
  setPaymentMethod,
  amount,
  handleAmountChange,
  handleDonate,
  submitting,
}: FormProps) => (
  <div className="space-y-4 text-left">
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Donatur</label>
      <input type="text" placeholder="Hamba Allah (Boleh Kosong)" className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nomor WhatsApp</label>
      <input type="tel" placeholder="Contoh: 081234567890" className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Metode Pembayaran</label>
      <select className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-bold bg-white cursor-pointer" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="qris">🟢 QRIS (E-Wallet & M-Banking Instant)</option>
        <option value="bri_va">🏦 BRI Virtual Account</option>
        <option value="bni_va">🏦 BNI Virtual Account</option>
        <option value="cimb_niaga_va">🏦 CIMB Niaga Virtual Account</option>
        <option value="permata_va">🏦 Permata Bank Virtual Account</option>
        <option value="maybank_va">🏦 Maybank Virtual Account</option>
        <option value="atm_bersama_va">🌐 ATM Bersama (Mandiri, BCA & Bank Lainnya)</option>
      </select>
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nominal Dana (Rp)</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-xs font-bold text-gray-400">Rp</span>
        <input type="text" placeholder="Minimal 1.000" className="w-full border border-gray-200 rounded-none pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-emerald-500" value={amount} onChange={handleAmountChange} />
      </div>
    </div>
    <button
      type="button"
      onClick={handleDonate}
      disabled={submitting}
      className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-none transition text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:bg-gray-300 shadow-md shadow-emerald-100"
    >
      {submitting ? 'Memproses...' : 'Tunaikan Sekarang 🚀'}
    </button>
    <p className="text-[9px] leading-relaxed text-center text-gray-400">
      Transaksi donasi diproses melalui <span className="font-bold text-gray-500">{SITE_NAME}</span>.
    </p>
  </div>
);

export default function CampaignDetailClient({ slug, referral }: { slug: string; referral: string | null }) {
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [activeTab, setActiveTab] = useState<'cerita' | 'donatur' | 'laporan'>('cerita');

  // --- STATE UNTUK MODAL REGISTRASI FUNDRAISER ---
  const [isFundraiserModalOpen, setIsFundraiserModalOpen] = useState(false);
  const [fundraiserData, setFundraiserData] = useState({ name: '', phone: '' });
  const [fundraiserSubmitting, setFundraiserSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProgram = async () => {
      setLoading(true);

      try {
        const res = await fetch('/api/programs', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Gagal mengambil program. HTTP ${res.status}`);
        }

        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        const found = data.find((p: any) => p?.slug === slug) ?? null;

        setProgram(json?.success ? found : null);
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error(`[${SITE_NAME}] Fetch detail campaign error:`, err);
          setProgram(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProgram();

    return () => controller.abort();
  }, [slug]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmount(rawValue ? Number(rawValue).toLocaleString('id-ID') : '');
  };

  const handleDonate = async () => {
    const cleanAmount = amount.replace(/\./g, '');
    const numericAmount = Number(cleanAmount);

    if (!cleanAmount || !Number.isFinite(numericAmount) || numericAmount < 1000) {
      alert('Masukkan nominal minimal Rp 1.000.');
      return;
    }

    if (!isValidPhone(donorPhone)) {
      alert('Nomor WhatsApp tidak valid. Gunakan 9–15 digit angka.');
      return;
    }

    if (!program?.slug) {
      alert('Data program belum siap. Silakan muat ulang halaman.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: program.slug,
          amount: numericAmount,
          donorName: donorName.trim() || 'Hamba Allah',
          donorPhone: normalizePhone(donorPhone),
          paymentMethod,
          referral: referral || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success || !json?.paymentUrl) {
        throw new Error(json?.error || json?.message || 'Gagal membuat tautan pembayaran.');
      }

      window.location.assign(json.paymentUrl);
    } catch (err) {
      console.error(`[${SITE_NAME}] Checkout error:`, err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterFundraiser = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = fundraiserData.name.trim();
    const phone = normalizePhone(fundraiserData.phone);

    if (!name || !phone) {
      alert('Mohon isi nama dan nomor WhatsApp Anda.');
      return;
    }

    if (phone.length < 9 || phone.length > 15) {
      alert('Nomor WhatsApp tidak valid. Gunakan 9–15 digit angka.');
      return;
    }

    const programId = program?._id || program?.id;
    if (!programId) {
      alert('ID program tidak ditemukan. Silakan muat ulang halaman.');
      return;
    }

    setFundraiserSubmitting(true);

    try {
      const res = await fetch('/api/fundraiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          programId,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || json?.error || 'Gagal mengirim pengajuan fundraiser.');
      }

      alert(`Pendaftaran fundraiser ${SITE_NAME} berhasil. Silakan periksa WhatsApp untuk informasi berikutnya.`);
      setFundraiserData({ name: '', phone: '' });
      setIsFundraiserModalOpen(false);
    } catch (err) {
      console.error(`[${SITE_NAME}] Error submit fundraiser:`, err);
      alert(err instanceof Error ? err.message : 'Terjadi gangguan saat memproses pendaftaran.');
    } finally {
      setFundraiserSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Memuat detail program {SITE_NAME}...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Program tidak ditemukan atau gagal dimuat.
      </div>
    );
  }

  const rawTarget = Math.max(Number(program.targetAmount) || 50_000_000, 1);
  const collectedRaw = Math.max(Number(program.collectedRaw) || 0, 0);
  const percentage = Math.min(Math.max(Math.round((collectedRaw / rawTarget) * 100), 0), 100);
  const isZakatProgram = String(program.category || '').toUpperCase() === 'ZAKAT';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-16 pb-36 lg:pb-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-5 flex flex-col">
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-2">{SITE_NAME}</p>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-none uppercase tracking-wider">
              {program.category || 'Kebaikan'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] mt-3 leading-tight tracking-tight">
              {program.title}
            </h1>
          </div>
          
          <div className="rounded-none overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">
            <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex border-b border-gray-200 text-xs font-bold text-gray-400 space-x-6 pt-2">
            <button onClick={() => setActiveTab('cerita')} className={`pb-3 focus:outline-none ${activeTab === 'cerita' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              DETAIL CERITA & KALKULATOR
            </button>
            <button onClick={() => setActiveTab('donatur')} className={`pb-3 focus:outline-none ${activeTab === 'donatur' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              DONATUR ({(program.donors || []).length})
            </button>
            <button onClick={() => setActiveTab('laporan')} className={`pb-3 focus:outline-none ${activeTab === 'laporan' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              LAPORAN PENYALURAN ({(program.reports || []).length})
            </button>
          </div>

          <div className="bg-transparent py-2 w-full text-left">
            {activeTab === 'cerita' && (
              <div className="space-y-6">
                {isZakatProgram && (
                  <div className="bg-emerald-50/40 p-1 border border-dashed border-emerald-600/30">
                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest px-4 pt-3">🧮 Simulasi Kalkulator Zakat Digital</p>
                    <EmbeddedZakatCalculator onApplyAmount={(val) => setAmount(val)} />
                  </div>
                )}

                <div className="text-gray-700 text-base leading-relaxed space-y-4 font-normal tracking-wide dynamic-portable-text">
                  {program.description ? (typeof program.description === 'string' ? <p>{program.description}</p> : <PortableText value={program.description} />) : <p className="text-gray-400 italic text-xs">Belum ada cerita detail.</p>}
                </div>
              </div>
            )}

            {activeTab === 'donatur' && (
              <div className="space-y-3 py-2">
                {(program.donors || []).length > 0 ? [...program.donors].reverse().map((donor: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-none p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">{(donor.name || 'H').toUpperCase().slice(0, 1)}</div>
                      <div>
                        <p className="text-xs font-black text-gray-700">{donor.name || 'Hamba Allah'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{donor.date || 'Baru Saja'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">{`+Rp ${Number(donor.amount || 0).toLocaleString('id-ID')}`}</p>
                    </div>
                  </div>
                )) : <p className="text-center py-10 text-xs text-gray-400">Belum ada donatur.</p>}
              </div>
            )}

            {activeTab === 'laporan' && (
              <div className="space-y-4 py-2">
                {(program.reports || []).length > 0 ? [...program.reports].reverse().map((report: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-none p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{report.title || 'Laporan Penyaluran'}</h4>
                      <span className="text-[10px] text-gray-400 font-bold">{report.date}</span>
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                      {typeof report.content === 'string' ? <p>{report.content}</p> : <PortableText value={report.content} />}
                    </div>
                  </div>
                )) : <div className="border border-dashed border-gray-200 p-8 text-center rounded-none bg-white"><p className="text-xs text-gray-400 font-medium">Belum ada pembaruan laporan.</p></div>}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR FORM & AKSI (DESKTOP) */}
        <div className="hidden lg:block bg-white rounded-none p-6 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Dana Terkumpul</p>
          <p className="text-3xl font-black text-emerald-600 mt-1 text-left">{`Rp ${collectedRaw.toLocaleString('id-ID')}`}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium text-left">Target Rp {rawTarget.toLocaleString('id-ID')}</p>
          <div className="w-full bg-gray-100 h-2 rounded-none mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
          </div>
          {referral && (
            <div className="mt-3 bg-purple-50 border border-dashed border-purple-200 p-2 text-center">
              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">✨ Link Afiliasi Terdeteksi</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <DonationFormFields 
              donorName={donorName} setDonorName={setDonorName}
              donorPhone={donorPhone} setDonorPhone={setDonorPhone}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              amount={amount} handleAmountChange={handleAmountChange}
              handleDonate={handleDonate} submitting={submitting}
            />
          </div>

          <button 
            onClick={() => setIsFundraiserModalOpen(true)}
            className="w-full bg-white border-2 border-purple-600 text-purple-700 hover:border-emerald-500 hover:text-emerald-600 font-bold py-3 px-4 rounded-none transition-all duration-300 text-xs tracking-wider uppercase mt-4 flex items-center justify-center space-x-2 border-dashed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Menjadi Fundraiser</span>
          </button>
        </div>

      </div>

      {/* ===================================================================
          🚀 TRIGGER STICKY BOTTOM BAR (MOBILE) -> SEKARANG RED MERAH FIRE 🔥
          =================================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex flex-col space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] rounded-none">
        
        <div className="flex justify-between items-end text-left w-full px-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Terkumpul</span>
            <span className="text-lg font-black text-emerald-600 leading-tight">
              {`Rp ${collectedRaw.toLocaleString('id-ID')}`}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Sasaran</span>
            <span className="text-xs font-bold text-gray-500 leading-tight">
              {`Rp ${rawTarget.toLocaleString('id-ID')}`}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-100 h-1 rounded-none overflow-hidden">
          <div className="bg-emerald-500 h-full" style={{ width: `${percentage}%` }}></div>
        </div>

        {/* Info Tracking Singkat Mobile */}
        {referral && (
          <div className="bg-purple-50 border border-dashed border-purple-200 py-1 text-center text-[9px] font-bold text-purple-700 uppercase tracking-wider">
            Melalui Kode Afiliasi Relawan Aktif
          </div>
        )}

        {/* 🔴 TOMBOL UTAMA: Berganti ke warna merah menyala agar terlihat sangat mencolok */}
        <button 
          onClick={() => setIsMobileFormOpen(true)} 
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-none shadow-md shadow-red-100 transition-colors"
        >
          Donasi Sekarang 🚀
        </button>

        <button 
          onClick={() => setIsFundraiserModalOpen(true)}
          className="w-full bg-white border border-purple-600 text-purple-700 hover:text-emerald-600 hover:border-emerald-500 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-none transition-colors flex items-center justify-center space-x-2 border-dashed"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span>Menjadi Fundraiser</span>
        </button>
      </div>

      {/* MOBILE POPUP FORM DONASI */}
      {isMobileFormOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="absolute inset-0" onClick={() => setIsMobileFormOpen(false)} />
          <div className="relative w-full bg-white rounded-none p-6 space-y-4 max-h-[85vh] overflow-y-auto z-10">
            <div className="w-12 h-1 bg-gray-200 rounded-none mx-auto mb-2" onClick={() => setIsMobileFormOpen(false)} />
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-wide">{isZakatProgram ? 'Isi Data Zakat' : 'Isi Data Donasi'}</h3>
              <button onClick={() => setIsMobileFormOpen(false)} className="w-7 h-7 bg-gray-50 rounded-none text-gray-400 text-xs font-bold flex items-center justify-center border border-gray-100">✕</button>
            </div>
            <DonationFormFields 
              donorName={donorName} setDonorName={setDonorName}
              donorPhone={donorPhone} setDonorPhone={setDonorPhone}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              amount={amount} handleAmountChange={handleAmountChange}
              handleDonate={handleDonate} submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* MODAL REGISTER FUNDRAISER */}
      {isFundraiserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsFundraiserModalOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-none p-5 shadow-xl border border-gray-200 space-y-4 relative z-10 text-left">
            <button onClick={() => setIsFundraiserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Registrasi Fundraiser</h3>
              <p className="text-[10px] font-medium text-gray-400">Bantu menghimpun dukungan untuk program {SITE_NAME}</p>
            </div>
            <form onSubmit={handleRegisterFundraiser} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Lengkap</label>
                <input type="text" required placeholder="Masukkan nama asli Anda" value={fundraiserData.name} onChange={(e) => setFundraiserData({ ...fundraiserData, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-none text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nomor WhatsApp</label>
                <input type="tel" required placeholder="Contoh: 08123456789" value={fundraiserData.phone} onChange={(e) => setFundraiserData({ ...fundraiserData, phone: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-none text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white" />
              </div>
              <button type="submit" disabled={fundraiserSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-none text-xs uppercase tracking-widest transition duration-150 mt-1 shadow-sm">{fundraiserSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan 📢'}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}