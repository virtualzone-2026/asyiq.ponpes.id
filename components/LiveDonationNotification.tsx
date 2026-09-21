'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface Donation {
  id: string;
  name: string;
  amount: string;
  program: string;
  timeLabel: string;
}

interface LiveDonationNotificationProps {
  donations: Donation[];
}

export default function LiveDonationNotification({
  donations,
}: LiveDonationNotificationProps) {
  const pathname = usePathname();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // =========================================================
  // PENGATURAN DURASI
  // =========================================================

  // Pertama kali popup muncul
  const INITIAL_DELAY = 8000; // 8 detik

  // Berapa lama popup tampil
  const DISPLAY_DURATION = 5000; // 5 detik

  // Jeda setelah popup hilang sebelum popup berikutnya
  const HIDDEN_DURATION = 15000; // 15 detik

  // =========================================================
  // ROUTE YANG TIDAK BOLEH MENAMPILKAN POPUP
  // =========================================================

  const isStudioRoute =
    pathname === '/studio' ||
    pathname?.startsWith('/studio/');

  const isAdminRoute =
    pathname === '/admin' ||
    pathname?.startsWith('/admin/');

  const isFundraiserRoute =
    pathname === '/fundraiser' ||
    pathname?.startsWith('/fundraiser/');

  const shouldHideNotification =
    isStudioRoute ||
    isAdminRoute ||
    isFundraiserRoute;

  // =========================================================
  // ROTASI NOTIFIKASI
  // =========================================================

  useEffect(() => {
    if (
      shouldHideNotification ||
      !donations ||
      donations.length === 0
    ) {
      setIsVisible(false);
      return;
    }

    // Pastikan index tetap valid
    setCurrentIndex((prev) =>
      prev >= donations.length ? 0 : prev
    );

    let initialTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    let cancelled = false;

    // ---------------------------------------------------------
    // Fungsi menampilkan popup
    // ---------------------------------------------------------

    const showNotification = () => {
      if (cancelled) return;

      setIsVisible(true);

      // Setelah beberapa detik, popup menghilang
      hideTimer = setTimeout(() => {
        if (cancelled) return;

        setIsVisible(false);

        // Tunggu cukup lama sebelum popup berikutnya muncul
        nextTimer = setTimeout(() => {
          if (cancelled) return;

          // Ganti donatur saat popup sedang tidak terlihat
          setCurrentIndex(
            (prevIndex) =>
              (prevIndex + 1) % donations.length
          );

          showNotification();
        }, HIDDEN_DURATION);
      }, DISPLAY_DURATION);
    };

    // Popup pertama jangan langsung muncul
    initialTimer = setTimeout(() => {
      showNotification();
    }, INITIAL_DELAY);

    return () => {
      cancelled = true;

      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [
    donations,
    shouldHideNotification,
  ]);

  // =========================================================
  // JANGAN RENDER PADA ROUTE TERTENTU
  // =========================================================

  if (
    shouldHideNotification ||
    !donations ||
    donations.length === 0
  ) {
    return null;
  }

  const currentDonation =
    donations[currentIndex];

  if (!currentDonation) {
    return null;
  }

  // =========================================================
  // TAMPILAN POPUP
  // =========================================================

  return (
    <div
      className="
        fixed
        top-20
        md:top-24
        left-3
        right-3
        md:left-5
        md:right-auto
        z-[9999]
        pointer-events-none
        md:w-[360px]
        md:max-w-[calc(100vw-40px)]
      "
    >
      <div
        className={`
          w-full

          bg-white/80
          backdrop-blur-xl

          border
          border-white/60

          px-3
          py-3
          md:px-4
          md:py-3.5

          rounded-2xl

          shadow-[0_10px_35px_rgba(15,23,42,0.12)]

          flex
          items-center
          gap-3

          transition-all
          duration-700
          ease-out

          ${
            isVisible
              ? `
                  opacity-95
                  translate-y-0
                  scale-100
                `
              : `
                  opacity-0
                  -translate-y-2
                  scale-[0.98]
                `
          }
        `}
      >
        {/* ===================================================
            INDIKATOR DONASI
        =================================================== */}

        <div
          className="
            relative
            flex
            items-center
            justify-center

            w-9
            h-9
            md:w-10
            md:h-10

            rounded-full

            bg-emerald-50/80
            border
            border-emerald-100/80

            shrink-0
          "
        >
          {/* Tidak memakai animate-ping agar tidak berkedip */}
          <span
            className="
              w-2
              h-2

              bg-emerald-500
              rounded-full

              shadow-[0_0_10px_rgba(16,185,129,0.35)]
            "
          />
        </div>

        {/* ===================================================
            INFORMASI DONASI
        =================================================== */}

        <div className="flex flex-col text-left min-w-0">
          <p
            className="
              text-[11px]
              md:text-[13px]

              text-gray-700

              leading-[1.55]
              md:leading-[1.6]

              font-normal
            "
          >
            Alhamdulillah,{' '}

            <span className="text-gray-900 font-semibold">
              {currentDonation.name}
            </span>{' '}

            baru saja berinfaq/donasi{' '}

            <span className="text-emerald-600 font-bold">
              {currentDonation.amount}
            </span>{' '}

            untuk{' '}

            <span className="text-cyan-600 font-semibold">
              {currentDonation.program}
            </span>{' '}

            di Pondok Pesantren &apos;Aasyiqul Qur&apos;an
          </p>

          <span
            className="
              text-[9px]
              md:text-[10px]

              text-gray-400

              mt-1

              block
              italic
            "
          >
            🕒 {currentDonation.timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}