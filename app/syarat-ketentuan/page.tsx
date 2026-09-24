// app/syarat-ketentuan/page.tsx

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
  title: `Syarat & Ketentuan | ${SITE_NAME}`,

  description:
    `Syarat dan ketentuan penggunaan layanan ${SITE_NAME} melalui ${SITE_DOMAIN}. ` +
    `Pelajari ketentuan donasi, pembayaran, fundraiser, pengelolaan program, ` +
    `serta hak dan tanggung jawab pengguna.`,

  keywords: [
    'syarat ketentuan Asyiqul Quran',
    'donasi Asyiqul Quran',
    'ketentuan donasi online',
    'fundraiser Asyiqul Quran',
    'asyiq.ponpes.id',
    'program kebaikan Asyiqul Quran',
  ],

  alternates: {
    canonical: `${SITE_URL}/syarat-ketentuan`,
  },

  openGraph: {
    title: `Syarat & Ketentuan | ${SITE_NAME}`,

    description:
      `Ketentuan penggunaan layanan donasi, pembayaran, fundraiser, ` +
      `dan program kebaikan ${SITE_NAME}.`,

    url: `${SITE_URL}/syarat-ketentuan`,

    siteName: SITE_NAME,

    locale: 'id_ID',

    type: 'website',
  },
};

// ============================================================================
// PAGE
// ============================================================================

