// app/peta-situs/page.tsx

export const dynamic = 'force-dynamic';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from 'next-sanity';

// =========================================================
// IDENTITAS WEBSITE
// =========================================================

const SITE_NAME = 'asyiq.ponpes.id';

const SITE_URL = 'https://asyiq.ponpes.id';

const PONDOK_NAME = "Pondok Pesantren 'Aasyiqul Qur'an";

// =========================================================
// SANITY CLIENT
// =========================================================

const sanityClient = createClient({
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    '19a8r8sr',

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',

  apiVersion: '2026-06-20',

  useCdn: false,
});

// =========================================================
// SEO METADATA
// =========================================================

export const metadata: Metadata = {
  title: `Peta Situs | ${SITE_NAME}`,

  description:
    `Peta situs resmi ${SITE_NAME} untuk memudahkan akses ke halaman utama, program donasi, profil ${PONDOK_NAME}, informasi kontak, berita, kegiatan, dan program kebaikan.`,

  keywords: [
    'peta situs asyiq ponpes',
    'sitemap asyiq ponpes',
    'asyiq.ponpes.id',
    "pondok pesantren aasyiqul qur'an",
    'pondok pesantren sirampog',
    'pondok pesantren brebes',
    'program donasi pesantren',
    'berita pesantren',
  ],

  alternates: {
    canonical: `${SITE_URL}/peta-situs`,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    title: `Peta Situs | ${SITE_NAME}`,

    description:
      `Akses seluruh halaman, program kebaikan, berita, dan informasi ${PONDOK_NAME} melalui peta situs resmi ${SITE_NAME}.`,

    url: `${SITE_URL}/peta-situs`,

    siteName: SITE_NAME,

    locale: 'id_ID',

    type: 'website',
  },
};

// =========================================================
// INTERFACE
// =========================================================

interface SitemapItem {
  title: string;
  slug: string;
  _createdAt?: string;
}

// =========================================================
// PAGE
// =========================================================

