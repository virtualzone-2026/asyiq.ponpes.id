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

interface CampaignItem {
  id?: string;
  _id?: string;

  slug?: string;

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
// COMPONENT
// ============================================================================

export default function Campaign({
  initialData = [],
}: CampaignProps) {
  const [
    programs,
    setPrograms,
  ] = useState<CampaignItem[]>(
    initialData.length > 0
      ? initialData
      : []
  );

  const [
    loading,
    setLoading,
  ] = useState(
    initialData.length === 0
  );

  const [
    error,
    setError,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('SEMUA');

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  // ==========================================================================
  // FETCH PROGRAM
  // ==========================================================================

  useEffect(() => {
    if (
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

    async function loadPrograms() {
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

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const json =
          await response.json();

        if (
          json?.success &&
          Array.isArray(
            json?.data
          )
        ) {
          setPrograms(
            json.data
          );
        } else {
          setPrograms(
            []
          );
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          'Campaign component fetch error:',
          err
        );

        setPrograms([]);

        setError(
          'Program belum berhasil dimuat.'
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadPrograms();

    return () => {
      controller.abort();
    };
  }, [initialData]);

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
  // FILTER
  // ==========================================================================

  const filteredPrograms =
    useMemo(() => {
      const query =
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
            !query ||
            title.includes(
              query
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
      <div className="text-center py-16 text-gray-500 font-medium text-xs tracking-wider">
        MEMUAT PROGRAM KEBAIKAN...
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

        {/* FILTER */}

        <div className="flex flex-wrap items-center gap-2">

          {availableCategories.map(
            (category) => (

              <button
                key={
                  category
                }
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

        {/* SEARCH */}

        <div className="relative max-w-xs w-full">

          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
            🔍
          </span>

          <input
            type="text"
            placeholder="Cari galang dana..."
            className="w-full bg-white border border-gray-200 text-xs font-bold text-gray-700 pl-9 pr-4 py-2.5 rounded-none placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-xs transition-all"
            value={
              searchQuery
            }
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target
                  .value
              )
            }
          />

        </div>

      </div>

      {/* =====================================================================
          ERROR
          ===================================================================== */}

      {error && (
        <div className="border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================================
          GRID
          ===================================================================== */}

      {filteredPrograms.length ===
      0 ? (

        <div className="text-center py-16 bg-white rounded-none border border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
          Tidak ditemukan program
          galang dana yang cocok.
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {filteredPrograms.map(
            (
              program,
              index
            ) => {
              const slug =
                safeString(
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

              const collected =
                safeString(
                  program.collected,
                  'Rp 0'
                );

              const target =
                safeString(
                  program.target,
                  'Rp 0'
                );

              const key =
                program._id ||
                program.id ||
                slug ||
                `campaign-${index}`;

              // Jika slug kosong,
              // jangan buat link rusak.
              if (!slug) {
                return null;
              }

              return (

                <Link
                  key={key}
                  href={`/campaign/${encodeURIComponent(
                    slug
                  )}`}
                  aria-label={`Buka program ${title}`}
                  className="group block h-full"
                >

                  <article className="h-full bg-white rounded-none p-4 shadow-xs border border-gray-100 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5">

                    <div>

                      {/* =====================================================
                          IMAGE
                          ===================================================== */}

                      <div className="relative h-40 w-full rounded-none overflow-hidden bg-gray-50 border-b border-gray-100">

                        <img
                          src={
                            image
                          }
                          alt={
                            title
                          }
                          loading="lazy"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.04]"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                        />

                        {/* CATEGORY */}

                        <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-wide shadow-sm">
                          {
                            category
                          }
                        </span>

                        {/* HOVER OVERLAY */}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-300 pointer-events-none" />

                      </div>

                      {/* =====================================================
                          TITLE
                          ===================================================== */}

                      <h2 className="font-black text-gray-800 mt-3 text-sm uppercase leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight transition-colors duration-300 group-hover:text-emerald-600">
                        {title}
                      </h2>

                      {/* =====================================================
                          FUND STATUS
                          ===================================================== */}

                      <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-4 border-t border-gray-50 pt-3">

                        {/* COLLECTED */}

                        <div>

                          <p className="uppercase tracking-wider">
                            Terkumpul
                          </p>

                          <p className="font-black text-emerald-600 text-xs mt-0.5">
                            {
                              collected
                            }
                          </p>

                        </div>

                        {/* TARGET */}

                        <div className="text-right">

                          <p className="uppercase tracking-wider">
                            Target
                          </p>

                          <p className="font-black text-gray-700 text-xs mt-0.5">
                            {
                              target
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =======================================================
                        CTA
                        ======================================================= */}

                    <div className="mt-4 pt-3 border-t border-gray-50">

                      {/*
                        PENTING:
                        Ini BUKAN <Link> lagi karena seluruh
                        card sudah menjadi Link.
                      */}

                      <div className="w-full text-center bg-emerald-600 group-hover:bg-emerald-700 text-white font-black py-2.5 rounded-none transition text-[10px] uppercase tracking-widest shadow-xs">
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