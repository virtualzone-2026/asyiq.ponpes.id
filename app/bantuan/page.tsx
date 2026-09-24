// app/bantuan/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// ============================================================================
// CONFIG
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_URL = 'https://www.asyiq.ponpes.id';

const WHATSAPP_NUMBER = '6283840224464';

// Ganti jika email resmi Asyiqul Quran berbeda.
const SUPPORT_EMAIL = 'info@asyiq.ponpes.id';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: `Pusat Bantuan | ${SITE_NAME}`,

  description:
    `Pusat bantuan ${SITE_NAME} untuk informasi donasi, ` +
    `pembayaran, konfirmasi transaksi, fundraiser, dan laporan penyaluran program.`,

  alternates: {
    canonical: `${SITE_URL}/bantuan`,
  },

  openGraph: {
    title: `Pusat Bantuan | ${SITE_NAME}`,
    description:
      `Temukan panduan transaksi, pembayaran, fundraiser, ` +
      `dan informasi penyaluran program ${SITE_NAME}.`,
    url: `${SITE_URL}/bantuan`,
    siteName: SITE_NAME,
    locale: 'id_ID',
    type: 'website',
  },
};

// ============================================================================
// PAGE
// ============================================================================

export default function BantuanPage() {
  return (
    <main className="min-h-screen bg-white py-10 md:py-14 px-4 md:px-16">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ===================================================================
            HEADER
            =================================================================== */}

        <header className="space-y-3">
          <span className="text-[11px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.18em] block">
            PUSAT BANTUAN
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#333333] tracking-tight leading-tight">
            Bagaimana Kami Bisa Membantu?
          </h1>

          <p className="text-sm text-gray-500 font-medium max-w-xl leading-relaxed">
            Temukan informasi dan panduan seputar donasi, pembayaran,
            fundraiser, serta program kebaikan yang dikelola oleh{' '}
            <strong className="font-bold text-gray-700">
              {SITE_NAME}
            </strong>.
          </p>
        </header>

        {/* ===================================================================
            PILIHAN BANTUAN
            =================================================================== */}

        <section
          aria-label="Pilihan bantuan"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* ===============================================================
              KONFIRMASI TRANSAKSI
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              ✓
            </div>

            <h2 className="font-bold text-gray-900">
              Konfirmasi Transaksi
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Pembayaran melalui QRIS dan Virtual Account biasanya
              terdeteksi secara otomatis. Jika transaksi Anda belum
              tercatat, silakan hubungi admin dan lampirkan bukti
              pembayaran.
            </p>
          </div>

          {/* ===============================================================
              METODE PEMBAYARAN
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              Rp
            </div>

            <h2 className="font-bold text-gray-900">
              Metode Pembayaran
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Pembayaran dapat dilakukan melalui metode yang tersedia
              pada halaman program, seperti QRIS, mobile banking,
              e-wallet, maupun Virtual Account.
            </p>
          </div>

          {/* ===============================================================
              LAPORAN PENYALURAN
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              📄
            </div>

            <h2 className="font-bold text-gray-900">
              Laporan Penyaluran
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Informasi perkembangan dan laporan penyaluran dana dapat
              dilihat pada masing-masing halaman program apabila laporan
              telah diterbitkan oleh tim {SITE_NAME}.
            </p>
          </div>

          {/* ===============================================================
              FUNDRAISER
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              📢
            </div>

            <h2 className="font-bold text-gray-900">
              Bantuan Fundraiser
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Sudah mendaftar sebagai fundraiser tetapi belum menerima
              persetujuan, kesulitan mendapatkan tautan fundraiser,
              atau ingin memeriksa hasil donasi? Tim kami siap membantu.
            </p>
          </div>

          {/* ===============================================================
              STATUS DONASI
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              ♡
            </div>

            <h2 className="font-bold text-gray-900">
              Status Donasi
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Jika pembayaran sudah berhasil tetapi donasi belum muncul
              pada daftar donatur, silakan kirimkan nomor WhatsApp,
              nominal, program, dan bukti transaksi kepada admin.
            </p>
          </div>

          {/* ===============================================================
              FAQ
              =============================================================== */}

          <div className="border border-gray-200 p-6 space-y-3 rounded-none hover:border-emerald-500 transition-colors bg-white">
            <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center text-lg">
              ?
            </div>

            <h2 className="font-bold text-gray-900">
              Pertanyaan Umum
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">
              Untuk pertanyaan lain mengenai program, donasi,
              pembayaran, laporan, maupun layanan di website{' '}
              {SITE_NAME}, silakan menghubungi tim layanan kami.
            </p>
          </div>
        </section>

        {/* ===================================================================
            INFO SEBELUM MENGHUBUNGI ADMIN
            =================================================================== */}

        <section className="border border-gray-200 bg-gray-50 p-6 rounded-none">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide mb-3">
            Agar Kami Bisa Membantu Lebih Cepat
          </h2>

          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Jika kendala berkaitan dengan transaksi, siapkan informasi
            berikut saat menghubungi admin:
          </p>

          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex gap-2">
              <span className="text-emerald-600 font-black">•</span>
              Nama atau nomor WhatsApp yang digunakan saat berdonasi.
            </li>

            <li className="flex gap-2">
              <span className="text-emerald-600 font-black">•</span>
              Nama program yang dipilih.
            </li>

            <li className="flex gap-2">
              <span className="text-emerald-600 font-black">•</span>
              Nominal dan waktu transaksi.
            </li>

            <li className="flex gap-2">
              <span className="text-emerald-600 font-black">•</span>
              Bukti pembayaran jika tersedia.
            </li>
          </ul>
        </section>

        {/* ===================================================================
            KONTAK
            =================================================================== */}

        <section className="bg-emerald-900 text-white p-7 md:p-8 rounded-none space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.18em]">
              Layanan Asyiqul Quran
            </span>

            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Masih Membutuhkan Bantuan?
            </h2>

            <p className="text-sm text-emerald-100/80 leading-relaxed max-w-xl">
              Hubungi tim {SITE_NAME} melalui WhatsApp. Jelaskan
              kendala yang Anda alami agar tim kami dapat membantu
              dengan lebih cepat.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Assalamu'alaikum Admin ${SITE_NAME}, saya membutuhkan bantuan terkait layanan di ${SITE_URL}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm py-4 px-5 rounded-none transition-colors"
            >
              <span aria-hidden="true">💬</span>
              Chat Admin via WhatsApp
            </Link>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex w-full items-center justify-center border border-emerald-700 hover:border-emerald-500 hover:bg-emerald-800/60 text-emerald-100 font-semibold text-xs py-3.5 px-5 rounded-none transition-colors"
            >
              Email: {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="pt-4 border-t border-emerald-800">
            <p className="text-[11px] text-emerald-300/70 text-center">
              Website resmi {SITE_NAME}:{' '}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-300 hover:text-white transition"
              >
                www.asyiq.ponpes.id
              </a>
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}