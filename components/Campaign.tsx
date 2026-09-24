'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface SanitySlug {
  current?: string;
}

interface CampaignItem {
  id?: string;
  _id?: string;

  slug?: string | SanitySlug;

  title?: string;

  category?: string;

  image?: string;

  collected?: string;

  collectedRaw?: number;

  target?: string;

  targetAmount?: number;
}

interface CampaignProps {
  initialData?: CampaignItem[];
}

// ============================================================================
// CONFIG
// ============================================================================

const FALLBACK_IMAGE =
  '/images/placeholder.jpg';

// ============================================================================
// HELPERS
// ============================================================================

function safeString(
  value: unknown,
  fallback = ''
): string {
  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

// ============================================================================
// SLUG HELPER
// ============================================================================

function getSlug(
  value: CampaignItem['slug']
): string {
  if (
    typeof value === 'string'
  ) {
    return value.trim();
  }

  if (
    value &&
    typeof value === 'object' &&
    typeof value.current ===
      'string'
  ) {
    return value.current.trim();
  }

  return '';
}

// ============================================================================
// FORMAT RUPIAH
// ============================================================================

function rupiah(
  value: unknown
): string {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(number);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Campaign({
  initialData,
}: CampaignProps) {
  // ==========================================================================
  // INITIAL DATA
  // ==========================================================================

  const initialPrograms =
    Array.isArray(initialData)
      ? initialData
      : [];

  const [
    programs,
    setPrograms,
  ] =
    useState<CampaignItem[]>(
      initialPrograms
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      initialPrograms.length === 0
    );

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState('SEMUA');

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('');

  // ==========================================================================
  // FETCH PROGRAM
  // ==========================================================================
  //
  // PENTING:
  //
  // useEffect sengaja hanya dijalankan sekali saat mount.
  //
  // Jangan menggunakan:
  //
  // }, [initialData]);
  //
  // karena initialData kosong bisa menyebabkan effect berjalan berulang.
  //
  // ==========================================================================

  useEffect(() => {
    // Jika data dari server sudah tersedia,
    // tidak perlu fetch lagi.

    if (
      Array.isArray(initialData) &&
      initialData.length > 0
    ) {
      setPrograms(
        initialData
      );

      setLoading(false);

      return;
    }

    const controller =
      new AbortController();

    async function fetchPrograms() {
      try {
        setLoading(true);

        setError('');

        const response =
          await fetch(
            '/api/programs',
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

        // ================================================================
        // RESPONSE ERROR
        // ================================================================

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        // ================================================================
        // JSON
        // ================================================================

        const json =
          await response.json();

        // ================================================================
        // VALIDASI RESPONSE
        // ================================================================

        if (
          !json?.success
        ) {
          throw new Error(
            json?.message ||
              json?.error ||
              'API program mengembalikan status gagal.'
          );
        }

        if (
          !Array.isArray(
            json?.data
          )
        ) {
          throw new Error(
            'Data program dari API bukan array.'
          );
        }

        setPrograms(
          json.data
        );
      } catch (err) {
        // Abort bukan error sebenarnya.

        if (
          err instanceof Error &&
          err.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          '[Campaign] Fetch programs error:',
          err
        );

        setPrograms([]);

        setError(
          'Program belum berhasil dimuat. Silakan muat ulang halaman.'
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

    fetchPrograms();

    return () => {
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================
  // CATEGORY
  // ==========================================================================

  const availableCategories =
    useMemo(() => {
      const categories =
        new Set<string>();

      programs.forEach(
        (program) => {
          const category =
            safeString(
              program.category
            );

          if (category) {
            categories.add(
              category.toUpperCase()
            );
          }
        }
      );

      return [
        'SEMUA',
        ...Array.from(
          categories
        ),
      ];
    }, [programs]);

  // ==========================================================================
  // FILTER PROGRAM
  // ==========================================================================

  const filteredPrograms =
    useMemo(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      return programs.filter(
        (program) => {
          const category =
            safeString(
              program.category
            ).toUpperCase();

          const title =
            safeString(
              program.title
            ).toLowerCase();

          const matchesCategory =
            selectedCategory ===
              'SEMUA' ||
            category ===
              selectedCategory;

          const matchesSearch =
            !search ||
            title.includes(
              search
            );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      programs,
      selectedCategory,
      searchQuery,
    ]);

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <div className="py-16 md:py-20 flex items-center justify-center">

        <div className="text-center space-y-3">

          <div className="w-7 h-7 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />

          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
            Memuat Program Kebaikan...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">

      {/* =====================================================================
          FILTER + SEARCH
          ===================================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full border-b border-gray-100 pb-4">

        {/* ===================================================================
            CATEGORY FILTER
            =================================================================== */}

        <div className="flex flex-wrap items-center gap-2">

          {availableCategories.map(
            (category) => (

              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
                className={`px-4 py-2.5 rounded-none text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory ===
                  category
                    ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                    : 'bg-white text-gray-400 hover:text-emerald-600 border-gray-200 hover:border-emerald-200'
                }`}
              >
                {category ===
                'SEMUA'
                  ? 'Semua'
                  : category}
              </button>

            )
          )}

        </div>

        {/* ===================================================================
            SEARCH
            =================================================================== */}

        <div className="relative max-w-xs w-full">

          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
            🔍
          </span>

          <input
            type="search"
            placeholder="Cari galang dana..."
            value={
              searchQuery
            }
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target.value
              )
            }
            className="w-full bg-white border border-gray-200 text-xs font-bold text-gray-700 pl-9 pr-4 py-2.5 rounded-none placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-all"
          />

        </div>

      </div>

      {/* =====================================================================
          ERROR
          ===================================================================== */}

      {error && (
        <div className="border border-red-100 bg-red-50 p-4">

          <p className="text-xs font-bold text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================================
          EMPTY
          ===================================================================== */}

      {!error &&
      filteredPrograms.length ===
        0 && (

        <div className="text-center py-16 bg-white border border-gray-100">

          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Tidak ditemukan program
            galang dana yang cocok.
          </p>

        </div>

      )}

      {/* =====================================================================
          GRID CAMPAIGN
          ===================================================================== */}

      {filteredPrograms.length >
        0 && (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">

          {filteredPrograms.map(
            (
              program,
              index
            ) => {
              // ==============================================================
              // PROGRAM DATA
              // ==============================================================

              const slug =
                getSlug(
                  program.slug
                );

              const title =
                safeString(
                  program.title,
                  'Program Kebaikan'
                );

              const category =
                safeString(
                  program.category,
                  'Kebaikan'
                );

              const image =
                safeString(
                  program.image,
                  FALLBACK_IMAGE
                );

              // ==============================================================
              // COLLECTED
              // ==============================================================

              const collected =
                safeString(
                  program.collected
                ) ||
                rupiah(
                  program.collectedRaw
                );

              // ==============================================================
              // TARGET
              // ==============================================================

              const target =
                safeString(
                  program.target
                ) ||
                rupiah(
                  program.targetAmount
                );

              // ==============================================================
              // KEY
              // ==============================================================

              const key =
                program._id ||
                program.id ||
                slug ||
                `program-${index}`;

              // ==============================================================
              // INVALID SLUG
              // ==============================================================

              if (!slug) {
                console.warn(
                  '[Campaign] Program tanpa slug:',
                  title
                );

                return null;
              }

              // ==============================================================
              // CARD
              // ==============================================================

              return (

                <Link
                  key={key}
                  href={`/campaign/${encodeURIComponent(
                    slug
                  )}`}
                  aria-label={`Buka program ${title}`}
                  className="group block h-full"
                >

                  <article className="h-full bg-white border border-gray-100 p-4 flex flex-col justify-between shadow-xs cursor-pointer transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1">

                    <div>

                      {/* =====================================================
                          IMAGE
                          ===================================================== */}

                      <div className="relative h-40 md:h-44 w-full overflow-hidden bg-gray-100 border-b border-gray-100">

                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                        />

                        {/* CATEGORY */}

                        <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-[9px] font-black px-2.5 py-1 uppercase tracking-wide shadow-sm">
                          {category}
                        </span>

                        {/* HOVER */}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-300 pointer-events-none" />

                      </div>

                      {/* =====================================================
                          TITLE
                          ===================================================== */}

                      <h2 className="font-black text-gray-800 mt-3 text-sm uppercase leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-emerald-600 transition-colors">
                        {title}
                      </h2>

                      {/* =====================================================
                          FUND INFO
                          ===================================================== */}

                      <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-bold mt-4 border-t border-gray-100 pt-3">

                        {/* COLLECTED */}

                        <div>

                          <p className="uppercase tracking-wider">
                            Terkumpul
                          </p>

                          <p className="font-black text-emerald-600 text-xs mt-1">
                            {collected}
                          </p>

                        </div>

                        {/* TARGET */}

                        <div className="text-right">

                          <p className="uppercase tracking-wider">
                            Target
                          </p>

                          <p className="font-black text-gray-700 text-xs mt-1">
                            {target}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =======================================================
                        BUTTON LOOK
                        ======================================================= */}

                    <div className="mt-4 pt-3 border-t border-gray-100">

                      {/*
                        Seluruh card sudah menjadi Link.

                        Jadi bagian ini cukup DIV,
                        jangan membuat Link di dalam Link.
                      */}

                      <div className="w-full text-center bg-emerald-600 group-hover:bg-emerald-700 text-white font-black py-2.5 transition-colors text-[10px] uppercase tracking-widest shadow-xs">
                        Infak Sekarang ➔
                      </div>

                    </div>

                  </article>

                </Link>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}