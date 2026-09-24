// app/kebijakan-privasi/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_DOMAIN = 'www.asyiq.ponpes.id';
const SITE_URL = 'https://www.asyiq.ponpes.id';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: `Kebijakan Privasi | ${SITE_NAME}`,

  description:
    `Kebijakan Privasi ${SITE_NAME}. Pelajari bagaimana kami ` +
    `mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi ` +
    `donatur dan pengguna layanan melalui ${SITE_DOMAIN}.`,

  keywords: [
    'kebijakan privasi Asyiqul Quran',
    'privasi Asyiqul Quran',
    'keamanan data donatur',
    'perlindungan data donatur',
    'asyiq.ponpes.id',
    'donasi Asyiqul Quran',
  ],

  alternates: {
    canonical: `${SITE_URL}/kebijakan-privasi`,
  },

  openGraph: {
    title: `Kebijakan Privasi | ${SITE_NAME}`,

    description:
      `Informasi mengenai pengumpulan, penggunaan, penyimpanan, ` +
      `dan perlindungan data pengguna layanan ${SITE_NAME}.`,

    url: `${SITE_URL}/kebijakan-privasi`,

    siteName: SITE_NAME,

    locale: 'id_ID',

    type: 'website',
  },
};

// ============================================================================
// PAGE
// ============================================================================

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen bg-white py-10 md:py-14 px-4 md:px-16">

      <div className="max-w-4xl mx-auto space-y-10">

        {/* ===================================================================
            HEADER
            =================================================================== */}

        <header className="border-b-2 border-emerald-600 pb-5 space-y-2">

          <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.18em] block">
            PRIVACY POLICY
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#333333] tracking-tight">
            Kebijakan Privasi
          </h1>

          <p className="text-xs text-gray-400 font-medium">
            Terakhir diperbarui: 24 September 2026
          </p>

        </header>

        {/* ===================================================================
            PENDAHULUAN
            =================================================================== */}

        <section className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">

          <p>
            <strong>{SITE_NAME}</strong> melalui website resmi{' '}
            <strong>{SITE_DOMAIN}</strong> menghargai privasi setiap
            pengguna, donatur, fundraiser, dan pihak lain yang menggunakan
            layanan kami.
          </p>

          <p>
            Kebijakan Privasi ini menjelaskan jenis informasi yang dapat kami
            kumpulkan, tujuan penggunaannya, bagaimana informasi tersebut
            diproses dan disimpan, serta pilihan dan hak yang tersedia bagi
            Anda terkait data pribadi.
          </p>

          <p>
            Kami berupaya memproses data pribadi secara wajar, terbatas pada
            kebutuhan layanan, dan sesuai dengan ketentuan peraturan
            perundang-undangan mengenai pelindungan data pribadi yang berlaku
            di Indonesia.
          </p>

        </section>

        {/* ===================================================================
            CONTENT
            =================================================================== */}

        <section className="space-y-9">

          {/* =================================================================
              01
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="01">
              Informasi yang Kami Kumpulkan
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Informasi yang kami proses bergantung pada layanan yang Anda
              gunakan. Data tersebut dapat meliputi:
            </p>

            <ul className="space-y-3 text-xs md:text-sm text-gray-600 pl-0 md:pl-10">

              <PrivacyItem title="Identitas">
                Nama yang Anda masukkan saat melakukan donasi atau mendaftar
                sebagai fundraiser. Donatur dapat menggunakan nama
                &quot;Hamba Allah&quot; apabila fitur tersebut tersedia.
              </PrivacyItem>

              <PrivacyItem title="Informasi Kontak">
                Nomor WhatsApp yang digunakan untuk konfirmasi transaksi,
                pemberitahuan pembayaran, komunikasi layanan, atau kebutuhan
                verifikasi fundraiser.
              </PrivacyItem>

              <PrivacyItem title="Data Transaksi">
                Nominal donasi, metode pembayaran, program yang dipilih,
                status pembayaran, waktu transaksi, dan informasi lain yang
                dibutuhkan untuk memproses serta mencatat transaksi.
              </PrivacyItem>

              <PrivacyItem title="Data Fundraiser">
                Nama, nomor WhatsApp, program yang didukung, kode atau tautan
                referral, status akun, serta informasi terkait aktivitas
                penghimpunan dana.
              </PrivacyItem>

              <PrivacyItem title="Data Teknis">
                Dalam keadaan tertentu, sistem atau penyedia infrastruktur
                yang kami gunakan dapat memproses informasi teknis seperti
                alamat IP, jenis perangkat, browser, waktu akses, serta log
                sistem untuk keamanan dan pemeliharaan layanan.
              </PrivacyItem>

            </ul>

          </div>

          {/* =================================================================
              02
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="02">
              Tujuan Penggunaan Data
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Informasi yang dikumpulkan dapat digunakan untuk:
            </p>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Memproses donasi dan membuat transaksi pembayaran.
              </li>

              <li>
                Menentukan serta memperbarui status pembayaran.
              </li>

              <li>
                Mengirim pemberitahuan transaksi melalui WhatsApp atau
                sarana komunikasi lain yang tersedia.
              </li>

              <li>
                Menampilkan informasi donasi pada halaman program apabila
                fitur tersebut digunakan.
              </li>

              <li>
                Mengelola pendaftaran, persetujuan, tautan referral, dan
                statistik fundraiser.
              </li>

              <li>
                Menyusun laporan administratif serta laporan penyaluran
                program.
              </li>

              <li>
                Menangani pertanyaan, keluhan, konfirmasi pembayaran,
                dan kebutuhan bantuan pengguna.
              </li>

              <li>
                Menjaga keamanan, mencegah penyalahgunaan, dan melakukan
                pemeliharaan sistem.
              </li>

              <li>
                Memenuhi kewajiban hukum atau permintaan yang sah dari
                pihak berwenang apabila diwajibkan berdasarkan peraturan
                yang berlaku.
              </li>

            </ul>

          </div>

          {/* =================================================================
              03
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="03">
              Dasar Pemrosesan Data
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Pemrosesan data dilakukan berdasarkan kebutuhan penyelenggaraan
              layanan dan transaksi, persetujuan pengguna apabila diperlukan,
              pemenuhan kewajiban hukum, dan/atau dasar pemrosesan lain yang
              diperbolehkan oleh peraturan perundang-undangan yang berlaku.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Dengan memberikan informasi yang diperlukan untuk melakukan
              transaksi atau menggunakan fitur tertentu, Anda memahami bahwa
              informasi tersebut perlu diproses agar layanan yang Anda minta
              dapat dijalankan.
            </p>

          </div>

          {/* =================================================================
              04
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="04">
              Penyedia Layanan Pihak Ketiga
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Dalam menjalankan layanan digital, {SITE_NAME} dapat menggunakan
              penyedia layanan pihak ketiga untuk fungsi tertentu, antara lain:
            </p>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Penyedia layanan pembayaran atau payment gateway.
              </li>

              <li>
                Penyedia layanan WhatsApp dan pengiriman notifikasi.
              </li>

              <li>
                Penyedia database dan Content Management System (CMS).
              </li>

              <li>
                Penyedia hosting, cloud, dan infrastruktur website.
              </li>

              <li>
                Penyedia layanan teknis lain yang diperlukan untuk
                menjalankan website.
              </li>

            </ul>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Data hanya diberikan atau diproses sejauh diperlukan untuk
              menjalankan fungsi layanan terkait. Kami tidak menjual data
              pribadi pengguna untuk kepentingan pemasaran pihak lain.
            </p>

          </div>

          {/* =================================================================
              05
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="05">
              Keamanan Data
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Kami berupaya menerapkan langkah teknis dan organisatoris yang
              wajar untuk menjaga data pribadi dari akses, penggunaan,
              perubahan, pengungkapan, atau kehilangan yang tidak sah.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Namun demikian, tidak ada sistem elektronik atau transmisi data
              melalui internet yang dapat dijamin sepenuhnya bebas dari
              risiko keamanan. Oleh karena itu, kami terus berupaya
              mengevaluasi dan meningkatkan keamanan layanan sesuai kebutuhan.
            </p>

          </div>

          {/* =================================================================
              06
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="06">
              Penyimpanan Data
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Data pribadi disimpan selama masih diperlukan untuk menyediakan
              layanan, menyelesaikan transaksi, membuat laporan,
              menyelesaikan perselisihan, memenuhi kewajiban administrasi,
              atau memenuhi ketentuan hukum yang berlaku.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Apabila data tidak lagi diperlukan dan tidak terdapat kewajiban
              lain untuk mempertahankannya, data dapat dihapus,
              dianonimkan, atau ditangani sesuai kebijakan penyimpanan data
              yang berlaku.
            </p>

          </div>

          {/* =================================================================
              07
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="07">
              Informasi yang Ditampilkan kepada Publik
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Pada fitur tertentu, sebagian informasi transaksi dapat
              ditampilkan pada halaman program, misalnya nama donatur,
              nominal donasi, dan waktu transaksi.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Apabila Anda memilih menggunakan identitas
              &quot;Hamba Allah&quot;, nama pribadi Anda tidak ditampilkan
              sebagai nama donatur pada bagian publik yang mendukung pilihan
              tersebut.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Nomor WhatsApp tidak ditampilkan secara terbuka sebagai
              informasi publik donatur.
            </p>

          </div>

          {/* =================================================================
              08
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="08">
              Hak Anda atas Data Pribadi
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Sesuai ketentuan yang berlaku dan sepanjang dapat diterapkan,
              Anda dapat mengajukan permintaan terkait data pribadi Anda,
              termasuk:
            </p>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Memperoleh informasi mengenai pemrosesan data pribadi Anda.
              </li>

              <li>
                Memperbarui atau memperbaiki data yang tidak akurat.
              </li>

              <li>
                Meminta akses terhadap data pribadi tertentu yang kami
                kelola.
              </li>

              <li>
                Meminta penghentian pemrosesan atau penghapusan data dalam
                kondisi yang diperbolehkan oleh ketentuan yang berlaku.
              </li>

              <li>
                Menarik persetujuan untuk pemrosesan yang memang didasarkan
                pada persetujuan, sepanjang tidak bertentangan dengan
                kewajiban hukum atau kebutuhan penyelesaian transaksi.
              </li>

            </ul>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Untuk melindungi data dari permintaan yang tidak sah, kami dapat
              meminta informasi tambahan untuk memverifikasi identitas
              pemohon sebelum memenuhi permintaan terkait data pribadi.
            </p>

          </div>

          {/* =================================================================
              09
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="09">
              Tautan ke Website Pihak Lain
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Website kami dapat memuat tautan menuju layanan atau website
              pihak ketiga. Setelah Anda meninggalkan {SITE_DOMAIN},
              pengelolaan data pada website tersebut tunduk pada kebijakan
              privasi masing-masing penyedia.
            </p>

          </div>

          {/* =================================================================
              10
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="10">
              Perubahan Kebijakan Privasi
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu
              apabila terdapat perubahan layanan, teknologi, proses bisnis,
              atau ketentuan hukum.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Tanggal pembaruan terbaru akan dicantumkan pada bagian atas
              halaman ini. Kami menyarankan pengguna untuk meninjau halaman
              ini secara berkala.
            </p>

          </div>

          {/* =================================================================
              11
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="11">
              Hubungi Kami
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Jika Anda memiliki pertanyaan, permintaan, atau keberatan
              terkait pengelolaan data pribadi melalui layanan
              {` ${SITE_NAME}`}, silakan menghubungi kami melalui halaman
              kontak resmi.
            </p>

            <div className="pl-0 md:pl-10 pt-2">

              <Link
                href="/kontak"
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-none transition-colors"
              >
                Hubungi Asyiqul Quran
              </Link>

            </div>

          </div>

        </section>

        {/* ===================================================================
            LEGAL INFORMATION
            =================================================================== */}

        <section className="border border-emerald-100 bg-emerald-50/40 p-5 md:p-6 space-y-2">

          <h2 className="text-xs font-black text-emerald-800 uppercase tracking-wider">
            Komitmen Perlindungan Data
          </h2>

          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            {SITE_NAME} berupaya mengelola data pribadi dengan memperhatikan
            prinsip pelindungan data pribadi dan ketentuan hukum yang berlaku
            di Indonesia, termasuk ketentuan mengenai Pelindungan Data
            Pribadi.
          </p>

        </section>

        {/* ===================================================================
            CTA
            =================================================================== */}

        <section className="bg-gray-50 border border-gray-100 p-6 md:p-8 text-center rounded-none space-y-4">

          <div className="space-y-2">

            <h2 className="text-base font-black text-gray-800">
              Ada Pertanyaan Mengenai Privasi?
            </h2>

            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
              Jika Anda memiliki pertanyaan atau ingin mengajukan permintaan
              terkait data pribadi Anda, silakan hubungi tim
              {` ${SITE_NAME}`}.
            </p>

          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-1">

            <Link
              href="/kontak"
              className="inline-flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-none transition"
            >
              Hubungi Admin
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-none transition shadow-sm"
            >
              Kembali ke Beranda
            </Link>

          </div>

          <div className="pt-4 border-t border-gray-200">

            <p className="text-[10px] text-gray-400">
              Website resmi {SITE_NAME}:{' '}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                {SITE_DOMAIN}
              </a>
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionTitle({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-sm md:text-base font-black text-gray-950 uppercase tracking-wide flex items-start gap-2">
      <span className="text-emerald-600 shrink-0">
        {number}.
      </span>

      <span>
        {children}
      </span>
    </h2>
  );
}

function PrivacyItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2 leading-relaxed">

      <span className="text-emerald-600 font-black mt-[1px]">
        •
      </span>

      <span>
        <strong className="text-gray-700">
          {title}:
        </strong>{' '}
        {children}
      </span>

    </li>
  );
}