'use client';

import React, { useEffect, useState } from 'react';

// ============================================================
// TYPES
// ============================================================

interface Statistics {
  totalCollected: number;
  totalDonors: number;
  totalPrograms: number;
}

interface Program {
  collectedRaw?: number | string;
  collected?: number | string;
  totalCollected?: number | string;

  donors?: unknown[];

  donorsCount?: number | string;
  donorCount?: number | string;

  status?: string;
}

// ============================================================
// INITIAL STATE
// ============================================================

const INITIAL_STATS: Statistics = {
  totalCollected: 0,
  totalDonors: 0,
  totalPrograms: 0,
};

// ============================================================
// HELPERS
// ============================================================

function safeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

// ============================================================
// COMPONENT
// ============================================================

export default function TotalAccumulationWidget() {
  const [stats, setStats] = useState<Statistics>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ==========================================================
  // FETCH PROGRAM
  // ==========================================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/programs?v=${Date.now()}`,
          {
            method: 'GET',
            cache: 'no-store',

            headers: {
              'Cache-Control':
                'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },

            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data program. HTTP ${response.status}`
          );
        }

        const json = await response.json();

        if (
          !json?.success ||
          !Array.isArray(json?.data)
        ) {
          throw new Error(
            json?.error ||
              json?.message ||
              'Format data program tidak sesuai.'
          );
        }

        const programs: Program[] = json.data;

        // ======================================================
        // HITUNG TOTAL
        // ======================================================

        const calculated = programs.reduce<{
          totalCollected: number;
          totalDonors: number;
        }>(
          (acc, program) => {
            // --------------------------------------------------
            // TOTAL DANA
            //
            // Prioritas:
            // collectedRaw
            // collected
            // totalCollected
            // --------------------------------------------------

            const collected =
              safeNumber(program.collectedRaw) ||
              safeNumber(program.collected) ||
              safeNumber(program.totalCollected);

            // --------------------------------------------------
            // TOTAL DONATUR
            //
            // Prioritas:
            // donorsCount
            // donorCount
            // donors.length
            // --------------------------------------------------

            let donorCount = 0;

            if (
              program.donorsCount !== undefined &&
              program.donorsCount !== null
            ) {
              donorCount = safeNumber(
                program.donorsCount
              );
            } else if (
              program.donorCount !== undefined &&
              program.donorCount !== null
            ) {
              donorCount = safeNumber(
                program.donorCount
              );
            } else if (
              Array.isArray(program.donors)
            ) {
              donorCount =
                program.donors.length;
            }

            return {
              totalCollected:
                acc.totalCollected +
                collected,

              totalDonors:
                acc.totalDonors +
                donorCount,
            };
          },
          {
            totalCollected: 0,
            totalDonors: 0,
          }
        );

        // ======================================================
        // TOTAL PROGRAM
        // ======================================================

        const totalPrograms =
          programs.length;

        setStats({
          totalCollected:
            calculated.totalCollected,

          totalDonors:
            calculated.totalDonors,

          totalPrograms,
        });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          '🔥 Fetch accumulation statistics error:',
          err
        );

        setError(true);

        setStats(
          INITIAL_STATS
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    fetchStatistics();

    return () => {
      controller.abort();
    };
  }, []);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-100 bg-white divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="min-h-[150px] p-6 md:p-8 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-32 h-3 bg-gray-100 animate-pulse rounded-full" />

              <div className="w-44 h-8 bg-gray-100 animate-pulse rounded-full" />

              <div className="w-28 h-2.5 bg-gray-100 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 overflow-hidden border border-gray-100 bg-white shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* ====================================================
            TOTAL DANA
        ==================================================== */}

        <div className="relative p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[155px] transition-colors duration-300 hover:bg-emerald-50/30">

          <div className="flex items-center gap-2 mb-3">

            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-base">
              💰
            </div>

            <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">
              Total Dana Terkumpul
            </span>

          </div>

          {stats.totalCollected > 0 ? (
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600 tracking-tight leading-tight">

              <span className="text-base md:text-xl mr-1">
                Rp
              </span>

              {formatRupiah(
                stats.totalCollected
              )}

            </div>
          ) : (
            <div className="text-sm md:text-base font-black text-emerald-600 uppercase tracking-wider py-1">
              Siap Menerima Kebaikan
            </div>
          )}

          <div className="mt-3 text-[10px] text-gray-400 font-semibold tracking-wide">
            Akumulasi seluruh program donasi
          </div>

        </div>

        {/* ====================================================
            TOTAL DONATUR
        ==================================================== */}

        <div className="relative p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[155px] transition-colors duration-300 hover:bg-emerald-50/30">

          <div className="flex items-center gap-2 mb-3">

            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-base">
              🤝
            </div>

            <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">
              Jumlah Donatur
            </span>

          </div>

          {stats.totalDonors > 0 ? (
            <div className="flex items-baseline justify-center gap-2">

              <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                {formatNumber(
                  stats.totalDonors
                )}
              </span>

              <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">
                Donatur
              </span>

            </div>
          ) : (
            <div className="text-sm md:text-base font-black text-emerald-600 uppercase tracking-wider py-1">
              Mari Mulai Kebaikan
            </div>
          )}

          <div className="mt-3 text-[10px] text-gray-400 font-semibold tracking-wide">

            {stats.totalDonors > 0
              ? 'Terima kasih atas setiap amanah kebaikan'
              : 'Jadilah bagian dari kebaikan hari ini'}

          </div>

        </div>

        {/* ====================================================
            TOTAL PROGRAM
        ==================================================== */}

        <div className="relative p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[155px] transition-colors duration-300 hover:bg-emerald-50/30">

          <div className="flex items-center gap-2 mb-3">

            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-base">
              📦
            </div>

            <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">
              Program Kebaikan Aktif
            </span>

          </div>

          <div className="flex items-baseline justify-center gap-2">

            <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
              {formatNumber(
                stats.totalPrograms
              )}
            </span>

            <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">
              Program
            </span>

          </div>

          <div className="mt-3 text-[10px] text-gray-400 font-semibold tracking-wide">
            Pendidikan, Dakwah & Sosial
          </div>

        </div>

      </div>

      {/* ======================================================
          ERROR INFO
      ====================================================== */}

      {error && (
        <div className="mt-2 text-center text-[10px] text-gray-400">
          Statistik sementara belum dapat diperbarui.
        </div>
      )}

    </section>
  );
}