'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';

import RelatedNews from '@/components/RelatedNews';
import ViewCounter from '@/components/ViewCounter';

// ============================================================================
// CONFIG
// ============================================================================

const SITE_NAME = 'Asyiqul Quran';
const SITE_URL = 'https://www.asyiq.ponpes.id';

const FALLBACK_IMAGE = '/images/placeholder.jpg';

// ============================================================================
// TYPES
// ============================================================================

interface BlogDetailClientProps {
  slug: string;
}

interface Article {
  id?: string;
  _id?: string;

  slug?:
    | string
    | {
        current?: string;
      };

  title?: string;

  category?:
    | string
    | {
        current?: string;
      };

  publishedAt?: string;

  imageUrl?: string;
  image?: string;

  alt?: string;
  caption?: string;

  content?: any;
}

interface Campaign {
  id?: string;
  _id?: string;

  slug?:
    | string
    | {
        current?: string;
      };

  title?: string;

  collectedRaw?: number;

  targetAmount?: number;
}

interface BlogData {
  article: Article;

  sidebarCampaigns?: Campaign[];

  allNews?: any[];
}

// ============================================================================
// HELPERS
// ============================================================================

function renderSafeString(
  value: unknown,
  fallback = ''
): string {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'current' in value
  ) {
    const current = (
      value as {
        current?: unknown;
      }
    ).current;

    if (typeof current === 'string') {
      return current.trim() || fallback;
    }
  }

  return fallback;
}

// ============================================================================
// IMAGE
// ============================================================================

