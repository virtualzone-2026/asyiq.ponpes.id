'use client';

import React, { useEffect, useState } from 'react';
import { PortableText } from '@portabletext/react';

import ViewCounter from '@/components/ViewCounter';

// ============================================================================
// IDENTITAS WEBSITE
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';

const FALLBACK_IMAGE = '/images/placeholder.jpg';

// ============================================================================
// HELPERS
// ============================================================================

function cleanPhone(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

function isValidPhone(value: string): boolean {
  const phone = cleanPhone(value);

  // Nomor WA donor boleh kosong.
  return (
    !phone ||
    (phone.length >= 9 && phone.length <= 15)
  );
}

function isValidReferral(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 300
  );
}

function safeMoney(value: unknown): number {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return number;
}

// ============================================================================
// PORTABLE TEXT
// ============================================================================

const portableTextComponents = {
  // ==========================================================================
  // BLOCK / PARAGRAF
  // ==========================================================================
  //
  // PortableText tidak otomatis memberi jarak yang cukup jika style prose
  // tertimpa oleh CSS lain. Karena itu margin paragraf dibuat eksplisit.
  //
  // ==========================================================================

  block: {
    normal: ({ children }: any) => (
      <p className="mb-5 last:mb-0 leading-7 md:leading-8">
        {children}
      </p>
    ),

    h2: ({ children }: any) => (
      <h2 className="mt-8 mb-4 text-xl md:text-2xl font-black leading-tight text-gray-900">
        {children}
      </h2>
    ),

    h3: ({ children }: any) => (
      <h3 className="mt-7 mb-3 text-lg md:text-xl font-black leading-tight text-gray-900">
        {children}
      </h3>
    ),

    h4: ({ children }: any) => (
      <h4 className="mt-6 mb-3 text-base md:text-lg font-black leading-tight text-gray-900">
        {children}
      </h4>
    ),

    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-4 border-emerald-500 pl-4 italic leading-7 text-gray-600">
        {children}
      </blockquote>
    ),
  },

  // ==========================================================================
  // IMAGE
  // ==========================================================================

  types: {
    image: ({ value }: any) => {
      const imageUrl =
        typeof value?.asset?.url === 'string'
          ? value.asset.url
          : '';

      if (!imageUrl) {
        return null;
      }

      const alt =
        typeof value?.alt === 'string' &&
        value.alt.trim()
          ? value.alt.trim()
          : `Dokumentasi ${SITE_NAME}`;

      const caption =
        typeof value?.caption === 'string' &&
        value.caption.trim()
          ? value.caption.trim()
          : '';

      return (
        <figure className="my-7 space-y-2 w-full">

          <div className="overflow-hidden bg-gray-50 border border-gray-100 shadow-sm aspect-[16/9]">

            <img
              src={imageUrl}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.src =
                  FALLBACK_IMAGE;
              }}
            />

          </div>

          {caption && (
            <figcaption className="text-[11px] text-gray-400 text-center italic">
              {caption}
            </figcaption>
          )}

        </figure>
      );
    },
  },

  // ==========================================================================
  // LIST
  // ==========================================================================

  list: {
    bullet: ({ children }: any) => (
      <ul className="my-5 list-disc space-y-2 pl-6">
        {children}
      </ul>
    ),

    number: ({ children }: any) => (
      <ol className="my-5 list-decimal space-y-2 pl-6">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }: any) => (
      <li className="pl-1 leading-7">
        {children}
      </li>
    ),

    number: ({ children }: any) => (
      <li className="pl-1 leading-7">
        {children}
      </li>
    ),
  },

  // ==========================================================================
  // MARKS
  // ==========================================================================

  marks: {
    strong: ({ children }: any) => (
      <strong className="font-extrabold text-gray-800">
        {children}
      </strong>
    ),

    em: ({ children }: any) => (
      <em className="italic">
        {children}
      </em>
    ),

    link: ({
      children,
      value,
    }: any) => {
      const href =
        typeof value?.href === 'string'
          ? value.href.trim()
          : '';

      if (!href) {
        return children;
      }

      const internal =
        href.startsWith('/') ||
        href.startsWith('#');

      return (
        <a
          href={href}
          target={
            internal
              ? undefined
              : '_blank'
          }
          rel={
            internal
              ? undefined
              : 'noopener noreferrer'
          }
          className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
};

// ============================================================================
// KALKULATOR ZAKAT
// ============================================================================

function EmbeddedZakatCalculator({
  onApplyAmount,
}: {
  onApplyAmount: (
    value: string
  ) => void;
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<
    'penghasilan' |
    'maal' |
    'emas'
  >('penghasilan');

  const [
    input1,
    setInput1,
  ] = useState('');

  const [
    input2,
    setInput2,
  ] = useState('');

  // ==========================================================================
  // CATATAN:
  // Harga emas sebaiknya nanti dibuat dinamis jika Anda menginginkan nisab
  // yang selalu mengikuti harga emas terbaru.
  // ==========================================================================

  const HARGA_EMAS = 1_400_000;

  const NISHAB_TAHUNAN =
    85 * HARGA_EMAS;

  const NISHAB_BULANAN =
    Math.round(
      NISHAB_TAHUNAN / 12
    );

  function resetInput() {
    setInput1('');
    setInput2('');
  }

  function changeTab(
    tab:
      | 'penghasilan'
      | 'maal'
      | 'emas'
  ) {
    setActiveTab(tab);
    resetInput();
  }

  function formatRupiah(
    value: string
  ) {
    const raw =
      value.replace(
        /[^0-9]/g,
        ''
      );

    return raw
      ? Number(
          raw
        ).toLocaleString(
          'id-ID'
        )
      : '';
  }

  function getNumber(
    value: string
  ) {
    return (
      Number(
        value.replace(
          /\./g,
          ''
        )
      ) || 0
    );
  }

  let totalZakat = 0;
  let isWajib = false;

  // ==========================================================================
  // PENGHASILAN
  // ==========================================================================

  if (
    activeTab ===
    'penghasilan'
  ) {
    const total =
      getNumber(input1) +
      getNumber(input2);

    isWajib =
      total >=
      NISHAB_BULANAN;

    totalZakat =
      isWajib
        ? Math.round(
            total * 0.025
          )
        : 0;
  }

  // ==========================================================================
  // MAAL
  // ==========================================================================

  else if (
    activeTab === 'maal'
  ) {
    const total =
      getNumber(input1) +
      getNumber(input2);

    isWajib =
      total >=
      NISHAB_TAHUNAN;

    totalZakat =
      isWajib
        ? Math.round(
            total * 0.025
          )
        : 0;
  }

  // ==========================================================================
  // EMAS
  // ==========================================================================

  else {
    const berat =
      Number(input1) || 0;

    isWajib =
      berat >= 85;

    totalZakat =
      isWajib
        ? Math.round(
            berat *
              HARGA_EMAS *
              0.025
          )
        : 0;
  }

  return (
    <div className="border border-gray-200 bg-white overflow-hidden mt-6">

      {/* TABS */}

      <div className="flex border-b border-gray-200 text-[10px] font-black bg-gray-50/50">

        <button
          type="button"
          onClick={() =>
            changeTab(
              'penghasilan'
            )
          }
          className={`flex-1 py-3 text-center border-b-2 ${
            activeTab ===
            'penghasilan'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-400 border-transparent'
          }`}
        >
          PENGHASILAN
        </button>

        <button
          type="button"
          onClick={() =>
            changeTab('maal')
          }
          className={`flex-1 py-3 text-center border-b-2 ${
            activeTab ===
            'maal'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-400 border-transparent'
          }`}
        >
          MAAL / TABUNGAN
        </button>

        <button
          type="button"
          onClick={() =>
            changeTab('emas')
          }
          className={`flex-1 py-3 text-center border-b-2 ${
            activeTab ===
            'emas'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-400 border-transparent'
          }`}
        >
          EMAS SIMPANAN
        </button>

      </div>

      {/* CONTENT */}

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

        <div className="space-y-3 text-left">

          {activeTab !==
          'emas' ? (
            <>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Pendapatan Utama /
                  Tabungan (Rp)
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 px-3 py-2 text-xs font-bold"
                  placeholder="0"
                  value={input1}
                  onChange={(event) =>
                    setInput1(
                      formatRupiah(
                        event.target
                          .value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Bonus / Aset Lainnya
                  (Rp)
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full border border-gray-200 px-3 py-2 text-xs font-bold"
                  placeholder="0"
                  value={input2}
                  onChange={(event) =>
                    setInput2(
                      formatRupiah(
                        event.target
                          .value
                      )
                    )
                  }
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">
                Total Berat Emas
                (Gram)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-200 px-3 py-2 text-xs font-bold"
                placeholder="Contoh: 90"
                value={input1}
                onChange={(event) =>
                  setInput1(
                    event.target.value
                  )
                }
              />
            </div>
          )}

        </div>

        {/* RESULT */}

        <div className="bg-gray-50 border border-gray-100 p-4 text-center space-y-2">

          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Wajib Zakat Anda
          </span>

          <span className="text-xl font-black text-emerald-600 block">
            Rp{' '}
            {totalZakat.toLocaleString(
              'id-ID'
            )}
          </span>

          <button
            type="button"
            disabled={
              totalZakat <= 0
            }
            onClick={() =>
              onApplyAmount(
                totalZakat.toLocaleString(
                  'id-ID'
                )
              )
            }
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 uppercase tracking-wider disabled:bg-gray-300"
          >
            Masukkan ke Form 📥
          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================================
// DONATION FORM TYPES
// ============================================================================

interface FormProps {
  donorName: string;

  setDonorName: (
    value: string
  ) => void;

  donorPhone: string;

  setDonorPhone: (
    value: string
  ) => void;

  paymentMethod: string;

  setPaymentMethod: (
    value: string
  ) => void;

  amount: string;

  handleAmountChange: (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleDonate:
    () => Promise<void>;

  submitting: boolean;
}

// ============================================================================
// DONATION FORM
// ============================================================================

function DonationFormFields({
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
}: FormProps) {
  return (
    <div className="space-y-4 text-left">

      {/* NAMA */}

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
          Nama Donatur
        </label>

        <input
          type="text"
          autoComplete="name"
          placeholder="Hamba Allah (Boleh Kosong)"
          className="w-full border border-gray-200 px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium"
          value={donorName}
          onChange={(event) =>
            setDonorName(
              event.target.value
            )
          }
        />
      </div>

      {/* WHATSAPP */}

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
          Nomor WhatsApp
        </label>

        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Contoh: 081234567890"
          className="w-full border border-gray-200 px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium"
          value={donorPhone}
          onChange={(event) =>
            setDonorPhone(
              event.target.value
            )
          }
        />
      </div>

      {/* PAYMENT */}

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
          Metode Pembayaran
        </label>

        <select
          className="w-full border border-gray-200 px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-bold bg-white cursor-pointer"
          value={
            paymentMethod
          }
          onChange={(event) =>
            setPaymentMethod(
              event.target.value
            )
          }
        >
          <option value="qris">
            🟢 QRIS (E-Wallet &
            M-Banking)
          </option>

          <option value="bri_va">
            🏦 BRI Virtual Account
          </option>

          <option value="bni_va">
            🏦 BNI Virtual Account
          </option>

          <option value="cimb_niaga_va">
            🏦 CIMB Niaga Virtual
            Account
          </option>

          <option value="permata_va">
            🏦 Permata Virtual
            Account
          </option>

          <option value="maybank_va">
            🏦 Maybank Virtual
            Account
          </option>

          <option value="atm_bersama_va">
            🌐 ATM Bersama
          </option>
        </select>
      </div>

      {/* AMOUNT */}

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
          Nominal Dana (Rp)
        </label>

        <div className="relative flex items-center">

          <span className="absolute left-3.5 text-xs font-bold text-gray-400">
            Rp
          </span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Minimal 1.000"
            className="w-full border border-gray-200 pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-emerald-500"
            value={amount}
            onChange={
              handleAmountChange
            }
          />

        </div>
      </div>

      {/* BUTTON */}

      <button
        type="button"
        onClick={handleDonate}
        disabled={submitting}
        className="w-full bg-emerald-600 text-white font-bold py-3.5 transition text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:bg-gray-300 shadow-md shadow-emerald-100"
      >
        {submitting
          ? 'Memproses...'
          : 'Tunaikan Sekarang 🚀'}
      </button>

      <p className="text-[9px] leading-relaxed text-center text-gray-400">
        Transaksi donasi
        diproses melalui{' '}
        <span className="font-bold text-gray-500">
          {SITE_NAME}
        </span>
        .
      </p>

    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CampaignDetailClient({
  slug,
  referral,
}: {
  slug: string;
  referral: string | null;
}) {
  const [
    program,
    setProgram,
  ] =
    useState<any>(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    amount,
    setAmount,
  ] =
    useState('');

  const [
    donorName,
    setDonorName,
  ] =
    useState('');

  const [
    donorPhone,
    setDonorPhone,
  ] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    isMobileFormOpen,
    setIsMobileFormOpen,
  ] =
    useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState('qris');

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    'cerita' |
    'donatur' |
    'laporan'
  >('cerita');

  // ==========================================================================
  // FUNDRAISER MODAL
  // ==========================================================================

  const [
    isFundraiserModalOpen,
    setIsFundraiserModalOpen,
  ] =
    useState(false);

  const [
    fundraiserData,
    setFundraiserData,
  ] =
    useState({
      name: '',
      phone: '',
    });

  const [
    fundraiserSubmitting,
    setFundraiserSubmitting,
  ] =
    useState(false);

  // ==========================================================================
  // FETCH PROGRAM
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadProgram() {
      setLoading(true);

      try {
        const response =
          await fetch(
            '/api/programs',
            {
              method: 'GET',

              headers: {
                Accept:
                  'application/json',
              },

              cache:
                'no-store',

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil program. HTTP ${response.status}`
          );
        }

        const json =
          await response.json();

        const programs =
          Array.isArray(
            json?.data
          )
            ? json.data
            : [];

        const found =
          programs.find(
            (item: any) =>
              item?.slug ===
              slug
          ) || null;

        setProgram(
          json?.success
            ? found
            : null
        );
      } catch (error) {
        if (
          error instanceof
            Error &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          `[${SITE_NAME}] Fetch detail campaign error:`,
          error
        );

        setProgram(null);
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadProgram();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // ==========================================================================
  // FUNDRAISER VIEW TRACKING
  // ==========================================================================
  //
  // Campaign view ditangani ViewCounter.
  //
  // Jika URL:
  //
  // /campaign/program-a?ref=ABC123
  //
  // maka kita juga menambah view:
  //
  // type = fundraiser
  // key  = ABC123
  //
  // Halaman /fundraiser/stats nanti cukup membaca angka ini dengan
  // increment={false}.
  //
  // ==========================================================================

  useEffect(() => {
    if (
      !program ||
      !isValidReferral(
        referral
      )
    ) {
      return;
    }

    const referralCode =
      referral.trim();

    const controller =
      new AbortController();

    async function registerFundraiserView() {
      try {
        const response =
          await fetch(
            '/api/views',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  type:
                    'fundraiser',

                  key:
                    referralCode,
                }),

              cache:
                'no-store',

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          console.warn(
            `[${SITE_NAME}] Gagal mencatat view fundraiser. HTTP ${response.status}`
          );
        }
      } catch (error) {
        if (
          error instanceof
            Error &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          `[${SITE_NAME}] Fundraiser view error:`,
          error
        );
      }
    }

    registerFundraiserView();

    return () => {
      controller.abort();
    };
  }, [
    referral,
    program,
  ]);

  // ==========================================================================
  // AMOUNT
  // ==========================================================================

  function handleAmountChange(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const rawValue =
      event.target.value.replace(
        /[^0-9]/g,
        ''
      );

    setAmount(
      rawValue
        ? Number(
            rawValue
          ).toLocaleString(
            'id-ID'
          )
        : ''
    );
  }

  // ==========================================================================
  // DONATE
  // ==========================================================================

  async function handleDonate() {
    const cleanAmount =
      amount.replace(
        /\./g,
        ''
      );

    const numericAmount =
      Number(cleanAmount);

    // ------------------------------------------------------------------------
    // AMOUNT VALIDATION
    // ------------------------------------------------------------------------

    if (
      !cleanAmount ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount < 1000
    ) {
      alert(
        'Masukkan nominal minimal Rp 1.000.'
      );

      return;
    }

    // ------------------------------------------------------------------------
    // PHONE
    // ------------------------------------------------------------------------

    if (
      !isValidPhone(
        donorPhone
      )
    ) {
      alert(
        'Nomor WhatsApp tidak valid. Gunakan 9–15 digit angka.'
      );

      return;
    }

    // ------------------------------------------------------------------------
    // PROGRAM
    // ------------------------------------------------------------------------

    if (
      !program?.slug
    ) {
      alert(
        'Data program belum siap. Silakan muat ulang halaman.'
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          '/api/checkout',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                slug:
                  program.slug,

                amount:
                  numericAmount,

                donorName:
                  donorName.trim() ||
                  'Hamba Allah',

                donorPhone:
                  cleanPhone(
                    donorPhone
                  ),

                paymentMethod,

                referral:
                  isValidReferral(
                    referral
                  )
                    ? referral.trim()
                    : null,
              }),
          }
        );

      const json =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok ||
        !json?.success ||
        !json?.paymentUrl
      ) {
        throw new Error(
          json?.error ||
            json?.message ||
            'Gagal membuat tautan pembayaran.'
        );
      }

      window.location.assign(
        json.paymentUrl
      );
    } catch (error) {
      console.error(
        `[${SITE_NAME}] Checkout error:`,
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memproses pembayaran.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // REGISTER FUNDRAISER
  // ==========================================================================

  async function handleRegisterFundraiser(
    event:
      React.FormEvent
  ) {
    event.preventDefault();

    const name =
      fundraiserData.name.trim();

    const phone =
      cleanPhone(
        fundraiserData.phone
      );

    if (
      !name ||
      !phone
    ) {
      alert(
        'Mohon isi nama dan nomor WhatsApp Anda.'
      );

      return;
    }

    if (
      phone.length < 9 ||
      phone.length > 15
    ) {
      alert(
        'Nomor WhatsApp tidak valid. Gunakan 9–15 digit angka.'
      );

      return;
    }

    const programId =
      program?._id ||
      program?.id;

    if (!programId) {
      alert(
        'ID program tidak ditemukan. Silakan muat ulang halaman.'
      );

      return;
    }

    setFundraiserSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          '/api/fundraiser',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                name,
                phone,
                programId,
              }),
          }
        );

      const json =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok ||
        !json?.success
      ) {
        throw new Error(
          json?.message ||
            json?.error ||
            'Gagal mengirim pengajuan fundraiser.'
        );
      }

      alert(
        `Pendaftaran fundraiser ${SITE_NAME} berhasil. Silakan periksa WhatsApp untuk informasi berikutnya.`
      );

      setFundraiserData({
        name: '',
        phone: '',
      });

      setIsFundraiserModalOpen(
        false
      );
    } catch (error) {
      console.error(
        `[${SITE_NAME}] Error submit fundraiser:`,
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi gangguan saat memproses pendaftaran.'
      );
    } finally {
      setFundraiserSubmitting(
        false
      );
    }
  }

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">

        <div className="text-center">

          <div className="w-7 h-7 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-gray-500 font-medium text-sm">
            Memuat detail
            program...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // NOT FOUND
  // ==========================================================================

  if (!program) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">

        <div className="text-center">

          <p className="text-gray-800 text-sm font-bold mb-1">
            Program tidak
            ditemukan
          </p>

          <p className="text-gray-400 text-xs">
            Program mungkin telah
            dihapus atau belum
            tersedia.
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // PROGRAM DATA
  // ==========================================================================

  const rawTarget =
    Math.max(
      safeMoney(
        program.targetAmount
      ) ||
        50_000_000,
      1
    );

  const collectedRaw =
    safeMoney(
      program.collectedRaw
    );

  const percentage =
    Math.min(
      Math.max(
        Math.round(
          (collectedRaw /
            rawTarget) *
            100
        ),
        0
      ),
      100
    );

  const isZakatProgram =
    String(
      program.category ||
        ''
    ).toUpperCase() ===
    'ZAKAT';

  const cleanReferral =
    isValidReferral(
      referral
    )
      ? referral.trim()
      : null;

  const donors =
    Array.isArray(
      program.donors
    )
      ? program.donors
      : [];

  const reports =
    Array.isArray(
      program.reports
    )
      ? program.reports
      : [];

  const programImage =
    typeof program.image ===
      'string' &&
    program.image.trim()
      ? program.image
      : FALLBACK_IMAGE;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-16 pb-36 lg:pb-8">

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===================================================================
            MAIN CONTENT
            =================================================================== */}

        <section className="lg:col-span-2 space-y-5 flex flex-col">

          {/* =================================================================
              HEADER
              ================================================================= */}

          <header className="text-left">

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-2">
              {SITE_NAME}
            </p>

            <span className="inline-flex bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 uppercase tracking-wider">
              {program.category ||
                'Kebaikan'}
            </span>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] mt-3 leading-tight tracking-tight">
              {program.title}
            </h1>

            {/* ===============================================================
                VIEWS + REFERRAL
                =============================================================== */}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-400">

              {/* CAMPAIGN VIEW */}

              <ViewCounter
                type="campaign"
                contentKey={slug}
                increment={true}
                className="text-gray-500 font-bold"
              />

              <span>
                kali dilihat
              </span>

              {/* REFERRAL INDICATOR */}

              {cleanReferral && (
                <>
                  <span className="text-gray-300">
                    •
                  </span>

                  <span className="text-purple-600 font-bold">
                    Link Fundraiser
                  </span>
                </>
              )}

            </div>

          </header>

          {/* =================================================================
              IMAGE
              ================================================================= */}

          <figure className="overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">

            <img
              src={
                programImage
              }
              alt={
                program.title ||
                `Program ${SITE_NAME}`
              }
              loading="eager"
              className="w-full h-full object-cover"
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  FALLBACK_IMAGE;
              }}
            />

          </figure>

          {/* =================================================================
              TABS
              ================================================================= */}

          <div className="flex border-b border-gray-200 text-xs font-bold text-gray-400 gap-5 md:gap-6 pt-2 overflow-x-auto">

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'cerita'
                )
              }
              className={`pb-3 whitespace-nowrap focus:outline-none ${
                activeTab ===
                'cerita'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'border-b-2 border-transparent'
              }`}
            >
              DETAIL CERITA
              {isZakatProgram
                ? ' & KALKULATOR'
                : ''}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'donatur'
                )
              }
              className={`pb-3 whitespace-nowrap focus:outline-none ${
                activeTab ===
                'donatur'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'border-b-2 border-transparent'
              }`}
            >
              DONATUR (
              {donors.length})
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'laporan'
                )
              }
              className={`pb-3 whitespace-nowrap focus:outline-none ${
                activeTab ===
                'laporan'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'border-b-2 border-transparent'
              }`}
            >
              LAPORAN (
              {reports.length})
            </button>

          </div>

          {/* =================================================================
              TAB CONTENT
              ================================================================= */}

          <div className="bg-transparent py-2 w-full text-left">

            {/* ===============================================================
                CERITA
                =============================================================== */}

            {activeTab ===
              'cerita' && (
              <div className="space-y-6">

                {/* ZAKAT CALCULATOR */}

                {isZakatProgram && (
                  <div className="bg-emerald-50/40 p-1 border border-dashed border-emerald-600/30">

                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest px-4 pt-3">
                      🧮 Simulasi
                      Kalkulator Zakat
                    </p>

                    <EmbeddedZakatCalculator
                      onApplyAmount={(
                        value
                      ) =>
                        setAmount(
                          value
                        )
                      }
                    />

                  </div>
                )}

                {/* DESCRIPTION */}

                <div className="dynamic-portable-text max-w-none text-[15px] md:text-base font-normal tracking-[0.01em] text-gray-700">

                  {program.description ? (
                    typeof program.description ===
                    'string' ? (

                      <div className="space-y-5">

                        {program.description
                          .split(/\n\s*\n/)
                          .map((paragraph: string) =>
                            paragraph.trim()
                          )
                          .filter(Boolean)
                          .map(
                            (
                              paragraph: string,
                              index: number
                            ) => (
                              <p
                                key={`paragraph-${index}`}
                                className="leading-7 md:leading-8"
                              >
                                {paragraph}
                              </p>
                            )
                          )}

                      </div>

                    ) : (

                      <PortableText
                        value={
                          program.description
                        }
                        components={
                          portableTextComponents
                        }
                      />

                    )
                  ) : (

                    <p className="text-gray-400 italic text-xs">
                      Belum ada cerita detail.
                    </p>

                  )}

                </div>

              </div>
            )}

            {/* ===============================================================
                DONATORS
                =============================================================== */}

            {activeTab ===
              'donatur' && (
              <div className="space-y-3 py-2">

                {donors.length >
                0 ? (
                  [...donors]
                    .reverse()
                    .map(
                      (
                        donor:
                          any,
                        index:
                          number
                      ) => {
                        const amount =
                          safeMoney(
                            donor.amount
                          );

                        const name =
                          typeof donor.name ===
                            'string' &&
                          donor.name.trim()
                            ? donor.name
                            : 'Hamba Allah';

                        return (
                          <div
                            key={
                              donor._id ||
                              `${name}-${index}`
                            }
                            className="bg-white border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3"
                          >

                            <div className="flex items-center space-x-3 min-w-0">

                              <div className="w-9 h-9 shrink-0 bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                {name
                                  .toUpperCase()
                                  .slice(
                                    0,
                                    1
                                  )}
                              </div>

                              <div className="min-w-0">

                                <p className="text-xs font-black text-gray-700 truncate">
                                  {name}
                                </p>

                                <p className="text-[10px] text-gray-400 font-medium">
                                  {donor.date ||
                                    'Baru saja'}
                                </p>

                              </div>

                            </div>

                            <div className="text-right shrink-0">

                              <p className="text-xs font-black text-emerald-600">
                                +Rp{' '}
                                {amount.toLocaleString(
                                  'id-ID'
                                )}
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )
                ) : (
                  <p className="text-center py-10 text-xs text-gray-400">
                    Belum ada
                    donatur.
                  </p>
                )}

              </div>
            )}

            {/* ===============================================================
                REPORT
                =============================================================== */}

            {activeTab ===
              'laporan' && (
              <div className="space-y-4 py-2">

                {reports.length >
                0 ? (
                  [...reports]
                    .reverse()
                    .map(
                      (
                        report:
                          any,
                        index:
                          number
                      ) => (
                        <article
                          key={
                            report._key ||
                            report._id ||
                            index
                          }
                          className="bg-white border border-gray-100 p-5 shadow-sm space-y-3"
                        >

                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">

                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                              {report.title ||
                                'Laporan Penyaluran'}
                            </h3>

                            {report.date && (
                              <span className="text-[10px] text-gray-400 font-bold">
                                {
                                  report.date
                                }
                              </span>
                            )}

                          </div>

                          <div className="text-xs text-gray-600 leading-relaxed prose prose-emerald max-w-none">

                            {typeof report.content ===
                            'string' ? (
                              <p>
                                {
                                  report.content
                                }
                              </p>
                            ) : report.content ? (
                              <PortableText
                                value={
                                  report.content
                                }
                                components={
                                  portableTextComponents
                                }
                              />
                            ) : (
                              <p className="text-gray-400">
                                Belum ada
                                detail laporan.
                              </p>
                            )}

                          </div>

                        </article>
                      )
                    )
                ) : (
                  <div className="border border-dashed border-gray-200 p-8 text-center bg-white">

                    <p className="text-xs text-gray-400 font-medium">
                      Belum ada
                      pembaruan
                      laporan.
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {/* ===================================================================
            DESKTOP SIDEBAR
            =================================================================== */}

        <aside className="hidden lg:block bg-white p-6 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">
            Dana Terkumpul
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-1 text-left">
            Rp{' '}
            {collectedRaw.toLocaleString(
              'id-ID'
            )}
          </p>

          <p className="text-[11px] text-gray-400 mt-0.5 font-medium text-left">
            Target Rp{' '}
            {rawTarget.toLocaleString(
              'id-ID'
            )}
          </p>

          {/* PROGRESS */}

          <div className="w-full bg-gray-100 h-2 mt-4 overflow-hidden">

            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{
                width:
                  `${percentage}%`,
              }}
            />

          </div>

          {/* REFERRAL */}

          {cleanReferral && (
            <div className="mt-3 bg-purple-50 border border-dashed border-purple-200 p-2 text-center">

              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                ✨ Link Fundraiser
                Terdeteksi
              </p>

            </div>
          )}

          {/* DONATION FORM */}

          <div className="mt-4 pt-4 border-t border-gray-100">

            <DonationFormFields
              donorName={
                donorName
              }
              setDonorName={
                setDonorName
              }
              donorPhone={
                donorPhone
              }
              setDonorPhone={
                setDonorPhone
              }
              paymentMethod={
                paymentMethod
              }
              setPaymentMethod={
                setPaymentMethod
              }
              amount={
                amount
              }
              handleAmountChange={
                handleAmountChange
              }
              handleDonate={
                handleDonate
              }
              submitting={
                submitting
              }
            />

          </div>

          {/* FUNDRAISER BUTTON */}

          <button
            type="button"
            onClick={() =>
              setIsFundraiserModalOpen(
                true
              )
            }
            className="w-full bg-white border-2 border-purple-600 text-purple-700 hover:border-emerald-500 hover:text-emerald-600 font-bold py-3 px-4 transition-all duration-300 text-xs tracking-wider uppercase mt-4 flex items-center justify-center space-x-2 border-dashed"
          >

            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>

            <span>
              Menjadi Fundraiser
            </span>

          </button>

        </aside>

      </div>

      {/* =====================================================================
          MOBILE STICKY BAR
          ===================================================================== */}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex flex-col space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">

        {/* TOTAL */}

        <div className="flex justify-between items-end text-left w-full px-0.5">

          <div className="flex flex-col">

            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Terkumpul
            </span>

            <span className="text-lg font-black text-emerald-600 leading-tight">
              Rp{' '}
              {collectedRaw.toLocaleString(
                'id-ID'
              )}
            </span>

          </div>

          <div className="flex flex-col text-right">

            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Target
            </span>

            <span className="text-xs font-bold text-gray-500 leading-tight">
              Rp{' '}
              {rawTarget.toLocaleString(
                'id-ID'
              )}
            </span>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="w-full bg-gray-100 h-1 overflow-hidden">

          <div
            className="bg-emerald-500 h-full"
            style={{
              width:
                `${percentage}%`,
            }}
          />

        </div>

        {/* REFERRAL */}

        {cleanReferral && (
          <div className="bg-purple-50 border border-dashed border-purple-200 py-1 text-center text-[9px] font-bold text-purple-700 uppercase tracking-wider">
            Melalui Link
            Fundraiser Aktif
          </div>
        )}

        {/* DONATE */}

        <button
          type="button"
          onClick={() =>
            setIsMobileFormOpen(
              true
            )
          }
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest py-3.5 shadow-md shadow-red-100 transition-colors"
        >
          Donasi Sekarang 🚀
        </button>

        {/* FUNDRAISER */}

        <button
          type="button"
          onClick={() =>
            setIsFundraiserModalOpen(
              true
            )
          }
          className="w-full bg-white border border-purple-600 text-purple-700 hover:text-emerald-600 hover:border-emerald-500 text-[10px] font-black uppercase tracking-wider py-2.5 transition-colors flex items-center justify-center space-x-2 border-dashed"
        >

          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
          </svg>

          <span>
            Menjadi Fundraiser
          </span>

        </button>

      </div>

      {/* =====================================================================
          MOBILE DONATION MODAL
          ===================================================================== */}

      {isMobileFormOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">

          <button
            type="button"
            aria-label="Tutup form donasi"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() =>
              setIsMobileFormOpen(
                false
              )
            }
          />

          <div className="relative w-full bg-white p-6 space-y-4 max-h-[85vh] overflow-y-auto z-10">

            <div className="flex justify-between items-center pb-2 border-b border-gray-100">

              <h2 className="text-sm font-black uppercase tracking-wide">
                {isZakatProgram
                  ? 'Isi Data Zakat'
                  : 'Isi Data Donasi'}
              </h2>

              <button
                type="button"
                aria-label="Tutup"
                onClick={() =>
                  setIsMobileFormOpen(
                    false
                  )
                }
                className="w-7 h-7 bg-gray-50 text-gray-400 text-xs font-bold flex items-center justify-center border border-gray-100"
              >
                ✕
              </button>

            </div>

            <DonationFormFields
              donorName={
                donorName
              }
              setDonorName={
                setDonorName
              }
              donorPhone={
                donorPhone
              }
              setDonorPhone={
                setDonorPhone
              }
              paymentMethod={
                paymentMethod
              }
              setPaymentMethod={
                setPaymentMethod
              }
              amount={
                amount
              }
              handleAmountChange={
                handleAmountChange
              }
              handleDonate={
                handleDonate
              }
              submitting={
                submitting
              }
            />

          </div>

        </div>
      )}

      {/* =====================================================================
          REGISTER FUNDRAISER MODAL
          ===================================================================== */}

      {isFundraiserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">

          <button
            type="button"
            aria-label="Tutup formulir fundraiser"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() =>
              setIsFundraiserModalOpen(
                false
              )
            }
          />

          <div className="bg-white w-full max-w-sm p-5 shadow-xl border border-gray-200 space-y-4 relative z-10 text-left">

            {/* CLOSE */}

            <button
              type="button"
              aria-label="Tutup"
              onClick={() =>
                setIsFundraiserModalOpen(
                  false
                )
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ✕
            </button>

            {/* HEADER */}

            <div className="space-y-1">

              <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                Registrasi
                Fundraiser
              </h2>

              <p className="text-[10px] font-medium text-gray-400">
                Bantu menghimpun
                dukungan untuk
                program{' '}
                {SITE_NAME}.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleRegisterFundraiser
              }
              className="space-y-3.5 pt-1"
            >

              {/* NAME */}

              <div className="space-y-1">

                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Masukkan nama asli Anda"
                  value={
                    fundraiserData.name
                  }
                  onChange={(
                    event
                  ) =>
                    setFundraiserData(
                      {
                        ...fundraiserData,
                        name:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white"
                />

              </div>

              {/* PHONE */}

              <div className="space-y-1">

                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Nomor WhatsApp
                </label>

                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Contoh: 08123456789"
                  value={
                    fundraiserData.phone
                  }
                  onChange={(
                    event
                  ) =>
                    setFundraiserData(
                      {
                        ...fundraiserData,
                        phone:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white"
                />

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  fundraiserSubmitting
                }
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 text-xs uppercase tracking-widest transition duration-150 mt-1 shadow-sm"
              >
                {fundraiserSubmitting
                  ? 'Mengirim Data...'
                  : 'Kirim Pengajuan 📢'}
              </button>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}