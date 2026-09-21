'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function News() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚀 FIXED DYNAMIC FETCH: Ditambahkan parameter timestamp (?v=) dan cache: no-store agar anti-cache Next.js!
    fetch('/api/news?v=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setNewsList(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('News component fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-400 text-xs text-center py-8">Memuat kabar terbaru...</div>;
  if (newsList.length === 0) return null;

  // Batasi hanya menampilkan maksimal 4 artikel terbaru di halaman utama
  const displayNews = newsList.slice(0, 4);

  return (
    <div className="space-y-6 mt-16">
      {/* Judul Seksi Berita */}
      <div className="border-l-4 border-emerald-500 pl-4 py-1">
        {/* 🚀 FIXED: Menyelaraskan warna judul ke abu-abu gelap #333333 khas Liputan6 */}
        <h2 className="text-xl font-extrabold text-[#333333] tracking-tight">
          Kabar & Informasi
        </h2>
        <p className="text-gray-400 text-xs font-medium">Ikuti perkembangan aktivitas Pondok Pesantren Asyiqul Qur'an</p>
      </div>

      {/* Grid Berita (4 Kolom di Desktop, Responsif) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {displayNews.map((news) => (
          <Link 
            href={`/blog/${news.slug}`} 
            key={news.id || news.slug} 
            className="group flex flex-col space-y-3 cursor-pointer"
          >
            {/* Wrapper Gambar Miniatur Berita: rounded-none di sini */}
            <div className="relative aspect-[16/10] w-full rounded-none overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
              <img 
                src={news.image || '/images/placeholder.jpg'} 
                alt={news.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Konten Judul & Waktu Lampau */}
            <div className="space-y-1 px-0.5">
              <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 transition duration-300">
                {news.title}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                {news.timeAgo || 'Kabar Terbaru'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}