function getSafeImageUrl(
  article?: Article
): string {
  const candidates = [
    article?.imageUrl,
    article?.image,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return FALLBACK_IMAGE;
}

// ============================================================================
// DATE
// ============================================================================

function formatPublishedDate(
  publishedAt?: string
): string {
  if (!publishedAt) {
    return 'Kabar Terbaru';
  }

  const date =
    new Date(publishedAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'Kabar Terbaru';
  }

  return (
    new Intl.DateTimeFormat(
      'id-ID',
      {
        day: 'numeric',

        month: 'long',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit',

        timeZone:
          'Asia/Jakarta',

        hour12: false,
      }
    ).format(date) +
    ' WIB'
  );
}

// ============================================================================
// CAMPAIGN PERCENTAGE
// ============================================================================

function calculatePercentage(
  collectedValue: unknown,
  targetValue: unknown
): number {
  const collected =
    Number(collectedValue) || 0;

  const target =
    Number(targetValue) ||
    50_000_000;

  if (target <= 0) {
    return 0;
  }

  const percentage =
    Math.round(
      (collected / target) *
        100
    );

  if (
    !Number.isFinite(
      percentage
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      percentage,
      100
    )
  );
}

// ============================================================================
// PORTABLE TEXT
// ============================================================================

const portableTextComponents = {
  types: {
    image: ({
      value,
    }: any) => {
      const imageUrl =
        typeof value?.asset
          ?.url === 'string'
          ? value.asset.url
          : '';

      if (!imageUrl) {
        return null;
      }

      const altText =
        typeof value?.alt ===
          'string' &&
        value.alt.trim()
          ? value.alt.trim()
          : `Dokumentasi ${SITE_NAME}`;

      const caption =
        typeof value?.caption ===
          'string' &&
        value.caption.trim()
          ? value.caption.trim()
          : '';

      return (
        <figure className="my-7 space-y-2 w-full">

          <div className="overflow-hidden bg-gray-50 border border-gray-100 shadow-sm aspect-[16/9] md:aspect-[21/9]">

            <img
              src={imageUrl}
              alt={altText}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  FALLBACK_IMAGE;
              }}
            />

          </div>

          {caption && (
            <figcaption className="text-[11px] text-gray-400 font-medium text-center italic leading-relaxed">
              {caption}
            </figcaption>
          )}

        </figure>
      );
    },
  },

  marks: {
    link: ({
      children,
      value,
    }: any) => {
      const href =
        typeof value?.href ===
          'string' &&
        value.href.trim()
          ? value.href.trim()
          : '#';

      const isInternal =
        href.startsWith('/') ||
        href.startsWith('#');

      return (
        <a
          href={href}
          target={
            isInternal
              ? undefined
              : '_blank'
          }
          rel={
            isInternal
              ? undefined
              : 'noopener noreferrer'
          }
          className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
};

// ============================================================================
// PAGE
// ============================================================================

export default function BlogDetailClient({
  slug,
}: BlogDetailClientProps) {
  const [
    data,
    setData,
  ] =
    useState<BlogData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  // ==========================================================================
  // FETCH ARTICLE
  // ==========================================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function fetchArticle() {
      try {
        setLoading(true);

        setError('');

        const response =
          await fetch(
            `/api/news/${encodeURIComponent(
              slug
            )}`,
            {
              method: 'GET',

              headers: {
                Accept:
                  'application/json',
              },

              cache:
                'no-store',

              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const json =
          await response.json();

        if (
          json?.success &&
          json?.data?.article
        ) {
          setData(
            json.data
          );

          return;
        }

        setData(null);

        setError(
          'Artikel tidak ditemukan.'
        );
      } catch (err) {
        if (
          err instanceof Error &&
          err.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          `[${SITE_NAME}] Fetch blog detail error:`,
          err
        );

        setError(
          'Terjadi gangguan saat memuat artikel.'
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    fetchArticle();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // ==========================================================================
  // COPY LINK
  // ==========================================================================

  async function handleCopyLink() {
    const articleUrl =
      typeof window !==
      'undefined'
        ? window.location.href
        : `${SITE_URL}/blog/${slug}`;

    try {
      if (
        navigator?.clipboard
          ?.writeText
      ) {
        await navigator.clipboard.writeText(
          articleUrl
        );
      } else {
        const textarea =
          document.createElement(
            'textarea'
          );

        textarea.value =
          articleUrl;

        textarea.style.position =
          'fixed';

        textarea.style.opacity =
          '0';

        document.body.appendChild(
          textarea
        );

        textarea.select();

        document.execCommand(
          'copy'
        );

        document.body.removeChild(
          textarea
        );
      }

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        2000
      );
    } catch (err) {
      console.error(
        `[${SITE_NAME}] Gagal menyalin link:`,
        err
      );

      setCopied(false);
    }
  }

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">

        <div className="text-center space-y-3">

          <div className="w-7 h-7 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />

          <p className="text-gray-400 font-medium text-sm">
            Memuat artikel...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (
    error ||
    !data ||
    !data.article
  ) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">

        <div className="text-center space-y-3">

          <p className="text-gray-800 font-bold text-sm">
            Artikel tidak tersedia
          </p>

          <p className="text-gray-400 text-xs">
            {error ||
              'Artikel yang Anda cari tidak ditemukan.'}
          </p>

          <Link
            href="/blog"
            className="inline-flex bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 transition"
          >
            Kembali ke Berita
          </Link>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // DATA
  // ==========================================================================

  const {
    article,
    sidebarCampaigns = [],
    allNews = [],
  } = data;

  const titleString =
    renderSafeString(
      article.title,
      'Detail Berita'
    );

  const categoryString =
    renderSafeString(
      article.category,
      'Kabar Terbaru'
    );

  const formattedDate =
    formatPublishedDate(
      article.publishedAt
    );

  const mainImage =
    getSafeImageUrl(
      article
    );

  const mainImageAlt =
    renderSafeString(
      article.alt,
      titleString
    );

  const caption =
    renderSafeString(
      article.caption,
      `Dokumentasi ${SITE_NAME}`
    );

  // ==========================================================================
  // CANONICAL ARTICLE URL
  // ==========================================================================

  const articleUrl =
    `${SITE_URL}/blog/${encodeURIComponent(
      slug
    )}`;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <main className="min-h-screen bg-white py-8 md:py-10 px-4 md:px-16">

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ===================================================================
            MAIN ARTICLE
            =================================================================== */}

        <article className="lg:col-span-2 space-y-6 flex flex-col text-left">

          {/* =================================================================
              BREADCRUMB
              ================================================================= */}

          <nav
            aria-label="Breadcrumb"
            className="w-full flex items-center flex-wrap gap-2 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider"
          >

            <Link
              href="/"
              className="hover:text-emerald-600 transition-colors shrink-0"
            >
              Beranda
            </Link>

            <span className="text-gray-300">
              /
            </span>

            <Link
              href="/blog"
              className="hover:text-emerald-600 transition-colors shrink-0"
            >
              Berita
            </Link>

            <span className="text-gray-300">
              /
            </span>

            <span className="text-gray-600 truncate max-w-[180px] sm:max-w-[300px] md:max-w-[400px] normal-case">
              {titleString}
            </span>

          </nav>

          {/* =================================================================
              HEADLINE
              ================================================================= */}

          <header className="space-y-4">

            <h1 className="text-2xl md:text-4xl font-extrabold text-[#333333] leading-tight tracking-tight">
              {titleString}
            </h1>

            {/* ===============================================================
                META + VIEW COUNTER
                =============================================================== */}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 border-b border-gray-100 pb-4 font-semibold">

              <span className="text-gray-600">
                Oleh:{' '}

                <strong className="text-emerald-600 font-black">
                  Admin {SITE_NAME}
                </strong>
              </span>

              <span className="hidden sm:inline text-gray-300">
                •
              </span>

              <span className="bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                {categoryString}
              </span>

              <span className="text-gray-300">
                •
              </span>

              <time
                dateTime={
                  article.publishedAt ||
                  undefined
                }
              >
                {formattedDate}
              </time>

              {/* ===========================================================
                  BLOG VIEW COUNTER
                  =========================================================== */}

              <span className="text-gray-300">
                •
              </span>

              <div className="inline-flex items-center gap-1.5 text-gray-500">

                <ViewCounter
                  type="blog"
                  contentKey={slug}
                  increment={true}
                  className="font-bold text-gray-500"
                />

                <span className="text-[10px] md:text-xs">
                  dibaca
                </span>

              </div>

            </div>

          </header>

          {/* =================================================================
              MAIN IMAGE
              ================================================================= */}

          <figure className="space-y-2 w-full">

            <div className="overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">

              <img
                src={
                  mainImage
                }
                alt={
                  mainImageAlt
                }
                loading="eager"
                className="w-full h-full object-cover"
                onError={(
                  event
                ) => {
                  event.currentTarget.src =
                    FALLBACK_IMAGE;
                }}
              />

            </div>

            <figcaption className="text-[11px] text-gray-400 font-medium text-center leading-relaxed max-w-2xl mx-auto">
              Foto: {caption}
            </figcaption>

          </figure>

          {/* =================================================================
              ARTICLE CONTENT
              ================================================================= */}

          <div className="text-gray-700 text-base leading-relaxed font-normal tracking-wide py-4 border-b border-gray-100 prose prose-emerald max-w-none w-full dynamic-portable-text">

            {article.content ? (

              <PortableText
                value={
                  article.content
                }
                components={
                  portableTextComponents
                }
              />

            ) : (

              <p className="text-gray-400 italic">
                Isi berita belum tersedia.
              </p>

            )}

          </div>

          {/* =================================================================
              RELATED NEWS
              ================================================================= */}

          <RelatedNews
            currentSlug={
              slug
            }
            category={
              categoryString
            }
            allNews={
              Array.isArray(
                allNews
              )
                ? allNews
                : []
            }
          />

          {/* =================================================================
              SHARE
              ================================================================= */}

          <div className="flex flex-wrap items-center gap-3 pt-3">

            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
              Bagikan:
            </span>

            {/* COPY */}

            <button
              type="button"
              onClick={
                handleCopyLink
              }
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600'
              }`}
            >
              {copied
                ? '✓ Tautan Disalin'
                : '🔗 Salin Tautan'}
            </button>

            {/* WHATSAPP */}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${titleString}\n\n${articleUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold transition-colors"
            >
              WhatsApp
            </a>

          </div>

        </article>

        {/* ===================================================================
            SIDEBAR
            =================================================================== */}

        <aside className="space-y-8 lg:sticky lg:top-24 h-fit text-left">

          {/* =================================================================
              CAMPAIGN RECOMMENDATION
              ================================================================= */}

          <div className="bg-gray-50 p-5 border border-gray-100 shadow-sm space-y-4">

            <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">

              <span aria-hidden="true">
                🌟
              </span>

              Program Kebaikan

            </h2>

            <div className="space-y-3.5">

              {sidebarCampaigns.length >
              0 ? (

                sidebarCampaigns.map(
                  (
                    program,
                    index
                  ) => {
                    const percentage =
                      calculatePercentage(
                        program.collectedRaw,
                        program.targetAmount
                      );

                    const programSlug =
                      renderSafeString(
                        program.slug,
                        ''
                      );

                    const programTitle =
                      renderSafeString(
                        program.title,
                        'Program Kebaikan'
                      );

                    if (
                      !programSlug
                    ) {
                      return null;
                    }

                    const key =
                      program._id ||
                      program.id ||
                      programSlug ||
                      `campaign-${index}`;

                    return (
                      <Link
                        href={`/campaign/${programSlug}`}
                        key={
                          key
                        }
                        className="group block bg-white p-3.5 border border-gray-200/60 shadow-inner shadow-gray-50 hover:border-emerald-500 transition-all duration-300"
                      >

                        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {
                            programTitle
                          }
                        </h3>

                        <div className="w-full bg-gray-100 h-1.5 mt-3 overflow-hidden">

                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between gap-2 text-[10px] text-gray-400 font-bold mt-1.5">

                          <span>
                            TERCAPAI{' '}
                            {
                              percentage
                            }
                            %
                          </span>

                          <span className="text-emerald-600">
                            DONASI →
                          </span>

                        </div>

                      </Link>
                    );
                  }
                )

              ) : (

                <p className="text-xs text-gray-400 py-3">
                  Belum ada program yang direkomendasikan.
                </p>

              )}

            </div>

          </div>

          {/* =================================================================
              POPULAR TOPICS
              ================================================================= */}

          <div className="space-y-3 px-1">

            <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Topik Populer
            </h2>

            <div className="flex flex-wrap gap-2">

              {[
                'Sedekah',
                'Wakaf',
                'Yatim',
                'Al-Quran',
                'Pendidikan',
                'Pesantren',
                'Kemanusiaan',
              ].map(
                (
                  tag
                ) => (

                  <span
                    key={
                      tag
                    }
                    className="bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold px-3 py-1.5 shadow-sm hover:text-emerald-600 hover:border-emerald-200 cursor-default transition"
                  >
                    #
                    {
                      tag
                    }
                  </span>

                )
              )}

            </div>

          </div>

          {/* =================================================================
              BRAND
              ================================================================= */}

          <div className="border-t border-gray-100 pt-5 px-1">

            <p className="text-[10px] text-gray-400 leading-relaxed">

              Berita dan informasi resmi dari{' '}

              <strong className="text-gray-600">
                {SITE_NAME}
              </strong>.

            </p>

            <a
              href={
                SITE_URL
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              www.asyiq.ponpes.id
            </a>

          </div>

        </aside>

      </div>

    </main>
  );
}