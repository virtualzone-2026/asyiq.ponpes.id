'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import RelatedNews from '@/components/RelatedNews';

// Custom Serializer untuk PortableText agar kebal dari eror objek {_ref, _type} inside rich text
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?.url) return null;
      return (
        <div className="my-6 space-y-2 w-full text-left">
          <div className="rounded-none overflow-hidden bg-gray-50 border border-gray-100 shadow-sm aspect-[16/9] md:aspect-[21/9]">
            <img 
              src={value.asset.url} 
              alt={typeof value.alt === 'string' ? value.alt : 'Asyiq News Gambar'} 
              className="w-full h-full object-cover"
            />
          </div>
          {value.caption && typeof value.caption === 'string' && (
            <p className="text-[11px] text-gray-400 font-semibold text-center italic">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const hrefStr = typeof value?.href === 'string' ? value.href : '#';
      const rel = !hrefStr.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !hrefStr.startsWith('/') ? '_blank' : undefined;
      return (
        <a 
          href={hrefStr} 
          rel={rel} 
          target={target} 
          className="text-emerald-600 font-bold hover:underline"
        >
          {children}
        </a>
      );
    },
  },
};

interface BlogDetailClientProps {
  slug: string;
}

export default function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${slug}?v=` + Date.now())
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch blog detail error:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium text-sm">Memuat artikel...</div>;
  if (!data || !data.article) return <div className="text-center py-20 text-red-500 font-medium text-sm">Artikel tidak ditemukan gaes.</div>;

  const { article, sidebarCampaigns, allNews } = data;
  
  const renderSafeString = (val: any, fallback: string = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.current) return String(val.current);
    return fallback;
  };

  const formattedDate = article?.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB'
    : 'Kabar Terbaru';

  const categoryString = renderSafeString(article?.category, 'Kabar Terbaru');
  const titleString = renderSafeString(article?.title, 'Detail Berita');

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KOLOM KIRI: KONTEN UTAMA BERITA */}
        <div className="lg:col-span-2 space-y-6 flex flex-col text-left">
          
          {/* BREADCRUMBS */}
          <nav className="w-full flex items-center flex-wrap gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-emerald-600 shrink-0">Home</Link>
            <span className="text-gray-300 shrink-0">/</span>
            <Link href="/blog" className="hover:text-emerald-600 shrink-0">Kabar Berita</Link>
            <span className="text-gray-300 shrink-0">/</span>
            <span className="text-gray-600 truncate max-w-[180px] sm:max-w-[300px] md:max-w-[400px] normal-case">
              {titleString}
            </span>
          </nav>

          {/* HEADLINE */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#333333] leading-tight tracking-tight block w-full mt-2">
            {titleString}
          </h1>

          {/* Meta Data */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 border-b border-gray-100 pb-4 font-semibold w-full">
            <span className="text-gray-700">Oleh: <strong className="text-emerald-600 font-black">Admin Asyiqul Quran</strong></span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase">
              {categoryString}
            </span>
            <span className="text-gray-300">•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Foto Utama Artikel */}
          <div className="space-y-2 w-full">
            <div className="rounded-none overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">
              <img 
                src={typeof article?.imageUrl === 'string' ? article.imageUrl : '/images/placeholder.jpg'} 
                alt={renderSafeString(article?.alt, titleString)} 
                className="w-full h-full object-cover" 
              />
            </div>
            <p className="text-[11px] text-gray-400 font-semibold text-center leading-relaxed max-w-2xl mx-auto">
              Foto: {renderSafeString(article?.caption, `Dokumentasi Kegiatan ${titleString}`)}
            </p>
          </div>

          {/* Isi Konten Utama Berita */}
          <div className="text-gray-700 text-base leading-relaxed space-y-5 font-normal tracking-wide py-4 border-b border-gray-100 prose prose-emerald max-w-none w-full dynamic-portable-text">
            {article?.content ? (
              <PortableText value={article.content} components={portableTextComponents} />
            ) : (
              <p className="text-gray-400 italic">Isi berita belum diunggah dari Sanity Studio.</p>
            )}
          </div>

          {/* Komponen Artikel Terkait */}
          <RelatedNews 
            currentSlug={slug} 
            category={categoryString} 
            allNews={allNews || []} 
          />

          {/* Widget Share */}
          <div className="flex items-center space-x-3 pt-2 w-full">
            <span className="text-xs font-bold text-gray-400 uppercase">Bagikan:</span>
            <button onClick={() => alert('Link berhasil disalin!')} className="px-4 py-2 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 text-xs font-bold rounded-none transition">
              🔗 Salin Tautan
            </button>
          </div>

        </div>

        {/* KOLOM KANAN: SIDEBAR REKOMENDASI DONASI */}
        <div className="space-y-8 lg:sticky lg:top-24 h-fit text-left">
          <div className="bg-gray-50 rounded-none p-5 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
              <span>🌟</span> Rekomendasi Kebaikan
            </h3>
            
            <div className="space-y-3.5">
              {sidebarCampaigns && sidebarCampaigns.map((program: any) => {
                const pct = Math.min(Math.round((Number(program.collectedRaw || 0) / (Number(program.targetAmount) || 50000000)) * 100), 100);
                const pSlug = renderSafeString(program.slug, '');
                const pTitle = renderSafeString(program.title, 'Program Kebaikan');

                return (
                  <Link 
                    href={`/campaign/${pSlug}`} 
                    key={program.id || pSlug || Math.random()} 
                    className="group block bg-white p-3.5 rounded-none border border-gray-200/60 shadow-inner shadow-gray-50 hover:border-emerald-500 transition-all duration-300"
                  >
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition">
                      {pTitle}
                    </h4>
                    <div className="w-full bg-gray-100 h-1.5 rounded-none mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
                      <span>TERCAPAI {pct}%</span>
                      <span className="text-emerald-600">INFAK 🚀</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 px-2">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Topik Populer</h3>
            <div className="flex flex-wrap gap-2">
              {['Sedekah', 'Wakaf', 'Yatim', 'Banyumas', 'Pendidikan', 'Kemanusiaan'].map((tag) => (
                <span key={tag} className="bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold px-3 py-1.5 rounded-none shadow-sm hover:text-emerald-600 cursor-pointer transition">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}