// app/tentang-kami/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// =========================================================
// IDENTITAS RESMI
// =========================================================

const SITE_NAME = 'asyiq.ponpes.id';

const PONDOK_NAME = "Pondok Pesantren 'Aasyiqul Qur'an";

const SITE_URL = 'https://asyiq.ponpes.id';

const OFFICIAL_WA = '6285328813960';

const DISPLAY_WA = '+62 853-2881-3960';

const OFFICIAL_ADDRESS =
  'Jl. Raya Sirampog, Kalijeruk, Mendala, Kec. Sirampog, Kabupaten Brebes, Jawa Tengah 52272';

// =========================================================
// SEO METADATA
// =========================================================

export const metadata: Metadata = {
  title: "Tentang Kami | Pondok Pesantren 'Aasyiqul Qur'an",

  description:
    "Mengenal lebih dekat Pondok Pesantren 'Aasyiqul Qur'an melalui asyiq.ponpes.id. Pesantren yang berkhidmat dalam pendidikan Al-Qur'an, pembinaan santri, dakwah, serta berbagai program kebaikan.",

  keywords: [
    'asyiq ponpes',
    'asyiq.ponpes.id',
    "pondok pesantren aasyiqul qur'an",
    'pondok pesantren sirampog',
    'pondok pesantren brebes',
    'pesantren al quran brebes',
    'pendidikan santri',
    'donasi pesantren',
    'sedekah pesantren',
    'wakaf pesantren',
  ],

  alternates: {
    canonical: '/tentang-kami',
  },

  openGraph: {
    title: "Tentang Kami | Pondok Pesantren 'Aasyiqul Qur'an",
    description:
      "Mengenal lebih dekat Pondok Pesantren 'Aasyiqul Qur'an, pendidikan santri, dakwah Al-Qur'an, dan berbagai program kebaikan.",
    url: `${SITE_URL}/tentang-kami`,
    siteName: SITE_NAME,
    type: 'website',
  },
};

// =========================================================
// PAGE
// =========================================================