export default async function PetaSitusPage() {
  let programs: SitemapItem[] = [];
  let news: SitemapItem[] = [];

  // =======================================================
  // AMBIL DATA SANITY
  // =======================================================

  try {
    const query = `{
      "programs": *[
        _type == "program" &&
        defined(slug.current)
      ] | order(_createdAt desc) {
        title,
        "slug": slug.current,
        _createdAt
      },

      "news": *[
        _type == "news" &&
        defined(slug.current)
      ] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        _createdAt
      }
    }`;

    const data = await sanityClient.fetch<{
      programs?: SitemapItem[];
      news?: SitemapItem[];
    }>(query);

    programs = Array.isArray(data?.programs)
      ? data.programs
      : [];

    news = Array.isArray(data?.news)
      ? data.news
      : [];
  } catch (error) {
    console.error(
      'Gagal memuat data peta situs:',
      error
    );
  }

  // =======================================================
  // HALAMAN STATIS WEBSITE
  // =======================================================

  const halamanInti = [
    {
      title: 'Beranda',
      description:
        'Halaman utama website pesantren',
      url: '/',
    },
    {
      title: 'Program Donasi',
      description:
        'Seluruh program donasi dan kebaikan',
      url: '/program',
    },
    {
      title: 'Tentang Kami',
      description:
        'Profil Pondok Pesantren',
      url: '/tentang-kami',
    },
    {
      title: 'Hubungi Kami',
      description:
        'Alamat dan layanan informasi',
      url: '/kontak',
    },
    {
      title: 'Peta Situs',
      description:
        'Daftar seluruh halaman website',
      url: '/peta-situs',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          HEADER
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

            bg-[radial-gradient(#fff_1px,transparent_1px)]
            [background-size:18px_18px]
          "
        />

        {/* Glow kiri */}
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

        {/* Glow kanan */}
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
              Navigasi Website
            </span>
          </div>

          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-[42px]

              font-bold

              tracking-[-0.035em]

              text-white
            "
          >
            Peta Situs
          </h1>

          <p
            className="
              mx-auto
              mt-4

              max-w-2xl

              text-sm
              md:text-[15px]

              leading-7

              text-white/70
            "
          >
            Temukan seluruh halaman, program kebaikan,
            berita, dan informasi{' '}
            {PONDOK_NAME} melalui struktur navigasi
            resmi {SITE_NAME}.
          </p>
        </div>
      </section>

      {/* =====================================================
          SITEMAP CONTENT
      ===================================================== */}

      <section
        className="
          mx-auto

          w-full
          max-w-6xl

          px-4
          py-10
          sm:px-6
          md:py-14
        "
      >
        {/* ===================================================
            INFO
        =================================================== */}

        <div
          className="
            mb-8

            flex
            flex-col

            gap-3

            border-b
            border-gray-100

            pb-6

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <span
              className="
                text-[10px]

                font-bold

                uppercase

                tracking-[0.15em]

                text-emerald-600
              "
            >
              Direktori
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
              Struktur Website
            </h2>

            <p
              className="
                mt-2

                max-w-2xl

                text-xs
                md:text-[13px]

                leading-6

                text-gray-500
              "
            >
              Peta situs HTML ini membantu pengunjung
              menemukan halaman dan konten yang tersedia
              di {SITE_NAME}.
            </p>
          </div>

          <div
            className="
              inline-flex
              w-fit

              items-center
              gap-2

              rounded-full

              bg-emerald-50

              px-3
              py-2

              text-[10px]

              font-semibold

              text-emerald-700
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Diperbarui otomatis
          </div>
        </div>

        {/* ===================================================
            GRID
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1

            gap-5

            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {/* =================================================
              KOLOM 1 - HALAMAN UTAMA
          ================================================= */}

          <div
            className="
              overflow-hidden

              rounded-2xl

              border
              border-gray-100

              bg-white

              shadow-[0_10px_35px_rgba(15,23,42,0.05)]
            "
          >
            {/* Card Header */}
            <div
              className="
                border-b
                border-gray-100

                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-xl

                    bg-emerald-50

                    text-base
                  "
                >
                  📂
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
                    Navigasi
                  </span>

                  <h2
                    className="
                      mt-0.5

                      text-sm

                      font-bold

                      text-gray-900
                    "
                  >
                    Halaman Utama
                  </h2>
                </div>
              </div>
            </div>

            {/* List */}
            <ul className="divide-y divide-gray-50">
              {halamanInti.map((item) => (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    className="
                      group

                      block

                      px-5
                      py-4

                      transition

                      hover:bg-emerald-50/40
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between

                        gap-4
                      "
                    >
                      <div className="min-w-0">
                        <h3
                          className="
                            text-xs

                            font-bold

                            text-gray-700

                            transition

                            group-hover:text-emerald-700
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-1

                            text-[10px]

                            leading-4

                            text-gray-400
                          "
                        >
                          {item.description}
                        </p>

                        <span
                          className="
                            mt-1.5

                            block

                            truncate

                            text-[9px]

                            text-gray-300
                          "
                        >
                          {`${SITE_URL}${item.url}`}
                        </span>
                      </div>

                      <span
                        className="
                          mt-1

                          shrink-0

                          text-xs

                          text-gray-300

                          transition-transform
                          duration-300

                          group-hover:translate-x-1
                          group-hover:text-emerald-500
                        "
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =================================================
              KOLOM 2 - PROGRAM
          ================================================= */}

          <div
            className="
              overflow-hidden

              rounded-2xl

              border
              border-gray-100

              bg-white

              shadow-[0_10px_35px_rgba(15,23,42,0.05)]
            "
          >
            {/* Header */}
            <div
              className="
                border-b
                border-gray-100

                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-xl

                    bg-emerald-50

                    text-base
                  "
                >
                  🤲
                </div>

                <div className="min-w-0">
                  <span
                    className="
                      text-[9px]

                      font-bold

                      uppercase

                      tracking-[0.13em]

                      text-emerald-600
                    "
                  >
                    Program
                  </span>

                  <h2
                    className="
                      mt-0.5

                      text-sm

                      font-bold

                      text-gray-900
                    "
                  >
                    Program Kebaikan
                    <span
                      className="
                        ml-2

                        rounded-full

                        bg-emerald-50

                        px-2
                        py-0.5

                        text-[9px]

                        text-emerald-600
                      "
                    >
                      {programs.length}
                    </span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Programs */}
            {programs.length > 0 ? (
              <ul
                className="
                  max-h-[520px]

                  divide-y
                  divide-gray-50

                  overflow-y-auto

                  scrollbar-thin
                "
              >
                {programs.map((item) => {
                  const url = `/campaign/${item.slug}`;

                  return (
                    <li key={item.slug}>
                      <Link
                        href={url}
                        className="
                          group

                          block

                          px-5
                          py-4

                          transition

                          hover:bg-emerald-50/40
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between

                            gap-3
                          "
                        >
                          <div className="min-w-0">
                            <h3
                              className="
                                text-xs

                                font-semibold

                                leading-5

                                text-gray-700

                                transition

                                group-hover:text-emerald-700
                              "
                            >
                              {item.title}
                            </h3>

                            <span
                              className="
                                mt-1

                                block

                                truncate

                                text-[9px]

                                text-gray-300
                              "
                            >
                              {`${SITE_URL}${url}`}
                            </span>
                          </div>

                          <span
                            className="
                              mt-1

                              shrink-0

                              text-xs

                              text-gray-300

                              transition-transform
                              duration-300

                              group-hover:translate-x-1
                              group-hover:text-emerald-500
                            "
                          >
                            →
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="text-2xl">
                  🤲
                </div>

                <p
                  className="
                    mt-2

                    text-[11px]

                    text-gray-400
                  "
                >
                  Belum ada program yang diterbitkan.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              KOLOM 3 - BERITA
          ================================================= */}

          <div
            className="
              overflow-hidden

              rounded-2xl

              border
              border-gray-100

              bg-white

              shadow-[0_10px_35px_rgba(15,23,42,0.05)]
            "
          >
            {/* Header */}
            <div
              className="
                border-b
                border-gray-100

                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-xl

                    bg-emerald-50

                    text-base
                  "
                >
                  📰
                </div>

                <div className="min-w-0">
                  <span
                    className="
                      text-[9px]

                      font-bold

                      uppercase

                      tracking-[0.13em]

                      text-emerald-600
                    "
                  >
                    Informasi
                  </span>

                  <h2
                    className="
                      mt-0.5

                      text-sm

                      font-bold

                      text-gray-900
                    "
                  >
                    Berita & Kegiatan

                    <span
                      className="
                        ml-2

                        rounded-full

                        bg-emerald-50

                        px-2
                        py-0.5

                        text-[9px]

                        text-emerald-600
                      "
                    >
                      {news.length}
                    </span>
                  </h2>
                </div>
              </div>
            </div>

            {/* News */}
            {news.length > 0 ? (
              <ul
                className="
                  max-h-[520px]

                  divide-y
                  divide-gray-50

                  overflow-y-auto
                "
              >
                {news.map((item) => {
                  const url = `/news/${item.slug}`;

                  return (
                    <li key={item.slug}>
                      <Link
                        href={url}
                        className="
                          group

                          block

                          px-5
                          py-4

                          transition

                          hover:bg-emerald-50/40
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between

                            gap-3
                          "
                        >
                          <div className="min-w-0">
                            <h3
                              className="
                                text-xs

                                font-semibold

                                leading-5

                                text-gray-700

                                transition

                                group-hover:text-emerald-700
                              "
                            >
                              {item.title}
                            </h3>

                            <span
                              className="
                                mt-1

                                block

                                truncate

                                text-[9px]

                                text-gray-300
                              "
                            >
                              {`${SITE_URL}${url}`}
                            </span>
                          </div>

                          <span
                            className="
                              mt-1

                              shrink-0

                              text-xs

                              text-gray-300

                              transition-transform
                              duration-300

                              group-hover:translate-x-1
                              group-hover:text-emerald-500
                            "
                          >
                            →
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="text-2xl">
                  📰
                </div>

                <p
                  className="
                    mt-2

                    text-[11px]

                    text-gray-400
                  "
                >
                  Belum ada berita yang diterbitkan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            BOTTOM INFO
        =================================================== */}

        <div
          className="
            mt-8

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
          <p
            className="
              text-[10px]

              leading-5

              text-gray-400
            "
          >
            Peta situs ini mengambil daftar program dan
            berita secara otomatis dari sistem pengelolaan
            konten {SITE_NAME}.
          </p>

          <Link
            href="/"
            className="
              shrink-0

              text-[10px]

              font-bold

              text-emerald-600

              transition

              hover:text-emerald-700
            "
          >
            Kembali ke Beranda →
          </Link>
        </div>

        {/* ===================================================
            COPYRIGHT
        =================================================== */}

        <div
          className="
            mt-7

            border-t
            border-gray-100

            pt-5

            text-center

            text-[10px]

            text-gray-400
          "
        >
          © {new Date().getFullYear()}{' '}
          {SITE_NAME} · {PONDOK_NAME}
        </div>
      </section>
    </main>
  );
}