export default function SyaratKetentuanPage() {
  return (
    <main className="min-h-screen bg-white py-10 md:py-14 px-4 md:px-16">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ===================================================================
            HEADER
            =================================================================== */}

        <header className="border-b-2 border-emerald-600 pb-5 space-y-2">

          <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.18em] block">
            TERMS & CONDITIONS
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#333333] tracking-tight leading-tight">
            Syarat & Ketentuan Penggunaan
          </h1>

          <p className="text-xs text-gray-400 font-medium">
            Terakhir diperbarui: 24 September 2026
          </p>

        </header>

        {/* ===================================================================
            INTRO
            =================================================================== */}

        <section className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">

          <p>
            Selamat datang di platform digital resmi{' '}
            <strong>{SITE_NAME}</strong> yang dapat diakses melalui{' '}
            <strong>{SITE_DOMAIN}</strong>.
          </p>

          <p>
            Syarat & Ketentuan ini mengatur penggunaan website, proses donasi,
            pembayaran, pendaftaran fundraiser, serta layanan lain yang tersedia
            melalui platform {SITE_NAME}.
          </p>

          <p>
            Dengan menggunakan layanan yang tersedia di website ini, Anda
            dianggap telah membaca dan memahami ketentuan yang berlaku.
            Jika terdapat bagian yang belum dipahami, Anda dapat menghubungi
            tim kami sebelum melakukan transaksi.
          </p>

        </section>

        {/* ===================================================================
            TERMS
            =================================================================== */}

        <section className="space-y-9">

          {/* =================================================================
              01
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="01">
              Ketentuan Pengguna dan Donatur
            </SectionTitle>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Pengguna bertanggung jawab atas kebenaran informasi yang
                diberikan ketika menggunakan layanan di website ini.
              </li>

              <li>
                Dana yang disalurkan harus berasal dari sumber yang sah dan
                tidak digunakan untuk tujuan yang bertentangan dengan hukum.
              </li>

              <li>
                Pengguna dapat memilih menggunakan nama pribadi atau identitas
                &quot;Hamba Allah&quot; apabila pilihan tersebut tersedia
                pada formulir donasi.
              </li>

              <li>
                Nomor WhatsApp dapat digunakan untuk kebutuhan konfirmasi
                pembayaran, pemberitahuan transaksi, layanan bantuan, maupun
                fitur fundraiser.
              </li>

              <li>
                Pengguna bertanggung jawab memastikan nomor WhatsApp dan
                informasi transaksi yang dimasukkan telah benar.
              </li>

            </ul>

          </div>

          {/* =================================================================
              02
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="02">
              Transaksi dan Pembayaran
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Pembayaran donasi dapat dilakukan melalui metode pembayaran
              yang tersedia pada halaman program, seperti QRIS, Virtual
              Account, mobile banking, e-wallet, atau metode lain yang
              tersedia dari waktu ke waktu.
            </p>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Nominal minimum transaksi pada platform saat ini adalah
                sebesar <strong>Rp1.000</strong>, kecuali terdapat ketentuan
                berbeda pada program tertentu.
              </li>

              <li>
                Status transaksi ditentukan berdasarkan hasil yang diterima
                sistem dari penyedia layanan pembayaran.
              </li>

              <li>
                Transaksi yang masih berstatus menunggu, gagal, atau
                kedaluwarsa belum dianggap sebagai donasi berhasil.
              </li>

              <li>
                Pengguna dianjurkan menyimpan bukti pembayaran apabila
                diperlukan untuk proses verifikasi transaksi.
              </li>

              <li>
                Biaya administrasi tertentu dapat berlaku bergantung pada
                metode pembayaran yang digunakan dan ketentuan penyedia
                layanan pembayaran.
              </li>

            </ul>

          </div>

          {/* =================================================================
              03
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="03">
              Pembatalan dan Pengembalian Dana
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Donasi yang telah berhasil diproses pada prinsipnya ditujukan
              untuk program yang dipilih dan tidak dapat dibatalkan secara
              sepihak setelah dana diterima.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Namun, apabila terjadi transaksi ganda, kesalahan nominal,
              gangguan sistem, atau keadaan lain yang secara wajar
              membutuhkan pemeriksaan, pengguna dapat menghubungi tim
              {` ${SITE_NAME}`} untuk dilakukan verifikasi.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Setiap permintaan pengembalian dana akan ditinjau berdasarkan
              data transaksi, kondisi program, dan status dana yang telah
              diterima atau disalurkan.
            </p>

          </div>

          {/* =================================================================
              04
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="04">
              Pengelolaan dan Penyaluran Dana
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Dana yang berhasil diterima akan dikelola untuk program yang
              dipilih sesuai tujuan dan informasi yang tercantum pada halaman
              program.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              {SITE_NAME} berupaya menyalurkan dana secara amanah,
              bertanggung jawab, dan mempertimbangkan kebutuhan serta kondisi
              penerima manfaat.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Dalam kondisi tertentu, pelaksanaan program dapat mengalami
              perubahan waktu, metode penyaluran, jumlah penerima manfaat,
              atau penyesuaian teknis lainnya karena kondisi di lapangan.
            </p>

          </div>

          {/* =================================================================
              05
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="05">
              Target Penggalangan Dana
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Nilai target yang ditampilkan pada halaman program merupakan
              sasaran penghimpunan dana dan tidak selalu berarti bahwa
              program akan dihentikan secara otomatis ketika target tersebut
              tercapai.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Apabila kebutuhan program masih berlangsung atau terdapat
              kebutuhan lanjutan yang relevan, pengelola dapat memperbarui
              target atau periode penghimpunan dengan informasi yang
              disesuaikan pada halaman program.
            </p>

          </div>

          {/* =================================================================
              06
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="06">
              Ketentuan Fundraiser
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Pengguna dapat mendaftarkan diri sebagai fundraiser pada
              program yang menyediakan fitur tersebut.
            </p>

            <ul className="list-disc pl-5 md:ml-10 text-xs md:text-sm text-gray-600 space-y-2 leading-relaxed">

              <li>
                Pendaftaran fundraiser memerlukan nama dan nomor WhatsApp
                yang valid.
              </li>

              <li>
                Setiap pendaftaran dapat melalui proses verifikasi oleh
                tim {SITE_NAME}.
              </li>

              <li>
                Fundraiser yang telah disetujui dapat memperoleh tautan
                referral atau tautan fundraiser khusus.
              </li>

              <li>
                Statistik donasi yang tampil pada halaman fundraiser hanya
                menghitung transaksi yang terhubung dengan kode atau tautan
                referral sesuai pencatatan sistem.
              </li>

              <li>
                Fundraiser tidak diperbolehkan memberikan informasi palsu,
                menyesatkan, memaksa pihak lain berdonasi, atau menggunakan
                nama {SITE_NAME} untuk kegiatan yang tidak mendapat izin.
              </li>

              <li>
                Pengelola berhak menonaktifkan akses fundraiser apabila
                ditemukan penyalahgunaan sistem atau pelanggaran ketentuan.
              </li>

            </ul>

          </div>

          {/* =================================================================
              07
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="07">
              Laporan dan Informasi Program
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Informasi perkembangan program dan laporan penyaluran dapat
              diterbitkan melalui halaman program atau bagian lain di website
              apabila data laporan telah tersedia.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Jadwal penerbitan laporan dapat berbeda untuk setiap program
              bergantung pada proses pelaksanaan, dokumentasi, dan kondisi
              kegiatan di lapangan.
            </p>

          </div>

          {/* =================================================================
              08
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="08">
              Perlindungan Data Pribadi
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Data seperti nama, nomor WhatsApp, informasi transaksi, dan
              data fundraiser diproses sesuai kebutuhan penyelenggaraan
              layanan.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Informasi lebih lengkap mengenai pengumpulan, penggunaan,
              penyimpanan, dan pengelolaan data pribadi dapat dibaca pada
              halaman Kebijakan Privasi.
            </p>

            <div className="pl-0 md:pl-10 pt-1">

              <Link
                href="/kebijakan-privasi"
                className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Baca Kebijakan Privasi →
              </Link>

            </div>

          </div>

          {/* =================================================================
              09
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="09">
              Gangguan dan Ketersediaan Layanan
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Kami berupaya menjaga website dan layanan tetap tersedia dengan
              baik. Namun layanan dapat mengalami gangguan sementara akibat
              pemeliharaan, masalah jaringan, gangguan penyedia pihak ketiga,
              atau keadaan lain di luar kendali pengelola.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Jika transaksi telah dilakukan tetapi statusnya belum tampil
              dengan benar, pengguna dapat menghubungi tim layanan dengan
              menyertakan bukti pembayaran untuk dilakukan pemeriksaan.
            </p>

          </div>

          {/* =================================================================
              10
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="10">
              Penggunaan Konten Website
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Konten berupa tulisan, desain, foto, materi kampanye, dan
              informasi program yang tersedia di website ini digunakan untuk
              mendukung kegiatan dan informasi {SITE_NAME}.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Pengguna tidak diperkenankan menggunakan identitas
              {` ${SITE_NAME}`} untuk melakukan penipuan, penggalangan dana
              tanpa izin, atau aktivitas lain yang dapat menyesatkan
              masyarakat.
            </p>

          </div>

          {/* =================================================================
              11
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="11">
              Perubahan Syarat & Ketentuan
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              {SITE_NAME} dapat memperbarui Syarat & Ketentuan ini apabila
              terdapat perubahan layanan, fitur, sistem pembayaran, proses
              operasional, atau kebutuhan lainnya.
            </p>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Versi terbaru akan dipublikasikan melalui halaman ini dengan
              mencantumkan tanggal pembaruan.
            </p>

          </div>

          {/* =================================================================
              12
              ================================================================= */}

          <div className="space-y-3">

            <SectionTitle number="12">
              Hubungi Kami
            </SectionTitle>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-0 md:pl-10">
              Jika terdapat pertanyaan mengenai transaksi, program,
              fundraiser, maupun ketentuan penggunaan layanan, silakan
              menghubungi tim {SITE_NAME}.
            </p>

            <div className="pl-0 md:pl-10 pt-1">

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
            NOTICE
            =================================================================== */}

        <section className="border border-emerald-100 bg-emerald-50/40 p-5 md:p-6 space-y-2">

          <h2 className="text-xs font-black text-emerald-800 uppercase tracking-wider">
            Informasi Penting
          </h2>

          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Pastikan Anda selalu melakukan transaksi melalui website resmi
            {` ${SITE_NAME}`} dan memeriksa alamat website sebelum melakukan
            pembayaran.
          </p>

          <p className="text-xs md:text-sm font-bold text-emerald-700">
            {SITE_DOMAIN}
          </p>

        </section>

        {/* ===================================================================
            CTA
            =================================================================== */}

        <section className="bg-gray-50 border border-gray-100 p-6 md:p-8 text-center rounded-none space-y-4">

          <div className="space-y-2">

            <h2 className="text-base font-black text-gray-800">
              Masih Ada Pertanyaan?
            </h2>

            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
              Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan,
              transaksi, atau layanan {SITE_NAME}, silakan hubungi tim kami.
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
// COMPONENT
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