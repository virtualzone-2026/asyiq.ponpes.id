'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto shrink-0 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-12">
        
        {/* Grid Area Atas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Kolom 1: Branding & Tentang */}
          <div className="space-y-4">
            {/* 🚀 FIXED AREA LOGO: Murni merender file image logo asli tanpa teks duplikat */}
            <div className="flex items-center">
              <div className="relative h-11 w-auto flex items-center overflow-hidden">
                <img 
                  src="/images/logo.png" 
                  alt="Logo Pondok Pesantren 'Aasyiqul Qur'an" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Platform resmi Pondok Pesantren 'Aasyiqul Qur'an. Menjembatani kebaikan Anda melalui penyaluran infak, donasi pendidikan, dan wakaf yang aman, transparan, dan amanah.
            </p>
          </div>

          {/* Kolom 2: Tautan Navigasi Cepat */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Navigasi</h3>
            <ul className="space-y-2 text-xs font-semibold text-gray-400">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/program" className="hover:text-emerald-600 transition-colors">Program Pesantren</Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-emerald-600 transition-colors">Tentang Kami</Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-emerald-600 transition-colors">Hubungi Kami</Link>
              </li>
              <li>
                <Link href="https://onislam.web.id" className="hover:text-emerald-600 transition-colors">Media Islam</Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kategori Program */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Kategori</h3>
            <ul className="space-y-2 text-xs font-semibold text-gray-400">
              <li>
                <Link href="/kalkulator" className="hover:text-emerald-600 transition-colors">Kalkulator Zakat</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-600 transition-colors">Berita & Artikel</Link>
              </li>
              <li>
                <Link href="https://www.asyiq.ponpes.id/fundraiser/stats" className="hover:text-emerald-600 transition-colors">Fundraiser</Link>
              </li>
              <li>
                <Link href="/peta-situs" className="hover:text-emerald-600 transition-colors">Peta Situs</Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & Media Sosial */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 text-xs font-medium text-gray-400 leading-relaxed">
              <li>
                <span className="font-bold text-gray-700 block">Alamat Pesantren:</span>
                Pondok Pesantren 'Aasyiqul Qur'an
              </li>
              <li>
                <span className="font-bold text-gray-700 block">WhatsApp:</span>
                <a href="https://wa.me/6281225147373" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 font-semibold transition-colors">
                  0812-2514-7373
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Garis Pembatas Bawah */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-gray-400">
          
          {/* Hak Cipta */}
          <div>
            &copy; {currentYear} <span className="font-bold text-gray-600 uppercase">asyiq.ponpes.id</span>. Hak Cipta Dilindungi.
          </div>

          {/* Tautan Legalitas */}
          <div className="flex space-x-6">
            <Link href="/syarat-ketentuan" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/bantuan" className="hover:text-emerald-600 transition-colors">Bantuan</Link>
          </div>

        </div>

      </div>
    </footer>
  );
}