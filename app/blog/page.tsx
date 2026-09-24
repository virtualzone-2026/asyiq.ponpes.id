'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_NAME = 'asyiq.ponpes.id';

const FALLBACK_IMAGE = '/images/banner-utama.png';

// ============================================================================
// TYPES
// ============================================================================

interface NewsItem {
  id?: string;
  _id?: string;
  slug: string;
  title: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  timeAgo?: string;
  excerpt?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getImage(post: NewsItem) {
  return post.image || post.imageUrl || FALLBACK_IMAGE;
}

function getExcerpt(post: NewsItem) {
  if (
    typeof post.excerpt === 'string' &&
    post.excerpt.trim().length > 0
  ) {
    return post.excerpt;
  }

  return `Baca informasi lengkap mengenai ${post.title} di ${SITE_NAME}.`;
}

// ============================================================================
// BLOG PAGE
// ============================================================================

export default function BlogPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================================================
  // FETCH NEWS
  // ==========================================================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/news', {
          method: 'GET',

          headers: {
            Accept: 'application/json',
          },

          /**
           * Browser diperbolehkan menggunakan cache normal.
           * Pengaturan cache utama sebaiknya tetap dilakukan di API/server.
           */
          cache: 'default',

          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(
            `Gagal mengambil berita. HTTP status: ${res.status}`
          );
        }

        const json = await res.json();

        if (json?.success && Array.isArray(json?.data)) {
          setNewsList(json.data);
        } else {
          setNewsList([]);
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          return;
        }

        console.error(
          `[${SITE_NAME}] Client Fetch News Error:`,
          err
        );

        setError(
          'Terjadi gangguan saat mengambil informasi terbaru.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      controller.abort();
    };
  }, []);

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />

          <p className="text-gray-400 font-medium text-sm">
            Memuat informasi terbaru...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 font-bold text-sm mb-1">
            Informasi belum dapat dimuat
          </p>

          <p className="text-gray-400 text-xs leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // EMPTY
  // ==========================================================================

  if (newsList.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-700 font-bold text-sm mb-1">
            Belum ada artikel
          </p>

          <p className="text-gray-400 text-xs">
            Informasi terbaru dari {SITE_NAME} akan tampil di halaman ini.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // DATA
  // ==========================================================================

  const heroPost = newsList[0];

  const remainingPosts = newsList.slice(1);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <main className="min-h-screen bg-white pb-20">

      {/* =====================================================================
          HERO / HEADLINE
          ===================================================================== */}

      <section className="px-4 md:px-16 py-8 md:py-12 bg-gray-50/60 border-b border-gray-100">

        <div className="max-w-5xl mx-auto">

          <Link
            href={`/blog/${heroPost.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center"
          >

            {/* ===============================================================
                HERO IMAGE
                =============================================================== */}

            <div className="lg:col-span-7">

              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-gray-200/80 bg-gray-100">

                <img
                  src={getImage(heroPost)}
                  alt={heroPost.title}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                {/* Label */}

                <div className="absolute top-3 left-3 md:top-4 md:left-4">

                  <span className="inline-flex bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">

                    Headline

                  </span>

                </div>

              </div>

            </div>

            {/* ===============================================================
                HERO TEXT
                =============================================================== */}

            <div className="lg:col-span-5 space-y-4">

              <div className="space-y-2">

                <span className="text-emerald-600 font-bold text-[11px] md:text-xs uppercase tracking-wider block">

                  {heroPost.category || 'Informasi Pesantren'}

                </span>

                <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] leading-tight tracking-tight group-hover:text-emerald-600 transition-colors duration-300">

                  {heroPost.title}

                </h1>

              </div>

              {/* Excerpt */}

              <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed line-clamp-3">

                {getExcerpt(heroPost)}

              </p>

              {/* Author + Time */}

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-400 pt-1">

                <span className="text-gray-600">
                  Redaksi {SITE_NAME}
                </span>

                {heroPost.timeAgo && (
                  <>
                    <span>•</span>

                    <span>
                      {heroPost.timeAgo}
                    </span>
                  </>
                )}

              </div>

              {/* CTA */}

              <div className="pt-1">

                <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 group-hover:gap-2 gap-1 transition-all">

                  Baca selengkapnya

                  <span aria-hidden="true">
                    →
                  </span>

                </span>

              </div>

            </div>

          </Link>

        </div>

      </section>

      {/* =====================================================================
          INFORMASI TERKINI
          ===================================================================== */}

      <section className="px-4 md:px-16 py-10 md:py-12">

        <div className="max-w-5xl mx-auto space-y-8">

          {/* ===============================================================
              SECTION HEADER
              =============================================================== */}

          <div className="border-l-4 border-emerald-500 pl-4 py-0.5">

            <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wider">

              Informasi Terkini

            </h2>

            <p className="text-gray-400 text-xs font-medium mt-1">

              Berita, kegiatan, artikel pendidikan, dan informasi terbaru dari {SITE_NAME}

            </p>

          </div>

          {/* ===============================================================
              GRID
              =============================================================== */}

          {remainingPosts.length > 0 ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">

              {remainingPosts.map((post, index) => (

                <Link
                  key={post.id || post._id || post.slug || index}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
                >

                  {/* =========================================================
                      THUMBNAIL
                      ========================================================= */}

                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 border-b border-gray-100">

                    <img
                      src={getImage(post)}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Category */}

                    <div className="absolute bottom-2.5 left-2.5">

                      <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">

                        {post.category || 'Informasi'}

                      </span>

                    </div>

                  </div>

                  {/* =========================================================
                      ARTICLE INFO
                      ========================================================= */}

                  <div className="flex flex-col flex-1 px-3 py-3 space-y-2">

                    <h3 className="text-sm font-bold text-[#333333] leading-snug tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2">

                      {post.title}

                    </h3>

                    {/* Optional excerpt */}

                    {post.excerpt && (

                      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">

                        {post.excerpt}

                      </p>

                    )}

                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1 mt-auto">

                      <span>

                        {post.timeAgo || 'Terbaru'}

                      </span>

                      <span className="text-emerald-500 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">

                        Baca →

                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center">

              <p className="text-gray-400 text-xs">

                Belum ada artikel lainnya.

              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}