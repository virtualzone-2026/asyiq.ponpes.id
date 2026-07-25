'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🚀 FIXED: Impor useRouter dari next/navigation untuk Next.js App Router
import { Search } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter(); // 🚀 FIXED: Inisialisasi hook router

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 🚀 FIXED: Alihkan rute ke halaman hasil pencarian Google-Style secara dinamis
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    // 🚀 GLASSMORPHISM HEADER
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/40 backdrop-blur-md shadow-sm transition-all duration-300">
      
      {/* Container utama dengan pembagian gap yang proporsional */}
      <div className="max-w-6xl mx-auto px-4 md:px-16 h-16 md:h-20 flex items-center justify-between gap-4 overflow-hidden">
        
        {/* 1. Area Logo (Murni Gambar Saja) */}
        <Link href="/" className="flex items-center group shrink-0 py-1.5">
          <div className="relative h-8 md:h-10 w-auto flex items-center overflow-hidden">
            <img 
              src="/images/asyiq.png" 
              alt="Logo asyiq.ponpes.id" 
              className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </Link>

        {/* 2. Menu Navigasi Tengah (Desktop Only) */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/40 border border-white/40 p-1.5 rounded-full shadow-inner shadow-gray-50/50 shrink-0">
          <Link href="/" className="text-xs font-bold text-emerald-700 bg-white/80 px-4 py-2 rounded-full shadow-sm whitespace-nowrap">
            Beranda
          </Link>
          <Link href="/program" className="text-xs font-bold text-gray-500 hover:text-emerald-600 px-4 py-2 rounded-full transition whitespace-nowrap">
            Program Donasi
          </Link>
          <Link href="/tentang-kami" className="text-xs font-bold text-gray-500 hover:text-emerald-600 px-4 py-2 rounded-full transition whitespace-nowrap">
            Tentang Kami
          </Link>
          <Link href="/kontak" className="text-xs font-bold text-gray-500 hover:text-emerald-600 px-4 py-2 rounded-full transition whitespace-nowrap">
            Hubungi Kami
          </Link>
        </nav>

        {/* 3. Fitur Search Bar Kanan */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-[140px] md:max-w-[180px] w-full">
          <input
            type="text"
            placeholder="Cari program..."
            className="w-full bg-white/50 border border-white/60 text-xs font-medium text-gray-700 pl-4 pr-9 py-2 rounded-xl placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>

      </div>
    </header>
  );
}