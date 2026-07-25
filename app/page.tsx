// app/page.tsx
import React from 'react';
import { Metadata } from 'next';
import Hero from '@/components/Hero';
import TotalAccumulationWidget from '@/components/TotalAccumulationWidget'; // 🚀 BARU: Mengimpor widget akumulasi real-time
import Campaign from '@/components/Campaign';
import News from '@/components/News';

// ===================================================================
// 🌐 CONFIG METADATA OPEN GRAPH & TWITTER (ANTI-KOSONG DI MEDSOS)
// ===================================================================
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asyiq.ponpes.id';

export const metadata: Metadata = {
  title: 'Pondok Pesantren Asyiq | Platform Pendidikan, Donasi & Infaq Online Amanah',
  description: 'Tunaikan kepedulian Anda dengan mudah. Dukung program pendidikan santri, pembangunan fasilitas, dan infaq operasional secara transparan dan amanah melalui asyiq.ponpes.id.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pondok Pesantren Asyiq | Platform Pendidikan, Donasi & Infaq Online Amanah',
    description: 'Tunaikan kepedulian Anda dengan mudah. Dukung program pendidikan santri, pembangunan fasilitas, dan infaq operasional secara transparan dan amanah melalui asyiq.ponpes.id.',
    url: `${siteUrl}/`,
    siteName: 'Pondok Pesantren Asyiq',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/images/banner-utama.png`, // 🚀 Banner utama beresolusi 1200x630 untuk pratinjau medsos
        width: 1200,
        height: 630,
        alt: 'Pondok Pesantren Asyiq',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pondok Pesantren Asyiq | Platform Pendidikan, Donasi & Infaq Online Amanah',
    description: 'Tunaikan kepedulian Anda dengan mudah. Dukung program pendidikan santri, pembangunan fasilitas, dan infaq operasional secara transparan dan amanah melalui asyiq.ponpes.id.',
    images: [`${siteUrl}/images/banner-utama.png`],
  },
};

// 🚀 JURUS SAKTI ANTI-CACHE: Memaksa Next.js untuk selalu mengambil data paling segar dari API Sanity saat halaman diakses!
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section (Layar Utama Atas dengan Call to Action) */}
      <Hero />
      
      {/* 2. 🚀 BARU: Widget Akumulasi Dana Real-Time diletakkan strategis di bawah Hero */}
      <TotalAccumulationWidget />
      
      {/* 3. Container Area Konten Utama */}
      {/* 🚀 FIXED: Menyelaraskan md:px-12 menjadi md:px-16 agar presisi lurus bergaris dengan Header, Footer, dan halaman list berita */}
      <div className="min-h-screen bg-gray-50 px-4 md:px-16 py-12">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* ===================================================================
              SEKSI 1: PROGRAM GALANG DANA (LENGKAP DENGAN FILTER & REAL-TIME SEARCH)
              =================================================================== */}
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-6 py-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#333333] tracking-tight">
                Program Pesantren & Galang Dana
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">
                Salurkan infak dan donasi terbaik Anda untuk kemajuan pendidikan santri
              </p>
            </div>
            
            {/* Memanggil komponen grid campaign ter-filter */}
            <Campaign />
          </div>

          {/* ===================================================================
              SEKSI 2: KABAR & INFORMASI TERBARU YAYASAN (GRID 4 KOLOM MINIMALIS)
              =================================================================== */}
          <News />

        </div>
      </div>
    </>
  );
}