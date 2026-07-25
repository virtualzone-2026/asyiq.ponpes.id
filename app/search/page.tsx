'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Globe } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryParam.trim()) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(queryParam)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setResults(json.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Search error:', err);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [queryParam]);

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* ===================================================================
          RESULT CONTAINER AREA (Lebar selaras tegak lurus dengan Header/Footer)
          =================================================================== */}
      <div className="max-w-6xl mx-auto px-4 md:px-16 py-8 space-y-6">
        
        {/* Penanda Statistik Kecepatan Pencarian ala Google */}
        <p className="text-xs text-gray-400 font-normal border-b border-gray-100 pb-3">
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> 
              Menghubungkan ke Sanity Cloud...
            </span>
          ) : (
            `Sekitar ${results.length} hasil ditemukan untuk pencarian "${queryParam}"`
          )}
        </p>

        {/* List Hasil Pencarian ala SERP Google */}
        {!loading && results.length > 0 ? (
          <div className="space-y-7 max-w-3xl">
            {results.map((item) => {
              // Menyesuaikan target routing dengan struktur proyek asyiq.ponpes.id
              const targetUrl = item.type === 'news' ? `/blog/${item.slug}` : `/program/${item.slug}`;
              
              // 🚀 FIXED: Menyelaraskan teks URL display tiruan Google ke asyiq.ponpes.id
              const displayUrl = item.type === 'news' 
                ? `https://www.asyiq.ponpes.id › blog › ${item.slug}` 
                : `https://www.asyiq.ponpes.id › program › ${item.slug}`;

              return (
                <div key={item.id} className="group flex flex-col space-y-1 text-left">
                  
                  {/* URL Hijau/Abu-abu khas Google (Siku tajam / rounded-none) */}
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-normal truncate max-w-full">
                    <span className="p-0.5 bg-gray-50 border border-gray-100 rounded-none text-gray-400 shrink-0">
                      <Globe className="w-3 h-3" />
                    </span>
                    <span className="truncate">{displayUrl}</span>
                  </div>

                  {/* Judul Biru Google Link */}
                  <Link href={targetUrl} className="text-xl font-medium text-[#1a0dab] group-hover:underline leading-snug tracking-normal block pt-0.5">
                    {item.title}
                  </Link>

                  {/* Deskripsi Snippet Khusus Pesantren Asyiq */}
                  <p className="text-sm text-[#4d5156] leading-relaxed font-normal pt-0.5 line-clamp-2">
                    {item.type === 'news' 
                      ? `Informasi dan berita resmi dari lingkungan Pondok Pesantren Asyiq mengenai update kegiatan serta perkembangan ${item.title}. Simak selengkapnya...`
                      : `Program unggulan Pondok Pesantren Asyiq untuk kategori ${item.category || 'Pendidikan'}. Kenali lebih dekat profil, kurikulum, dan informasi pendaftaran santri...`
                    }
                  </p>

                </div>
              );
            })}
          </div>
        ) : null}

        {/* Kondisi Jika Data Kosong */}
        {!loading && results.length === 0 && queryParam.trim() !== '' && (
          <div className="py-8 space-y-3 max-w-2xl text-left">
            <p className="text-base text-gray-800">
              Penelusuran Anda - <strong className="font-semibold">{queryParam}</strong> - tidak cocok dengan dokumen program atau kabar berita apa pun di Pondok Pesantren Asyiq.
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1 font-normal">
              <li>Pastikan semua kata dieja dengan benar sesuai penulisan informasi pesantren.</li>
              <li>Coba kata kunci lain yang lebih umum (misal: "Pesantren", "Santri", "Pendaftaran", "Program").</li>
              <li>Coba kurangi jumlah kata kunci penelusuran.</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

// Wrapper Suspense demi keamanan hidrasi data build time
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400 text-sm font-medium">Mempersiapkan mesin pencari...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}