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

  // Hanya Sanity Studio yang tidak memakai Header & Footer website
  const isStudioPage =
    pathname === '/studio' ||
    pathname?.startsWith('/studio/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header tetap tampil di dashboard fundraiser */}
      {!isStudioPage && <Header />}

      <main className="flex-1">
        {children}
      </main>

      {/* Footer tetap tampil di dashboard fundraiser */}
      {!isStudioPage && <Footer />}
    </div>
  );
}