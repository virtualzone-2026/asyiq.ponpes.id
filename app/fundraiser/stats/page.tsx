'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  Eye,
  HandCoins,
  History,
  Landmark,
  Link2,
  LoaderCircle,
  LogOut,
  Percent,
  RefreshCw,
  Share2,
  ShieldCheck,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';

// ==========================================================
// IDENTITAS WEBSITE
// ==========================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_URL = 'https://www.asyiq.ponpes.id';

// Session hanya disimpan selama tab/browser session aktif.
// sessionStorage tetap bertahan saat refresh, tetapi akan hilang ketika
// sesi browser ditutup sehingga lebih aman daripada localStorage.
const FUNDRAISER_SESSION_KEY = 'asyiq_fundraiser_phone';

// ==========================================================
// TYPES
// ==========================================================

type FundraiserProfile = {
  name: string;
  phone?: string;
  status?: string;
  feePaid?: number;
  programSlug?: string;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

type Program = {
  slug: string;
  title: string;
};

type DonationHistory = {
  _id?: string;
  donorName?: string;
  amount?: number;
  programTitle?: string;
  createdAt?: string;
  paidAt?: string;
};

type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'completed'
  | 'rejected'
  | 'cancelled';

type WithdrawalHistory = {
  _id?: string;
  amount: number;
  status: WithdrawalStatus;

  requestedAt?: string;
  processedAt?: string;
  paidAt?: string;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;

  referenceNumber?: string;
  note?: string;
  adminNote?: string;
};

type FundraiserStats = {
  success: boolean;

  profile: FundraiserProfile;

  totalEarnings: number;
  donationCount: number;

  programs?: Program[];
  history?: DonationHistory[];

  // DATA BARU
  withdrawals?: WithdrawalHistory[];

  commissionRate?: number;
  totalCommission?: number;
  totalWithdrawn?: number;
  pendingWithdrawal?: number;
  availableCommission?: number;

  withdrawalConfig?: {
    minimum?: number;
    maximum?: number;
    enabled?: boolean;
  };
};

// ==========================================================
// HELPERS
// ==========================================================

const rupiah = (value: number | null | undefined) => {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
};

const formatDate = (value?: string) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    }).format(date);
  } catch {
    return '-';
  }
};

const cleanPhoneNumber = (value: string) =>
  value.replace(/[^0-9]/g, '');

const normalizeReferralPhone = (value: string) => {
  let phone = cleanPhoneNumber(value);

  if (phone.startsWith('0')) {
    phone = `62${phone.slice(1)}`;
  } else if (phone.startsWith('8')) {
    phone = `62${phone}`;
  }

  return phone;
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%';
  }

  return `${value.toLocaleString('id-ID', {
    minimumFractionDigits: value < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  })}%`;
};

const getWithdrawalStatus = (status?: WithdrawalStatus) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return {
        label: 'Sudah Dibayar',
        icon: CheckCircle2,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
      };

    case 'approved':
      return {
        label: 'Disetujui',
        icon: ShieldCheck,
        className:
          'bg-blue-50 text-blue-700 border-blue-200',
      };

    case 'rejected':
      return {
        label: 'Ditolak',
        icon: XCircle,
        className:
          'bg-red-50 text-red-700 border-red-200',
      };

    case 'cancelled':
      return {
        label: 'Dibatalkan',
        icon: X,
        className:
          'bg-gray-50 text-gray-600 border-gray-200',
      };

    default:
      return {
        label: 'Menunggu',
        icon: Clock3,
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
      };
  }
};

// ==========================================================
// COMPONENT
// ==========================================================