export default function TentangKamiPage() {
  const defaultText = encodeURIComponent(
    "Assalamualaikum Admin asyiq.ponpes.id, saya ingin bertanya mengenai Pondok Pesantren 'Aasyiqul Qur'an."
  );

  const waChatUrl = `https://wa.me/${OFFICIAL_WA}?text=${defaultText}`;

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          1. HERO SECTION
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden

          bg-gradient-to-br
          from-[#062d21]
          via-[#073b2a]
          to-[#041d16]

          px-4
          py-14
          sm:py-16
          md:py-20

          text-white
        "
      >
        {/* Pattern */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0

            opacity-[0.05]

            bg-[radial-gradient(#ffffff_1px,transparent_1px)]
            [background-size:18px_18px]
          "
        />

        {/* Ambient Glow Kiri */}
        <div
          className="
            pointer-events-none
            absolute

            -left-24
            top-1/2

            h-80
            w-80

            -translate-y-1/2

            rounded-full

            bg-emerald-400/10

            blur-[110px]
          "
        />

        {/* Ambient Glow Kanan */}
        <div
          className="
            pointer-events-none
            absolute

            -right-24
            top-0

            h-72
            w-72

            rounded-full

            bg-teal-300/10

            blur-[100px]
          "
        />

        {/* Content */}
        <div
          className="
            relative
            z-10

            mx-auto
            max-w-3xl

            text-center
          "
        >
          {/* Badge */}
          <div
            className="
              mb-5

              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-emerald-300/20

              bg-white/[0.07]

              px-4
              py-2

              backdrop-blur-xl
            "
          >
            <span
              className="
                h-1.5
                w-1.5

                rounded-full

                bg-emerald-400

                shadow-[0_0_10px_rgba(52,211,153,0.8)]
              "
            />

            <span
              className="
                text-[10px]

                font-bold

                uppercase

                tracking-[0.16em]

                text-emerald-200
              "
            >
              Tentang Kami
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-[46px]

              font-bold

              leading-[1.12]

              tracking-[-0.04em]

              text-white
            "
          >
            Membina Generasi Qur&apos;ani,
            <span
              className="
                mt-1
                block

                text-emerald-300
              "
            >
              Menebarkan Kebaikan
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-5

              max-w-2xl

              text-sm
              md:text-[15px]

              leading-7

              text-white/70
            "
          >
            {SITE_NAME} merupakan media informasi dan layanan digital
            {` ${PONDOK_NAME}`} untuk menghadirkan informasi pesantren,
            program pendidikan, kegiatan dakwah, serta berbagai program
            kebaikan bagi santri dan masyarakat.
          </p>
        </div>
      </section>

      {/* =====================================================
          2. PROFIL UTAMA
      ===================================================== */}

      <section
        className="
          mx-auto

          grid
          w-full
          max-w-5xl

          grid-cols-1

          gap-8
          lg:grid-cols-3
          lg:gap-10

          px-4
          py-12
          sm:px-6
          md:py-16
        "
      >
        {/* ===================================================
            KOLOM KIRI
        =================================================== */}

        <div className="lg:col-span-2">
          {/* Heading */}
          <div className="mb-7">
            <span
              className="
                text-[10px]

                font-bold

                uppercase

                tracking-[0.15em]

                text-emerald-600
              "
            >
              Profil Pesantren
            </span>

            <h2
              className="
                mt-1

                text-2xl
                md:text-[28px]

                font-bold

                tracking-[-0.03em]

                text-gray-900
              "
            >
              Siapa Kami?
            </h2>

            <div
              className="
                mt-3

                h-1
                w-12

                rounded-full

                bg-emerald-500
              "
            />
          </div>

          {/* Narrative */}
          <div
            className="
              space-y-5

              text-sm
              md:text-[15px]

              leading-7

              text-gray-600
            "
          >
            <p>
              <strong className="font-semibold text-gray-900">
                {PONDOK_NAME}
              </strong>{' '}
              merupakan lembaga pendidikan Islam yang berkomitmen dalam
              pembinaan generasi Qur&apos;ani melalui pendidikan,
              pembelajaran Al-Qur&apos;an, pembentukan akhlak, serta
              penguatan nilai-nilai keislaman dalam kehidupan sehari-hari.
            </p>

            <p>
              Melalui{' '}
              <strong className="font-semibold text-emerald-600">
                {SITE_NAME}
              </strong>
              , kami menghadirkan layanan digital yang memudahkan
              masyarakat untuk memperoleh informasi mengenai kegiatan
              pesantren, program pendidikan, dakwah, serta berbagai
              kesempatan untuk ikut berpartisipasi dalam program
              kebaikan.
            </p>

            <p>
              Dukungan masyarakat menjadi bagian penting dalam membantu
              keberlangsungan pendidikan para santri, pengembangan
              fasilitas, kegiatan dakwah, serta berbagai kebutuhan
              pesantren. Kami berharap setiap kebaikan yang diberikan
              menjadi amal yang membawa manfaat berkelanjutan.
            </p>
          </div>

          {/* =================================================
              VISI MISI
          ================================================= */}

          <div
            className="
              mt-9

              grid
              grid-cols-1

              gap-5

              md:grid-cols-2
            "
          >
            {/* VISI */}
            <div
              className="
                rounded-2xl

                border
                border-gray-100

                bg-gray-50/70

                p-5
                md:p-6

                shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              "
            >
              <div
                className="
                  mb-4

                  flex
                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  bg-emerald-100

                  text-lg
                "
              >
                🌱
              </div>

              <h3
                className="
                  text-sm

                  font-bold

                  text-gray-900
                "
              >
                Visi Kami
              </h3>

              <p
                className="
                  mt-2

                  text-xs
                  md:text-[13px]

                  leading-6

                  text-gray-500
                "
              >
                Menjadi pesantren yang mampu melahirkan generasi
                Qur&apos;ani, berakhlak mulia, berilmu, mandiri, serta
                mampu memberikan manfaat bagi agama dan masyarakat.
              </p>
            </div>

            {/* MISI */}
            <div
              className="
                rounded-2xl

                border
                border-gray-100

                bg-gray-50/70

                p-5
                md:p-6

                shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              "
            >
              <div
                className="
                  mb-4

                  flex
                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  bg-emerald-100

                  text-lg
                "
              >
                📖
              </div>

              <h3
                className="
                  text-sm

                  font-bold

                  text-gray-900
                "
              >
                Misi Kami
              </h3>

              <ul
                className="
                  mt-2

                  space-y-2

                  text-xs
                  md:text-[13px]

                  leading-6

                  text-gray-500
                "
              >
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-500">✓</span>

                  <span>
                    Menyelenggarakan pendidikan Al-Qur&apos;an dan
                    keislaman secara berkesinambungan.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-500">✓</span>

                  <span>
                    Membentuk santri yang berilmu, beradab, dan memiliki
                    kepedulian sosial.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-500">✓</span>

                  <span>
                    Mengembangkan kegiatan dakwah dan program sosial yang
                    bermanfaat bagi masyarakat.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* =================================================
              KOMITMEN
          ================================================= */}

          <div className="mt-10">
            <span
              className="
                text-[10px]

                font-bold

                uppercase

                tracking-[0.15em]

                text-emerald-600
              "
            >
              Komitmen
            </span>

            <h2
              className="
                mt-1

                text-xl
                md:text-2xl

                font-bold

                tracking-[-0.03em]

                text-gray-900
              "
            >
              Tumbuh Bersama dalam Kebaikan
            </h2>

            <p
              className="
                mt-4

                text-sm
                md:text-[15px]

                leading-7

                text-gray-600
              "
            >
              Kami terus berupaya meningkatkan kualitas pendidikan,
              pelayanan santri, serta pemanfaatan teknologi untuk
              mempermudah masyarakat memperoleh informasi dan ikut
              mendukung berbagai program pesantren.
            </p>
          </div>
        </div>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside
          className="
            w-full

            space-y-5

            lg:sticky
            lg:top-24
          "
        >
          {/* =================================================
              NILAI UTAMA
          ================================================= */}

          <div
            className="
              rounded-2xl

              border
              border-emerald-100

              bg-emerald-50/60

              p-5
            "
          >
            <div
              className="
                mb-5

                flex
                items-center
                gap-3

                border-b
                border-emerald-100

                pb-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9

                  items-center
                  justify-center

                  rounded-xl

                  bg-emerald-100
                "
              >
                🛡️
              </div>

              <div>
                <span
                  className="
                    text-[9px]

                    font-bold

                    uppercase

                    tracking-[0.13em]

                    text-emerald-600
                  "
                >
                  Prinsip Kami
                </span>

                <h3
                  className="
                    mt-0.5

                    text-sm

                    font-bold

                    text-emerald-950
                  "
                >
                  Nilai Dasar
                </h3>
              </div>
            </div>

            <div className="space-y-5">
              {/* 1 */}
              <div className="flex gap-3">
                <span
                  className="
                    flex
                    h-7
                    w-7

                    shrink-0

                    items-center
                    justify-center

                    rounded-lg

                    bg-white

                    text-[11px]

                    font-bold

                    text-emerald-600
                  "
                >
                  01
                </span>

                <div>
                  <h4
                    className="
                      text-xs

                      font-bold

                      text-emerald-950
                    "
                  >
                    Amanah
                  </h4>

                  <p
                    className="
                      mt-1

                      text-[11px]

                      leading-5

                      text-emerald-800/70
                    "
                  >
                    Menjaga kepercayaan masyarakat dalam setiap program
                    dan dukungan yang diberikan.
                  </p>
                </div>
              </div>

              {/* 2 */}
              <div className="flex gap-3">
                <span
                  className="
                    flex
                    h-7
                    w-7

                    shrink-0

                    items-center
                    justify-center

                    rounded-lg

                    bg-white

                    text-[11px]

                    font-bold

                    text-emerald-600
                  "
                >
                  02
                </span>

                <div>
                  <h4
                    className="
                      text-xs

                      font-bold

                      text-emerald-950
                    "
                  >
                    Pendidikan
                  </h4>

                  <p
                    className="
                      mt-1

                      text-[11px]

                      leading-5

                      text-emerald-800/70
                    "
                  >
                    Menjadikan pendidikan Al-Qur&apos;an dan pembentukan
                    akhlak sebagai bagian utama pembinaan santri.
                  </p>
                </div>
              </div>

              {/* 3 */}
              <div className="flex gap-3">
                <span
                  className="
                    flex
                    h-7
                    w-7

                    shrink-0

                    items-center
                    justify-center

                    rounded-lg

                    bg-white

                    text-[11px]

                    font-bold

                    text-emerald-600
                  "
                >
                  03
                </span>

                <div>
                  <h4
                    className="
                      text-xs

                      font-bold

                      text-emerald-950
                    "
                  >
                    Kepedulian
                  </h4>

                  <p
                    className="
                      mt-1

                      text-[11px]

                      leading-5

                      text-emerald-800/70
                    "
                  >
                    Menumbuhkan semangat berbagi dan kepedulian terhadap
                    santri serta masyarakat sekitar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMASI KONTAK
          ================================================= */}

          <div
            className="
              rounded-2xl

              border
              border-gray-100

              bg-white

              p-5

              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            "
          >
            <span
              className="
                text-[9px]

                font-bold

                uppercase

                tracking-[0.13em]

                text-gray-400
              "
            >
              Informasi
            </span>

            <h3
              className="
                mt-1

                text-sm

                font-bold

                text-gray-900
              "
            >
              Sekretariat Pesantren
            </h3>

            <div
              className="
                mt-4

                space-y-4
              "
            >
              {/* Alamat */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-sm">
                  📍
                </span>

                <p
                  className="
                    text-[11px]

                    leading-5

                    text-gray-500
                  "
                >
                  {OFFICIAL_ADDRESS}
                </p>
              </div>

              {/* WA */}
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  💬
                </span>

                <a
                  href={waChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-[11px]

                    font-semibold

                    text-emerald-600

                    transition

                    hover:text-emerald-700
                  "
                >
                  {DISPLAY_WA}
                </a>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  🌐
                </span>

                <a
                  href={SITE_URL}
                  className="
                    text-[11px]

                    font-semibold

                    text-emerald-600

                    transition

                    hover:text-emerald-700
                  "
                >
                  {SITE_NAME}
                </a>
              </div>
            </div>
          </div>

          {/* =================================================
              LEGALITAS
          ================================================= */}

          <div
            className="
              rounded-2xl

              border
              border-gray-100

              bg-gray-50/70

              p-5
            "
          >
            <h3
              className="
                text-xs

                font-bold

                text-gray-800
              "
            >
              Informasi Kelembagaan
            </h3>

            <p
              className="
                mt-2

                text-[11px]

                leading-5

                text-gray-500
              "
            >
              Untuk memperoleh informasi mengenai profil kelembagaan,
              administrasi, maupun dokumen pendukung pesantren, silakan
              menghubungi admin melalui saluran resmi yang tersedia.
            </p>

            <a
              href={waChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-4

                inline-flex

                text-[11px]

                font-bold

                text-emerald-600

                transition

                hover:text-emerald-700
              "
            >
              Hubungi Admin →
            </a>
          </div>
        </aside>
      </section>

      {/* =====================================================
          3. CTA
      ===================================================== */}

      <section
        className="
          border-t
          border-gray-100

          bg-gray-50/70

          px-4
          py-14
        "
      >
        <div
          className="
            mx-auto
            max-w-2xl

            text-center
          "
        >
          <div
            className="
              mx-auto

              flex
              h-12
              w-12

              items-center
              justify-center

              rounded-2xl

              bg-emerald-100

              text-xl
            "
          >
            🌱
          </div>

          <h2
            className="
              mt-5

              text-xl
              md:text-2xl

              font-bold

              tracking-[-0.03em]

              text-gray-900
            "
          >
            Mari Bersama Menanam Kebaikan
          </h2>

          <p
            className="
              mx-auto
              mt-3

              max-w-xl

              text-xs
              md:text-[13px]

              leading-6

              text-gray-500
            "
          >
            Dukungan Anda dapat menjadi bagian dari perjalanan
            pendidikan para santri, pengembangan dakwah Al-Qur&apos;an,
            dan berbagai program kebaikan yang terus memberikan manfaat.
          </p>

          <div
            className="
              mt-6

              flex
              flex-col
              sm:flex-row

              items-center
              justify-center

              gap-3
            "
          >
            <Link
              href="/program"
              className="
                inline-flex

                min-h-[48px]

                items-center
                justify-center

                rounded-xl

                bg-emerald-600

                px-7

                text-xs

                font-bold

                text-white

                shadow-[0_12px_30px_rgba(5,150,105,0.18)]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-emerald-700
              "
            >
              Lihat Program Donasi
            </Link>

            <a
              href={waChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex

                min-h-[48px]

                items-center
                justify-center

                rounded-xl

                border
                border-gray-200

                bg-white

                px-7

                text-xs

                font-bold

                text-gray-700

                transition-all
                duration-300

                hover:border-emerald-200
                hover:text-emerald-700
              "
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}