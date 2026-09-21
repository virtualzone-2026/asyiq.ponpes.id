// app/kontak/page.tsx

import React from 'react';
import type { Metadata } from 'next';

// =========================================================
// IDENTITAS RESMI
// =========================================================

const SITE_NAME = 'asyiq.ponpes.id';

const OFFICIAL_WA = '6285328813960';

const DISPLAY_WA = '+62 853-2881-3960';

const OFFICIAL_ADDRESS =
  'Jl. Raya Sirampog, Kalijeruk, Mendala, Kec. Sirampog, Kabupaten Brebes, Jawa Tengah 52272';

const SITE_URL = 'https://asyiq.ponpes.id';

// =========================================================
// SEO METADATA
// =========================================================

export const metadata: Metadata = {
  title: 'Hubungi Kami | asyiq.ponpes.id',

  description:
    'Hubungi admin resmi asyiq.ponpes.id untuk informasi program donasi, infak, sedekah, wakaf, layanan donatur, dan kegiatan Pondok Pesantren.',

  keywords: [
    'kontak asyiq ponpes',
    'asyiq ponpes',
    'asyiq.ponpes.id',
    'pondok pesantren sirampog',
    'pondok pesantren brebes',
    'donasi pondok pesantren',
    'sedekah pesantren',
    'infak pesantren',
    'wakaf pesantren',
    'nomor whatsapp asyiq ponpes',
  ],

  alternates: {
    canonical: '/kontak',
  },

  openGraph: {
    title: 'Hubungi Kami | asyiq.ponpes.id',
    description:
      'Hubungi admin resmi asyiq.ponpes.id untuk informasi program donasi, infak, sedekah, wakaf, dan layanan donatur.',
    url: `${SITE_URL}/kontak`,
    siteName: SITE_NAME,
    type: 'website',
  },
};

// =========================================================
// PAGE
// =========================================================

