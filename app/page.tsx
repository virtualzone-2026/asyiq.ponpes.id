// app/page.tsx

import type { Metadata } from 'next';

import Hero from '@/components/Hero';
import TotalAccumulationWidget from '@/components/TotalAccumulationWidget';
import Campaign from '@/components/Campaign';
import News from '@/components/News';

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_URL = 'https://www.asyiq.ponpes.id';

const PAGE_TITLE =
  'Pondok Pesantren Asyiqul Quran | Pendidikan, Donasi & Infaq Online Amanah';

const PAGE_DESCRIPTION =
  'Tunaikan kepedulian Anda dengan mudah bersama Pondok Pesantren Asyiqul Quran. Dukung pendidikan santri, pembangunan fasilitas pesantren, dakwah Al-Quran, infak, sedekah, zakat, dan wakaf secara amanah.';

/**
 * File wajib berada di:
 *
 * public/images/og-banner.jpg
 *
 * dan harus bisa dibuka dari:
 *
 * https://www.asyiq.ponpes.id/images/og-banner.jpg
 */
const OG_IMAGE = `${SITE_URL}/images/og-banner.jpg`;

// ============================================================================
// SEO METADATA HOMEPAGE
// ============================================================================

export const metadata: Metadata = {
  // --------------------------------------------------------------------------
  // BASIC SEO
  // --------------------------------------------------------------------------

  title: PAGE_TITLE,

  description: PAGE_DESCRIPTION,

  // --------------------------------------------------------------------------
  // CANONICAL
  // --------------------------------------------------------------------------

  alternates: {
    canonical: SITE_URL,
  },

  // ==========================================================================
  // OPEN GRAPH
  // ==========================================================================
  //
  // Metadata ini yang terutama dibaca WhatsApp, Facebook, Telegram,
  // LinkedIn, dan layanan social preview lainnya.
  //
  // ==========================================================================

  openGraph: {
    title: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    url: SITE_URL,

    siteName: SITE_NAME,

    locale: 'id_ID',

    type: 'website',

    images: [
      {
        url: OG_IMAGE,

        width: 1200,

        height: 630,

        type: 'image/jpeg',

        alt:
          'Pondok Pesantren Asyiqul Quran - Pendidikan, Donasi dan Infaq Online',
      },
    ],
  },

  // ==========================================================================
  // TWITTER / X
  // ==========================================================================

  twitter: {
    card: 'summary_large_image',

    title: PAGE_TITLE,

    description: PAGE_DESCRIPTION,

    images: [
      OG_IMAGE,
    ],
  },
};

// ============================================================================
// CACHE
// ============================================================================

/**
 * Homepage boleh direvalidasi setiap 60 detik.
 *
 * Tidak perlu:
 *
 * export const dynamic = 'force-dynamic';
 *
 * karena Campaign, TotalAccumulationWidget, notifikasi donasi, dan data
 * lainnya dapat mengatur mekanisme refresh masing-masing melalui API/fetch.
 *
 * Dengan ini homepage lebih ringan untuk Vercel dan bot SEO.
 */
export const revalidate = 60;

// ============================================================================
// HOMEPAGE
// ============================================================================

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* =====================================================================
          1. HERO
          ===================================================================== */}

      <Hero />

      {/* =====================================================================
          2. TOTAL AKUMULASI
          ===================================================================== */}

      <TotalAccumulationWidget />

      {/* =====================================================================
          3. MAIN CONTENT
          ===================================================================== */}

      <section className="bg-gray-50 px-4 md:px-16 py-10 md:py-14">

        <div className="max-w-5xl mx-auto space-y-14 md:space-y-16">

          {/* =================================================================
              PROGRAM PESANTREN & GALANG DANA
              ================================================================= */}

          <section
            aria-labelledby="program-kebaikan"
            className="space-y-6"
          >

            {/* SECTION HEADER */}

            <div className="border-l-4 border-emerald-500 pl-4 md:pl-6 py-1">

              <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-[0.16em] block mb-1">
                Program Kebaikan
              </span>

              <h1
                id="program-kebaikan"
                className="text-2xl md:text-3xl font-extrabold text-[#333333] tracking-tight leading-tight"
              >
                Program Pesantren & Galang Dana
              </h1>

              <p className="text-gray-500 mt-2 font-medium text-xs md:text-sm leading-relaxed max-w-2xl">
                Salurkan infak, sedekah, zakat, wakaf, dan donasi terbaik
                Anda untuk mendukung pendidikan santri, dakwah Al-Quran,
                fasilitas pesantren, serta berbagai program kebaikan
                Asyiqul Quran.
              </p>

            </div>

            {/* CAMPAIGN */}

            <Campaign />

          </section>

          {/* =================================================================
              BERITA & INFORMASI
              ================================================================= */}

          <section
            aria-label={`Berita dan informasi ${SITE_NAME}`}
          >
            <News />
          </section>

        </div>

      </section>

    </main>
  );
}