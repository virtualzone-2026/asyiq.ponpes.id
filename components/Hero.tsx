// app/components/Hero.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="
        relative
        w-full
        bg-white

        px-3
        sm:px-4
        md:px-5
        lg:px-6

        pt-4
        md:pt-5

        pb-6
        md:pb-8
      "
    >
      {/* =====================================================
          HERO BOX
          Lebarnya sekarang mengikuti container website
      ===================================================== */}
      <div
        className="
          relative
          isolate

          w-full
          max-w-7xl
          mx-auto

          min-h-[720px]
          md:min-h-[760px]
          lg:min-h-[780px]

          overflow-hidden

          rounded-[24px]
          md:rounded-[32px]

          bg-[#06130e]

          shadow-[0_24px_70px_rgba(0,0,0,0.10)]
        "
      >
        {/* =====================================================
            BACKGROUND IMAGE
        ===================================================== */}
        <div className="absolute inset-0 -z-30">
          <Image
            src="/images/hero-bg.png"
            alt="Pondok Pesantren Aasyiqul Qur'an"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="
              object-cover

              object-[58%_center]
              sm:object-center
              lg:object-[center_46%]

              scale-[1.01]
            "
          />
        </div>

        {/* =====================================================
            OVERLAY UTAMA

            Kiri sedikit gelap untuk teks.
            Kanan dibuat jauh lebih transparan agar foto terlihat.
        ===================================================== */}
        <div
          className="
            absolute
            inset-0
            -z-20

            bg-gradient-to-r

            from-[#02130d]/90
            via-[#03150e]/55
            to-[#03150e]/10
          "
        />

        {/* =====================================================
            OVERLAY BAWAH

            Lebih tipis dari sebelumnya.
        ===================================================== */}
        <div
          className="
            absolute
            inset-0
            -z-20

            bg-gradient-to-b

            from-black/5
            via-transparent
            to-[#02110b]/60
          "
        />

        {/* =====================================================
            SOFT GREEN AMBIENT
        ===================================================== */}
        <div
          className="
            absolute
            -z-10

            left-[-140px]
            top-[180px]

            w-[460px]
            h-[460px]

            rounded-full

            bg-emerald-500/[0.07]

            blur-[130px]

            pointer-events-none
          "
        />

        {/* =====================================================
            VERY SUBTLE GRID
        ===================================================== */}
        <div
          className="
            absolute
            inset-0
            -z-10

            opacity-[0.025]

            bg-[linear-gradient(to_right,rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.4)_1px,transparent_1px)]
            bg-[size:70px_70px]

            pointer-events-none
          "
        />

        {/* =====================================================
            CONTENT WRAPPER
        ===================================================== */}
        <div
          className="
            relative
            z-10

            w-full
            min-h-[720px]
            md:min-h-[760px]
            lg:min-h-[780px]

            flex
            items-center
          "
        >
          <div
            className="
              w-full

              px-5
              sm:px-8
              md:px-10
              lg:px-14
              xl:px-16

              pt-24
              pb-32

              md:pt-24
              md:pb-32
            "
          >
            <div className="max-w-[680px]">
              {/* =================================================
                  BRAND BADGE
              ================================================= */}
              <div
                className="
                  inline-flex
                  items-center
                  gap-2.5

                  mb-7

                  max-w-full

                  px-3
                  py-2

                  rounded-full

                  bg-white/[0.10]

                  backdrop-blur-xl

                  border
                  border-white/[0.14]

                  shadow-[0_10px_35px_rgba(0,0,0,0.12)]
                "
              >
                <div
                  className="
                    relative

                    w-8
                    h-8

                    shrink-0

                    rounded-full

                    bg-white

                    overflow-hidden
                  "
                >
                  <Image
                    src="/images/logo-lazisku.png"
                    alt="Logo Pondok Pesantren Aasyiqul Qur'an"
                    fill
                    sizes="32px"
                    className="object-contain p-1"
                  />
                </div>

                <span
                  className="
                    w-1.5
                    h-1.5

                    shrink-0

                    rounded-full

                    bg-emerald-400

                    shadow-[0_0_8px_rgba(52,211,153,.7)]
                  "
                />

                <span
                  className="
                    truncate

                    text-[9px]
                    sm:text-[10px]
                    md:text-[11px]

                    font-semibold

                    tracking-[0.12em]

                    text-emerald-50

                    uppercase
                  "
                >
                  Pondok Pesantren &apos;Aasyiqul Qur&apos;an
                </span>
              </div>

              {/* =================================================
                  HEADLINE
              ================================================= */}
              <h1
                className="
                  text-[38px]
                  sm:text-[46px]
                  md:text-[54px]
                  lg:text-[60px]

                  leading-[1.02]

                  tracking-[-0.045em]

                  font-bold

                  text-white
                "
              >
                Bersama Membina

                <span className="block mt-1">
                  Generasi{' '}

                  <span
                    className="
                      text-transparent
                      bg-clip-text

                      bg-gradient-to-r
                      from-emerald-300
                      via-emerald-400
                      to-teal-300
                    "
                  >
                    Qur&apos;ani
                  </span>
                </span>
              </h1>

              {/* =================================================
                  SECONDARY HEADLINE
              ================================================= */}
              <p
                className="
                  mt-5

                  max-w-[600px]

                  text-[24px]
                  sm:text-[28px]
                  md:text-[32px]
                  lg:text-[36px]

                  leading-[1.2]

                  tracking-[-0.03em]

                  font-normal

                  text-white/80
                "
              >
                untuk masa depan yang penuh keberkahan.
              </p>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}
              <p
                className="
                  mt-7

                  max-w-[620px]

                  text-[13px]
                  sm:text-sm
                  md:text-[15px]

                  leading-7

                  text-white/72
                "
              >
                Salurkan infak, sedekah, wakaf, dan dukungan
                pendidikan terbaik Anda untuk membantu tumbuhnya
                para santri dan penghafal Al-Qur&apos;an.
                InsyaAllah setiap kebaikan menjadi bagian dari
                amal yang terus mengalir.
              </p>

              {/* =================================================
                  CTA BUTTONS
              ================================================= */}
              <div
                className="
                  mt-8

                  flex
                  flex-col
                  sm:flex-row

                  gap-3
                "
              >
                {/* PRIMARY BUTTON */}
                <Link
                  href="/program"
                  className="
                    group

                    relative

                    inline-flex
                    items-center
                    justify-center

                    gap-2.5

                    min-h-[52px]

                    px-6

                    rounded-xl

                    overflow-hidden

                    bg-emerald-500
                    hover:bg-emerald-400

                    text-[#03291c]

                    text-sm
                    font-bold

                    shadow-[0_14px_35px_rgba(16,185,129,.20)]

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                  "
                >
                  <span
                    className="
                      absolute
                      inset-0

                      bg-gradient-to-r

                      from-transparent
                      via-white/20
                      to-transparent

                      -translate-x-[140%]

                      group-hover:translate-x-[140%]

                      transition-transform
                      duration-1000
                    "
                  />

                  <HeartHandshake
                    className="
                      relative
                      z-10

                      w-[18px]
                      h-[18px]
                    "
                  />

                  <span className="relative z-10">
                    Donasi Sekarang
                  </span>

                  <ArrowRight
                    className="
                      relative
                      z-10

                      w-4
                      h-4

                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />
                </Link>

                {/* SECONDARY BUTTON */}
                <Link
                  href="/program"
                  className="
                    group

                    inline-flex
                    items-center
                    justify-center

                    gap-2.5

                    min-h-[52px]

                    px-6

                    rounded-xl

                    bg-white/[0.09]
                    hover:bg-white/[0.15]

                    backdrop-blur-xl

                    border
                    border-white/[0.14]
                    hover:border-white/25

                    text-white

                    text-sm
                    font-semibold

                    transition-all
                    duration-300
                  "
                >
                  Lihat Program

                  <ArrowRight
                    className="
                      w-4
                      h-4

                      text-white/70

                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>

              {/* =================================================
                  TRUST
              ================================================= */}
              <div
                className="
                  mt-8

                  flex
                  flex-wrap
                  items-center

                  gap-x-5
                  gap-y-3

                  text-[11px]
                  sm:text-xs

                  text-white/60
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className="
                      flex
                      items-center
                      justify-center

                      w-7
                      h-7

                      rounded-lg

                      bg-white/[0.08]

                      border
                      border-white/10
                    "
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  </span>

                  Aman & terpercaya
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="
                      flex
                      items-center
                      justify-center

                      w-7
                      h-7

                      rounded-lg

                      bg-white/[0.08]

                      border
                      border-white/10
                    "
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  </span>

                  Transparan & amanah
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FLOATING CARD
            Hanya desktop besar supaya tidak menutupi gambar
        ===================================================== */}
        <div
          className="
            hidden
            xl:block

            absolute

            right-8
            bottom-20

            z-20

            w-[270px]

            rounded-[22px]

            border
            border-white/[0.14]

            bg-[#06130d]/55

            backdrop-blur-xl

            p-5

            shadow-[0_25px_60px_rgba(0,0,0,.25)]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                items-center
                justify-center

                w-11
                h-11

                shrink-0

                rounded-xl

                bg-emerald-400/15

                border
                border-emerald-300/15
              "
            >
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>

            <div>
              <p
                className="
                  text-[9px]

                  tracking-[0.14em]

                  uppercase

                  text-white/50
                "
              >
                Kebaikan Bersama
              </p>

              <p
                className="
                  mt-1

                  text-sm

                  font-semibold

                  text-white
                "
              >
                Amal yang terus mengalir
              </p>
            </div>
          </div>

          <div className="my-4 h-px bg-white/10" />

          <p
            className="
              text-[11px]

              leading-5

              text-white/60
            "
          >
            Setiap dukungan Anda ikut membantu pendidikan,
            kebutuhan santri, serta pengembangan dakwah
            Al-Qur&apos;an.
          </p>
        </div>

        {/* =====================================================
            BOTTOM SOFT FADE
        ===================================================== */}
        <div
          className="
            absolute
            bottom-0
            left-0

            z-10

            h-24
            w-full

            bg-gradient-to-t

            from-[#03110b]/55
            to-transparent

            pointer-events-none
          "
        />

        {/* =====================================================
            BOTTOM CURVE
        ===================================================== */}
        <div
          className="
            absolute

            bottom-[-1px]
            left-0

            z-20

            w-full

            overflow-hidden

            pointer-events-none
          "
        >
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="
              block

              w-full

              h-[28px]
              md:h-[42px]
            "
          >
            <path
              d="
                M0,48
                C290,80 500,18 760,42
                C1010,64 1230,72 1440,35
                L1440,80
                L0,80
                Z
              "
              fill="white"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}