'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    // 🚀 CONTAINER UTAMA: Desain Full-Width Center yang Bersih, Megah & Futuristik
    <section className="relative w-full min-h-[95vh] flex items-center justify-center bg-gray-950 overflow-hidden shrink-0 pb-24 pt-32 md:pt-20">
      
      {/* 1. Background Dokumentasi: Terang, Berwarna Asli & Tampak Jelas */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-45 scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: "url('/images/hero-bg.png')",
          filter: 'contrast(105%)'
        }}
      />

      {/* 2. Cyberpunk Tech Grid Layout */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#37415115_1px,transparent_1px),linear-gradient(to_bottom,#37415115_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_75%,transparent_100%)]" />
      
      {/* Aurora Ambient Glow Terpusat di Belakang Teks */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] z-10 animate-pulse duration-[4000ms]" />

      {/* 3. Overlay Gradasi Gelap Dinamis: Menjaga Kontras Tengah Namun Membiarkan Gambar Sisi Luar Menyala */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-gray-950/80 via-gray-950/50 to-gray-950" />
      <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent to-gray-950/40" />

      {/* 4. Konten Utama Terpusat (Max-w-5xl agar Fokus Baca Nyaman) */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-12 w-full text-center flex flex-col items-center">
        
        {/* Tagline Yayasan dengan Aksen Border Tech */}
        <div className="inline-flex items-center gap-2 mb-8 bg-emerald-950/50 border border-emerald-500/30 px-4 py-2 rounded shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-[10px] md:text-xs font-black tracking-widest text-emerald-400 uppercase">
            Pondok Pesantren 'Aasyiqul Qur'an
          </span>
        </div>

        {/* Headline Utama: Kokoh, Padat & Berkarakter */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[1.05] mb-8 max-w-4xl">
          MEMBINA GENERASI QUR'ANI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-[0_0_25px_rgba(52,211,153,0.35)] normal-case font-medium italic inline-block mt-2 font-serif tracking-normal">
            Menuju Keberkahan Abadi
          </span>
        </h1>

        {/* Deskripsi Pendek Pendukung */}
        <p className="text-gray-100 text-sm md:text-lg mb-12 max-w-3xl leading-relaxed tracking-wide font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Salurkan infak, donasi pendidikan, dan wakaf terbaik Anda secara transparan, amanah, dan instan untuk kemajuan Pondok Pesantren 'Aasyiqul Qur'an. Setiap rupiah adalah investasi amal jariyah bagi para penghafal Al-Qur'an.
        </p>

        {/* Tombol CTA Premium Action Button */}
        <Link
          href="/program"
          className="group relative inline-flex items-center justify-center gap-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded shadow-xl shadow-emerald-950/60 border border-emerald-400/30 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20"
        >
          {/* Efek Kilatan Garis Cahaya Saat Hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <span className="relative z-10 flex items-center gap-2">
            ★ Donasi & Infaq Sekarang
          </span>
          <svg 
            className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1 relative z-10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* 5. DEKORASI BATAS BAWAH: Potongan Kurva Putih Presisi Mulus */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-30 pointer-events-none">
        <svg 
          className="relative block w-full h-[45px] md:h-[75px]" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C300,95 900,15 1200,65 L1200,120 L0,120 Z" 
            className="fill-white"
          />
        </svg>
      </div>

    </section>
  );
}