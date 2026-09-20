// components/LayoutClientWrapper.tsx

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // =========================================================
  // HALAMAN KHUSUS YANG TIDAK MEMAKAI LAYOUT WEBSITE PUBLIK
  // =========================================================

  // Sanity Studio
  const isStudioPage =
    pathname === '/studio' ||
    pathname?.startsWith('/studio/');

  // Dashboard / area fundraiser
  //
  // Berlaku untuk:
  // /fundraiser
  // /fundraiser/stats
  // /fundraiser/dashboard
  // dan semua route di bawah /fundraiser
  const isFundraiserPage =
    pathname === '/fundraiser' ||
    pathname?.startsWith('/fundraiser/');

  // =========================================================
  // TENTUKAN APAKAH HEADER / FOOTER DISEMBUNYIKAN
  // =========================================================

  const hidePublicLayout =
    isStudioPage || isFundraiserPage;

  return (
    <div className="min-h-screen flex flex-col">
      {/* =====================================================
          HEADER WEBSITE PUBLIK
          Tidak tampil di Studio & Dashboard Fundraiser
      ===================================================== */}

      {!hidePublicLayout && <Header />}

      {/* =====================================================
          KONTEN UTAMA
      ===================================================== */}

      <main className="flex-1">
        {children}
      </main>

      {/* =====================================================
          FOOTER WEBSITE PUBLIK
          Tidak tampil di Studio & Dashboard Fundraiser
      ===================================================== */}

      {!hidePublicLayout && <Footer />}
    </div>
  );
}