export default function FundraiserStatsPage() {
  const [phone, setPhone] = useState('');

  // Mencegah form "login" muncul sesaat saat halaman direfresh.
  // Setelah sessionStorage diperiksa, nilai ini berubah menjadi true.
  const [sessionReady, setSessionReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<FundraiserStats | null>(null);
  const [error, setError] = useState('');

  // Views dari Supabase.
  // Halaman statistik hanya MEMBACA views dan tidak menambah view.
  const [fundraiserViews, setFundraiserViews] = useState(0);
  const [viewsLoading, setViewsLoading] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState('');
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'donations' | 'withdrawals'
  >('donations');

  // ========================================================
  // WITHDRAWAL
  // ========================================================

  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // ========================================================
  // LOAD FUNDRAISER VIEWS FROM SUPABASE
  // ========================================================

  const loadFundraiserViews = useCallback(async (referralKey: string) => {
    const key = normalizeReferralPhone(referralKey);

    if (!key) {
      setFundraiserViews(0);
      return;
    }

    setViewsLoading(true);

    try {
      const res = await fetch(
        `/api/views?type=fundraiser&key=${encodeURIComponent(key)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        console.warn(
          `[${SITE_NAME}] Views fundraiser tidak berhasil dimuat.`,
          json
        );
        setFundraiserViews(0);
        return;
      }

      setFundraiserViews(
        Number.isFinite(Number(json.views))
          ? Math.max(Number(json.views), 0)
          : 0
      );
    } catch (err) {
      console.error(
        `[${SITE_NAME}] Gagal memuat views fundraiser:`,
        err
      );
      setFundraiserViews(0);
    } finally {
      setViewsLoading(false);
    }
  }, []);

  // ========================================================
  // LOAD STATS
  // ========================================================

  const loadStats = useCallback(
    async (rawPhone: string): Promise<boolean> => {
      const cleanedPhone =
        normalizeReferralPhone(rawPhone) ||
        cleanPhoneNumber(rawPhone);

      if (!cleanedPhone) {
        setStats(null);
        setFundraiserViews(0);
        setError('Nomor WhatsApp fundraiser tidak valid.');
        return false;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `/api/fundraiser/stats?phone=${encodeURIComponent(
            cleanedPhone
          )}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          setStats(null);
          setFundraiserViews(0);

          setError(
            json?.message ||
              'Data fundraiser tidak berhasil ditemukan.'
          );

          return false;
        }

        setStats(json);

        // Gunakan nomor pada profil sebagai sumber utama agar referral key
        // selalu konsisten dalam format 62xxxxxxxxxx.
        const canonicalPhone =
          normalizeReferralPhone(
            json?.profile?.phone || cleanedPhone
          ) || cleanedPhone;

        setPhone(canonicalPhone);

        // Simpan sesi hanya setelah data fundraiser benar-benar valid.
        // sessionStorage bertahan saat refresh tetapi tidak permanen.
        try {
          window.sessionStorage.setItem(
            FUNDRAISER_SESSION_KEY,
            canonicalPhone
          );
        } catch (storageError) {
          console.warn(
            `[${SITE_NAME}] Session fundraiser tidak dapat disimpan:`,
            storageError
          );
        }

        await loadFundraiserViews(canonicalPhone);

        return true;
      } catch (err) {
        console.error(
          `[${SITE_NAME}] Gagal memuat dashboard fundraiser:`,
          err
        );

        setStats(null);
        setFundraiserViews(0);

        setError(
          'Terjadi gangguan jaringan saat memuat data fundraiser.'
        );

        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadFundraiserViews]
  );

  // ========================================================
  // RESTORE SESSION SETELAH REFRESH
  // ========================================================

  useEffect(() => {
    let active = true;

    async function restoreFundraiserSession() {
      try {
        const savedPhone =
          window.sessionStorage.getItem(
            FUNDRAISER_SESSION_KEY
          );

        if (!savedPhone) {
          return;
        }

        setPhone(savedPhone);

        const success =
          await loadStats(savedPhone);

        // Bila nomor yang tersimpan sudah tidak valid / fundraiser dihapus,
        // hapus sesi agar pengguna dapat memasukkan nomor kembali.
        if (!success) {
          window.sessionStorage.removeItem(
            FUNDRAISER_SESSION_KEY
          );

          if (active) {
            setPhone('');
          }
        }
      } catch (err) {
        console.error(
          `[${SITE_NAME}] Gagal memulihkan session fundraiser:`,
          err
        );

        try {
          window.sessionStorage.removeItem(
            FUNDRAISER_SESSION_KEY
          );
        } catch {
          // Abaikan error storage pada browser yang memblokir storage.
        }
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    }

    restoreFundraiserSession();

    return () => {
      active = false;
    };
  }, [loadStats]);

  // ========================================================
  // OPEN DASHBOARD MANUAL
  // ========================================================

  const handleCheckStats = async (e: FormEvent) => {
    e.preventDefault();

    const cleanedPhone =
      normalizeReferralPhone(phone) ||
      cleanPhoneNumber(phone);

    if (!cleanedPhone) {
      setError('Masukkan nomor WhatsApp fundraiser yang valid.');
      return;
    }

    setSelectedSlug('');
    setCopied(false);
    setShowWithdrawal(false);
    setWithdrawMessage('');
    setWithdrawError('');
    setFundraiserViews(0);

    await loadStats(cleanedPhone);
  };

  // ========================================================
  // LOGOUT / GANTI AKUN
  // ========================================================

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(
        FUNDRAISER_SESSION_KEY
      );
    } catch {
      // Abaikan bila browser memblokir sessionStorage.
    }

    setPhone('');
    setStats(null);
    setError('');
    setFundraiserViews(0);
    setSelectedSlug('');
    setCopied(false);
    setActiveTab('donations');
    setShowWithdrawal(false);
    setWithdrawAmount('');
    setWithdrawNote('');
    setWithdrawMessage('');
    setWithdrawError('');
  };

  // ========================================================
  // CALCULATIONS
  // ========================================================

  const withdrawals = stats?.withdrawals || [];

  const commissionRate = stats?.commissionRate ?? 0.1;

  const totalDonation = Number(stats?.totalEarnings || 0);

  const donationCount = Math.max(
    Number(stats?.donationCount || 0),
    0
  );

  /**
   * Rasio konversi = jumlah transaksi donasi sukses / unique views referral.
   *
   * Catatan:
   * donationCount adalah jumlah transaksi, bukan selalu jumlah orang unik.
   * Karena itu, bila satu orang berdonasi lebih dari sekali, rasio secara
   * teoritis dapat lebih dari 100%.
   */
  const conversionRate =
    fundraiserViews > 0
      ? (donationCount / fundraiserViews) * 100
      : 0;

  const averageDonation =
    donationCount > 0
      ? Math.round(totalDonation / donationCount)
      : 0;

  const totalCommission =
    stats?.totalCommission ??
    Math.round(totalDonation * commissionRate);

  const withdrawalCalculated = useMemo(() => {
    return withdrawals.reduce(
      (acc, item) => {
        const amount = Number(item.amount || 0);

        if (
          item.status === 'paid' ||
          item.status === 'completed'
        ) {
          acc.paid += amount;
        }

        if (
          item.status === 'pending' ||
          item.status === 'approved'
        ) {
          acc.pending += amount;
        }

        return acc;
      },
      {
        paid: 0,
        pending: 0,
      }
    );
  }, [withdrawals]);

  const totalWithdrawn =
    stats?.totalWithdrawn ??
    stats?.profile?.feePaid ??
    withdrawalCalculated.paid;

  const pendingWithdrawal =
    stats?.pendingWithdrawal ??
    withdrawalCalculated.pending;

  const availableCommission =
    stats?.availableCommission ??
    Math.max(
      0,
      totalCommission -
        totalWithdrawn -
        pendingWithdrawal
    );

  // ========================================================
  // AFFILIATE / REFERRAL KEY
  // ========================================================

  const referralKey = useMemo(() => {
    return normalizeReferralPhone(
      stats?.profile?.phone || phone
    );
  }, [stats?.profile?.phone, phone]);

  // ========================================================
  // AFFILIATE LINK
  // ========================================================

  const affiliateUrl = useMemo(() => {
    if (!selectedSlug || !referralKey) {
      return '';
    }

    return `${SITE_URL}/campaign/${encodeURIComponent(
      selectedSlug
    )}?ref=${encodeURIComponent(referralKey)}`;
  }, [selectedSlug, referralKey]);

  const handleCopy = async () => {
    if (!affiliateUrl) return;

    try {
      await navigator.clipboard.writeText(affiliateUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert('Tautan tidak berhasil disalin.');
    }
  };

  const handleShareWhatsApp = () => {
    if (!affiliateUrl) return;

    const program = stats?.programs?.find(
      (item) => item.slug === selectedSlug
    );

    const message = [
      program?.title
        ? `Mari ikut mendukung program "${program.title}" bersama ${SITE_NAME}.`
        : `Mari ikut mendukung program kebaikan bersama ${SITE_NAME}.`,
      '',
      affiliateUrl,
    ].join('\n');

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  // ========================================================
  // WITHDRAWAL REQUEST
  // ========================================================

  const handleWithdrawal = async (e: FormEvent) => {
    e.preventDefault();

    if (!stats) return;

    const amount = Number(
      withdrawAmount.replace(/[^0-9]/g, '')
    );

    setWithdrawMessage('');
    setWithdrawError('');

    if (!amount || amount <= 0) {
      setWithdrawError(
        'Masukkan nominal penarikan yang benar.'
      );
      return;
    }

    const minimum =
      Number(stats.withdrawalConfig?.minimum || 0);

    const maximum =
      Number(stats.withdrawalConfig?.maximum || 0);

    if (minimum > 0 && amount < minimum) {
      setWithdrawError(
        `Minimal penarikan adalah ${rupiah(minimum)}.`
      );
      return;
    }

    if (maximum > 0 && amount > maximum) {
      setWithdrawError(
        `Maksimal penarikan adalah ${rupiah(maximum)}.`
      );
      return;
    }

    if (amount > availableCommission) {
      setWithdrawError(
        'Nominal penarikan melebihi saldo komisi tersedia.'
      );
      return;
    }

    setWithdrawing(true);

    try {
      const res = await fetch('/api/fundraiser/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: referralKey || cleanPhoneNumber(phone),
          amount,
          note: withdrawNote.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setWithdrawError(
          json.message ||
            'Pengajuan penarikan tidak berhasil.'
        );
        return;
      }

      setWithdrawMessage(
        json.message ||
          'Pengajuan penarikan berhasil dikirim.'
      );

      setWithdrawAmount('');
      setWithdrawNote('');

      await loadStats(phone);
    } catch (err) {
      console.error(err);

      setWithdrawError(
        'Terjadi gangguan saat mengirim pengajuan penarikan.'
      );
    } finally {
      setWithdrawing(false);
    }
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-5 border border-gray-200 bg-white px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-1 flex items-center gap-2">
                <CircleDollarSign
                  size={20}
                  className="text-emerald-600"
                />

                <h1 className="text-lg font-black tracking-tight text-gray-900 md:text-xl">
                  Dashboard Fundraiser
                </h1>
              </div>

              <p className="text-xs leading-relaxed text-gray-500">
                Pantau tayangan link, konversi donasi, komisi,
                referral, dan riwayat pencairan fundraiser {SITE_NAME}.
              </p>
            </div>

            {stats && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadStats(phone)}
                  disabled={loading}
                  className="flex h-10 items-center justify-center gap-2 border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={
                      loading ? 'animate-spin' : ''
                    }
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex h-10 items-center justify-center gap-2 border border-red-200 bg-white px-4 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            SESSION / SEARCH
        ================================================== */}

        {!sessionReady ? (
          <div className="mb-5 border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-center gap-3 py-5 text-sm font-semibold text-gray-500">
              <LoaderCircle
                size={18}
                className="animate-spin text-emerald-600"
              />
              Memulihkan sesi fundraiser...
            </div>
          </div>
        ) : !stats ? (
          <div className="mb-5 border border-gray-200 bg-white p-5 md:p-6">
            <form
              onSubmit={handleCheckStats}
              className="flex flex-col gap-3 md:flex-row md:items-end"
            >
              <div className="flex-1">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-gray-500">
                  Nomor WhatsApp Fundraiser
                </label>

                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className="h-11 w-full border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 bg-emerald-600 px-6 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:bg-gray-300"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                    Memuat
                  </>
                ) : (
                  <>
                    Lihat Dashboard
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
              Setelah berhasil masuk, sesi dashboard akan tetap aktif saat
              halaman direfresh selama sesi browser ini belum ditutup.
            </p>
          </div>
        ) : null}

        {stats && (
          <div className="space-y-5">

            {/* ==================================================
                PROFILE
            ================================================== */}

            <section className="border border-gray-200 bg-white p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Fundraiser {SITE_NAME}
                  </p>

                  <h2 className="text-lg font-black text-gray-900">
                    {stats.profile.name}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {referralKey || cleanPhoneNumber(phone)}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                      stats.profile.status === 'approved'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    <ShieldCheck size={13} />

                    {stats.profile.status === 'approved'
                      ? 'Akun Terverifikasi'
                      : 'Menunggu Verifikasi'}
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                PERFORMANCE VIEWS / CONVERSION
            ================================================== */}

            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">

              <StatCard
                icon={<Eye size={19} />}
                label="Tayangan Link"
                value={
                  viewsLoading
                    ? '...'
                    : fundraiserViews.toLocaleString('id-ID')
                }
                description="Pengunjung unik melalui link referral"
              />

              <StatCard
                icon={<Users size={19} />}
                label="Donasi Sukses"
                value={donationCount.toLocaleString('id-ID')}
                description="Transaksi dari referral fundraiser"
              />

              <StatCard
                icon={<Percent size={19} />}
                label="Rasio Konversi"
                value={
                  viewsLoading
                    ? '...'
                    : formatPercent(conversionRate)
                }
                description="Donasi sukses dibanding tayangan link"
              />

              <StatCard
                icon={<HandCoins size={19} />}
                label="Rata-rata Donasi"
                value={rupiah(averageDonation)}
                description="Rata-rata nominal per donasi sukses"
              />

            </section>

            {/* ==================================================
                FINANCIAL SUMMARY
            ================================================== */}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

              <StatCard
                icon={<HandCoins size={19} />}
                label="Dana Dihimpun"
                value={rupiah(totalDonation)}
                description={`${donationCount} donasi sukses`}
              />

              <StatCard
                icon={<CircleDollarSign size={19} />}
                label="Total Komisi"
                value={rupiah(totalCommission)}
                description={`${Math.round(
                  commissionRate * 100
                )}% dari donasi`}
              />

              <StatCard
                icon={<Banknote size={19} />}
                label="Sudah Dicairkan"
                value={rupiah(totalWithdrawn)}
                description="Komisi telah dibayarkan"
              />

              <StatCard
                icon={<WalletCards size={19} />}
                label="Saldo Tersedia"
                value={rupiah(availableCommission)}
                description={
                  pendingWithdrawal > 0
                    ? `${rupiah(
                        pendingWithdrawal
                      )} sedang diproses`
                    : 'Siap diajukan'
                }
                highlight
              />

            </section>

            {/* ==================================================
                WITHDRAWAL ACTION
            ================================================== */}

            <section className="border border-gray-200 bg-white">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">

                <div>
                  <div className="flex items-center gap-2">
                    <Landmark
                      size={18}
                      className="text-purple-600"
                    />

                    <h3 className="text-sm font-black text-gray-900">
                      Pencairan Komisi
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Saldo yang dapat ditarik saat ini{' '}
                    <strong className="text-purple-700">
                      {rupiah(availableCommission)}
                    </strong>
                  </p>

                  {pendingWithdrawal > 0 && (
                    <p className="mt-1 text-[11px] font-semibold text-amber-600">
                      {rupiah(pendingWithdrawal)} sedang
                      menunggu proses pencairan.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    availableCommission <= 0 ||
                    stats.withdrawalConfig?.enabled ===
                      false
                  }
                  onClick={() =>
                    setShowWithdrawal((prev) => !prev)
                  }
                  className="h-10 bg-purple-600 px-5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Ajukan Penarikan
                </button>
              </div>

              {showWithdrawal && (
                <form
                  onSubmit={handleWithdrawal}
                  className="border-t border-gray-100 bg-gray-50 p-5 md:p-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Nominal Penarikan
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Contoh: 100000"
                        value={withdrawAmount}
                        onChange={(e) =>
                          setWithdrawAmount(
                            e.target.value.replace(
                              /[^0-9]/g,
                              ''
                            )
                          )
                        }
                        className="h-11 w-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 outline-none focus:border-purple-500"
                      />

                      {Number(
                        stats.withdrawalConfig?.minimum ||
                          0
                      ) > 0 && (
                        <p className="mt-1.5 text-[10px] text-gray-400">
                          Minimal penarikan{' '}
                          {rupiah(
                            stats.withdrawalConfig
                              ?.minimum
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Catatan
                      </label>

                      <input
                        type="text"
                        placeholder="Opsional"
                        value={withdrawNote}
                        onChange={(e) =>
                          setWithdrawNote(
                            e.target.value
                          )
                        }
                        className="h-11 w-full border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {(stats.profile.bankName ||
                    stats.profile.accountNumber) && (
                    <div className="mt-4 border border-gray-200 bg-white p-4">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Rekening Pencairan
                      </p>

                      <p className="text-xs font-bold text-gray-800">
                        {stats.profile.bankName || '-'}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {stats.profile.accountNumber ||
                          '-'}
                      </p>

                      <p className="text-xs text-gray-500">
                        a.n.{' '}
                        {stats.profile.accountName ||
                          stats.profile.name}
                      </p>
                    </div>
                  )}

                  {withdrawError && (
                    <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                      {withdrawError}
                    </div>
                  )}

                  {withdrawMessage && (
                    <div className="mt-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                      {withdrawMessage}
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={
                        withdrawing ||
                        availableCommission <= 0
                      }
                      className="flex h-10 items-center justify-center gap-2 bg-purple-600 px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-purple-700 disabled:bg-gray-300"
                    >
                      {withdrawing ? (
                        <>
                          <LoaderCircle
                            size={14}
                            className="animate-spin"
                          />
                          Mengirim
                        </>
                      ) : (
                        <>
                          <Banknote size={14} />
                          Kirim Pengajuan
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowWithdrawal(false)
                      }
                      className="h-10 border border-gray-200 bg-white px-5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* ==================================================
                AFFILIATE LINK
            ================================================== */}

            <section className="border border-gray-200 bg-white p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Link2
                  size={18}
                  className="text-purple-600"
                />

                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Link Fundraiser
                  </h3>

                  <p className="text-[11px] text-gray-500">
                    Pilih program yang ingin Anda bagikan.
                  </p>
                </div>
              </div>

              {stats.programs &&
              stats.programs.length > 0 ? (
                <>
                  <select
                    value={selectedSlug}
                    onChange={(e) => {
                      setSelectedSlug(
                        e.target.value
                      );
                      setCopied(false);
                    }}
                    className="h-11 w-full border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="">
                      -- Pilih Program Donasi --
                    </option>

                    {stats.programs.map(
                      (program, index) => (
                        <option
                          key={`${program.slug}-${index}`}
                          value={program.slug}
                        >
                          {program.title}
                        </option>
                      )
                    )}
                  </select>

                  {affiliateUrl && (
                    <div className="mt-3 border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-2 break-all font-mono text-[10px] leading-relaxed text-gray-500">
                        {affiliateUrl}
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="flex h-9 items-center justify-center gap-2 bg-gray-900 px-4 text-[10px] font-black uppercase tracking-wider text-white"
                        >
                          {copied ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}

                          {copied
                            ? 'Tersalin'
                            : 'Salin Link'}
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleShareWhatsApp
                          }
                          className="flex h-9 items-center justify-center gap-2 bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-wider text-white"
                        >
                          <Share2 size={13} />
                          Bagikan WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400">
                  Belum ada program yang tersedia.
                </p>
              )}
            </section>

            {/* ==================================================
                HISTORY
            ================================================== */}

            <section className="border border-gray-200 bg-white">

              {/* TABS */}

              <div className="grid grid-cols-2 border-b border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab('donations')
                  }
                  className={`flex items-center justify-center gap-2 px-3 py-4 text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'donations'
                      ? 'border-b-2 border-emerald-600 bg-emerald-50/40 text-emerald-700'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Users size={14} />
                  Riwayat Donasi
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab('withdrawals')
                  }
                  className={`flex items-center justify-center gap-2 px-3 py-4 text-[10px] font-black uppercase tracking-wider transition ${
                    activeTab === 'withdrawals'
                      ? 'border-b-2 border-purple-600 bg-purple-50/40 text-purple-700'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <History size={14} />
                  Riwayat Penarikan

                  {withdrawals.length > 0 && (
                    <span className="bg-purple-100 px-1.5 py-0.5 text-[9px] text-purple-700">
                      {withdrawals.length}
                    </span>
                  )}
                </button>
              </div>

              {/* DONATION HISTORY */}

              {activeTab === 'donations' && (
                <div className="divide-y divide-gray-100">
                  {stats.history &&
                  stats.history.length > 0 ? (
                    stats.history.map(
                      (item, index) => (
                        <div
                          key={
                            item._id ||
                            `donation-${index}`
                          }
                          className="flex items-center justify-between gap-4 px-4 py-4 md:px-6"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-gray-800">
                              {item.donorName ||
                                'Hamba Allah'}
                            </p>

                            <p className="mt-1 truncate text-[10px] font-semibold text-purple-600">
                              {item.programTitle ||
                                'Sedekah Umum'}
                            </p>

                            {(item.createdAt ||
                              item.paidAt) && (
                              <p className="mt-1 text-[9px] text-gray-400">
                                {formatDate(
                                  item.paidAt ||
                                    item.createdAt
                                )}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="whitespace-nowrap text-xs font-black text-emerald-600">
                              +{rupiah(item.amount)}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <EmptyState
                      icon={
                        <HandCoins size={25} />
                      }
                      title="Belum Ada Donasi"
                      description="Donasi melalui link fundraiser akan muncul di sini."
                    />
                  )}
                </div>
              )}

              {/* WITHDRAWAL HISTORY */}

              {activeTab === 'withdrawals' && (
                <div className="divide-y divide-gray-100">
                  {withdrawals.length > 0 ? (
                    withdrawals.map(
                      (item, index) => {
                        const status =
                          getWithdrawalStatus(
                            item.status
                          );

                        const StatusIcon =
                          status.icon;

                        return (
                          <div
                            key={
                              item._id ||
                              `withdrawal-${index}`
                            }
                            className="p-4 md:p-6"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                              <div>
                                <p className="text-base font-black text-gray-900">
                                  {rupiah(
                                    item.amount
                                  )}
                                </p>

                                <p className="mt-1 text-[10px] text-gray-400">
                                  Diajukan{' '}
                                  {formatDate(
                                    item.requestedAt
                                  )}
                                </p>
                              </div>

                              <span
                                className={`inline-flex w-fit items-center gap-1.5 border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${status.className}`}
                              >
                                <StatusIcon
                                  size={12}
                                />

                                {status.label}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-3 text-[10px] sm:grid-cols-2">

                              {(item.bankName ||
                                item.accountNumber) && (
                                <div>
                                  <span className="block text-gray-400">
                                    Rekening
                                  </span>

                                  <span className="font-bold text-gray-700">
                                    {item.bankName ||
                                      '-'}{' '}
                                    {item.accountNumber ||
                                      ''}
                                  </span>
                                </div>
                              )}

                              {item.paidAt && (
                                <div>
                                  <span className="block text-gray-400">
                                    Dibayarkan
                                  </span>

                                  <span className="font-bold text-gray-700">
                                    {formatDate(
                                      item.paidAt
                                    )}
                                  </span>
                                </div>
                              )}

                              {item.referenceNumber && (
                                <div>
                                  <span className="block text-gray-400">
                                    Nomor Referensi
                                  </span>

                                  <span className="font-mono font-bold text-gray-700">
                                    {
                                      item.referenceNumber
                                    }
                                  </span>
                                </div>
                              )}

                              {item.note && (
                                <div>
                                  <span className="block text-gray-400">
                                    Catatan Fundraiser
                                  </span>

                                  <span className="font-medium text-gray-700">
                                    {item.note}
                                  </span>
                                </div>
                              )}

                              {item.adminNote && (
                                <div className="sm:col-span-2">
                                  <span className="block text-gray-400">
                                    Keterangan Admin
                                  </span>

                                  <span className="font-medium text-gray-700">
                                    {item.adminNote}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <EmptyState
                      icon={<Landmark size={25} />}
                      title="Belum Ada Penarikan"
                      description="Riwayat pengajuan dan pembayaran komisi fundraiser akan muncul di sini."
                    />
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

// ==========================================================
// STAT CARD
// ==========================================================

function StatCard({
  icon,
  label,
  value,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-4 md:p-5 ${
        highlight
          ? 'border-purple-200 bg-purple-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`mb-4 flex h-8 w-8 items-center justify-center ${
          highlight
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {icon}
      </div>

      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-black md:text-base ${
          highlight
            ? 'text-purple-700'
            : 'text-gray-900'
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] leading-relaxed text-gray-400">
        {description}
      </p>
    </div>
  );
}

// ==========================================================
// EMPTY STATE
// ==========================================================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center bg-gray-100 text-gray-400">
        {icon}
      </div>

      <p className="text-xs font-black text-gray-700">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-gray-400">
        {description}
      </p>
    </div>
  );
}