export default function KontakPage() {
  // =======================================================
  // WHATSAPP
  // =======================================================

  const defaultText = encodeURIComponent(
    'Assalamualaikum Admin asyiq.ponpes.id, saya ingin bertanya mengenai program dan layanan donasi.'
  );

  const waChatUrl = `https://wa.me/${OFFICIAL_WA}?text=${defaultText}`;

  // =======================================================
  // GOOGLE MAPS
  // Menggunakan alamat langsung agar tidak tergantung embed
  // lokasi lama.
  // =======================================================

  const mapsAddress = encodeURIComponent(OFFICIAL_ADDRESS);

  const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsAddress}&output=embed`;

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          1. HERO / BANNER
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#062d21] via-[#073b2a] to-[#041d16] px-4 py-14 text-white md:py-16">
        {/* Pattern lembut */}
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

        {/* Glow */}
        <div
          className="
            pointer-events-none
            absolute
            -left-20
            top-1/2
            h-72
            w-72
            -translate-y-1/2
            rounded-full
            bg-emerald-400/10
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            top-0
            h-72
            w-72
            rounded-full
            bg-teal-300/10
            blur-[100px]
          "
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
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
              Layanan Informasi Resmi
            </span>
          </div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-[-0.035em]
              text-white
              sm:text-4xl
              md:text-[42px]
            "
          >
            Hubungi Kami
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-white/70
              md:text-[15px]
            "
          >
            Kami siap membantu memberikan informasi mengenai program
            donasi, infak, sedekah, wakaf, kegiatan pesantren, maupun
            layanan lainnya melalui saluran resmi {SITE_NAME}.
          </p>
        </div>
      </section>

      {/* =====================================================
          2. CONTACT CARDS
      ===================================================== */}

      <section
        className="
          mx-auto
          grid
          w-full
          max-w-5xl
          grid-cols-1
          gap-5
          px-4
          py-10
          sm:px-6
          md:grid-cols-2
          md:gap-6
          md:py-14
        "
      >
        {/* ===================================================
            KARTU INFORMASI
        =================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-[0_12px_40px_rgba(15,23,42,0.05)]
            sm:p-6
          "
        >
          <div
            className="
              mb-6
              flex
              items-center
              justify-between
              border-b
              border-gray-100
              pb-4
            "
          >
            <div>
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-emerald-600
                "
              >
                Kontak Resmi
              </span>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  tracking-tight
                  text-gray-900
                "
              >
                Informasi & Alamat
              </h2>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-lg
              "
            >
              📍
            </div>
          </div>

          <div className="space-y-6">
            {/* ALAMAT */}
            <div className="flex items-start gap-3.5">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-50
                  text-base
                "
              >
                📍
              </div>

              <div>
                <h3
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-800
                  "
                >
                  Alamat
                </h3>

                <p
                  className="
                    mt-1
                    text-[13px]
                    leading-6
                    text-gray-500
                  "
                >
                  {OFFICIAL_ADDRESS}
                </p>
              </div>
            </div>

            {/* WEBSITE */}
            <div className="flex items-start gap-3.5">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-50
                  text-base
                "
              >
                🌐
              </div>

              <div>
                <h3
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-800
                  "
                >
                  Website Resmi
                </h3>

                <a
                  href={SITE_URL}
                  className="
                    mt-1
                    block
                    text-[13px]
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

            {/* WHATSAPP */}
            <div className="flex items-start gap-3.5">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-50
                  text-base
                "
              >
                💬
              </div>

              <div>
                <h3
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-800
                  "
                >
                  WhatsApp
                </h3>

                <a
                  href={waChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-1
                    block
                    text-[13px]
                    font-semibold
                    text-emerald-600
                    transition
                    hover:text-emerald-700
                  "
                >
                  {DISPLAY_WA}
                </a>
              </div>
            </div>
          </div>

          <div
            className="
              mt-6
              rounded-xl
              border
              border-gray-100
              bg-gray-50/70
              px-4
              py-3
            "
          >
            <p
              className="
                text-[11px]
                leading-5
                text-gray-500
              "
            >
              Untuk pertanyaan mengenai program, konfirmasi donasi,
              atau kendala transaksi, silakan hubungi admin melalui
              WhatsApp resmi di atas.
            </p>
          </div>
        </div>

        {/* ===================================================
            KARTU WHATSAPP
        =================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-emerald-100
            bg-gradient-to-br
            from-emerald-50
            to-white
            p-5
            shadow-[0_12px_40px_rgba(15,23,42,0.05)]
            sm:p-6
          "
        >
          {/* Glow dekoratif */}
          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-16
              h-44
              w-44
              rounded-full
              bg-emerald-400/10
              blur-[60px]
            "
          />

          <div className="relative z-10 flex h-full flex-col">
            <div
              className="
                mb-6
                flex
                items-center
                justify-between
                border-b
                border-emerald-100
                pb-4
              "
            >
              <div>
                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-emerald-600
                  "
                >
                  Layanan Cepat
                </span>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-bold
                    tracking-tight
                    text-emerald-950
                  "
                >
                  Chat WhatsApp
                </h2>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#25D366]/10
                  text-lg
                "
              >
                💬
              </div>
            </div>

            <p
              className="
                text-[13px]
                leading-6
                text-emerald-950/65
              "
            >
              Butuh informasi lebih cepat? Silakan hubungi admin resmi
              {` ${SITE_NAME} `} melalui WhatsApp. Kami akan membantu
              memberikan informasi mengenai program, donasi, dan
              kegiatan pesantren.
            </p>

            {/* Hotline */}
            <div
              className="
                mt-6
                rounded-xl
                border
                border-emerald-100
                bg-white
                p-4
                shadow-sm
              "
            >
              <span
                className="
                  block
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-gray-400
                "
              >
                WhatsApp Resmi
              </span>

              <span
                className="
                  mt-1
                  block
                  text-lg
                  font-bold
                  tracking-tight
                  text-gray-800
                "
              >
                {DISPLAY_WA}
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[11px]
                  text-gray-400
                "
              >
                Admin {SITE_NAME}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-7">
              <a
                href={waChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group

                  flex
                  min-h-[50px]
                  w-full
                  items-center
                  justify-center

                  gap-2

                  rounded-xl

                  bg-[#25D366]
                  px-5

                  text-sm
                  font-bold
                  text-white

                  shadow-[0_12px_30px_rgba(37,211,102,0.20)]

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-[#20bd5a]
                  hover:shadow-[0_16px_34px_rgba(37,211,102,0.25)]
                "
              >
                <span>💬</span>

                <span>Mulai Chat WhatsApp</span>

                <span
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. GOOGLE MAPS
      ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-5xl
          px-4
          pb-12
          sm:px-6
          md:pb-16
        "
      >
        <div className="mb-5">
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-emerald-600
            "
          >
            Lokasi
          </span>

          <h2
            className="
              mt-1
              text-xl
              font-bold
              tracking-tight
              text-gray-900
              md:text-2xl
            "
          >
            Temukan Lokasi Kami
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-[13px]
              leading-6
              text-gray-500
            "
          >
            {OFFICIAL_ADDRESS}
          </p>
        </div>

        <div
          className="
            h-[300px]
            w-full
            overflow-hidden

            rounded-2xl

            border
            border-gray-100

            bg-gray-100

            shadow-[0_12px_40px_rgba(15,23,42,0.06)]

            md:h-[360px]
          "
        >
          <iframe
            src={mapsEmbedUrl}
            title={`Lokasi ${SITE_NAME}`}
            className="h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Alamat bawah maps */}
        <div
          className="
            mt-4
            flex
            flex-col
            gap-3

            rounded-xl

            border
            border-gray-100

            bg-gray-50/70

            px-4
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>

            <p
              className="
                max-w-2xl
                text-[12px]
                leading-5
                text-gray-500
              "
            >
              {OFFICIAL_ADDRESS}
            </p>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              shrink-0

              text-xs
              font-bold

              text-emerald-600

              transition

              hover:text-emerald-700
            "
          >
            Buka Google Maps →
          </a>
        </div>
      </section>
    </main>
  );
}