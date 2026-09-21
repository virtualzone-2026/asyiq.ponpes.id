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
        isolate
        w-full
        min-h-[92vh]
        overflow-hidden
        bg-[#07110d]
        flex
        items-center
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
          sizes="100vw"
          className="
            object-cover
            object-center
            scale-[1.02]
          "
        />
      </div>

      {/* =====================================================
          OVERLAY UTAMA
          Dibuat gelap lembut agar foto tetap terlihat
      ===================================================== */}
      <div
        className="
          absolute
          inset-0
          -z-20
          bg-gradient-to-r
          from-[#06110d]/95
          via-[#07130f]/80
          to-[#07130f]/45
        "
      />

      {/* Overlay bawah */}
      <div
        className="
          absolute
          inset-0
          -z-20
          bg-gradient-to-b
          from-black/20
          via-transparent
          to-[#06100c]/95
        "
      />

      {/* =====================================================
          SOFT AMBIENT GLOW
      ===================================================== */}
      <div
        className="
          absolute
          -z-10
          top-[18%]
          left-[8%]
          w-[320px]
          h-[320px]
          md:w-[520px]
          md:h-[520px]
          rounded-full
          bg-emerald-500/10
          blur-[100px]
          md:blur-[150px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -z-10
          bottom-[10%]
          right-[5%]
          w-[260px]
          h-[260px]
          md:w-[420px]
          md:h-[420px]
          rounded-full
          bg-cyan-400/5
          blur-[110px]
          pointer-events-none
        "
      />

      {/* =====================================================
          GRID SANGAT HALUS
      ===================================================== */}
      <div
        className="
          absolute
          inset-0
          -z-10
          opacity-[0.08]
          bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)]
          bg-[size:64px_64px]
          [mask-image:linear-gradient(to_bottom,black,transparent_85%)]
        "
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-7xl
          mx-auto
          px-5
          sm:px-7
          md:px-10
          lg:px-12

          pt-28
          pb-36
          md:pt-32
          md:pb-40
        "
      >
        <div
          className="
            max-w-[760px]
          "
        >
          {/* =================================================
              BRAND BADGE
          ================================================= */}
          <div
            className="
              inline-flex
              items-center
              gap-3

              mb-7

              px-3.5
              py-2

              rounded-full

              bg-white/[0.07]
              backdrop-blur-xl

              border
              border-white/10

              shadow-[0_10px_35px_rgba(0,0,0,0.18)]
            "
          >
            <div
              className="
                relative
                w-8
                h-8

                rounded-full
                overflow-hidden

                bg-white
                p-1
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

            <div className="flex items-center gap-2">
              <span
                className="
                  flex
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_10px_rgba(52,211,153,0.8)]
                "
              />

              <span
                className="
                  text-[10px]
                  sm:text-[11px]
                  font-semibold
                  tracking-[0.12em]
                  text-emerald-100
                  uppercase
                "
              >
                Pondok Pesantren &apos;Aasyiqul Qur&apos;an
              </span>
            </div>
          </div>

          {/* =================================================
              HEADLINE
          ================================================= */}
          <h1
            className="
              max-w-4xl

              text-[40px]
              leading-[1.05]

              sm:text-5xl
              md:text-6xl
              lg:text-[68px]

              font-bold
              tracking-[-0.045em]

              text-white
            "
          >
            Bersama Membina
            <span className="block text-white">
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

            <span
              className="
                block
                mt-2

                text-[27px]
                sm:text-[34px]
                md:text-[42px]
                lg:text-[46px]

                leading-tight

                font-medium

                tracking-[-0.035em]

                text-white/75
              "
            >
              untuk masa depan yang penuh keberkahan.
            </span>
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}
          <p
            className="
              mt-7

              max-w-2xl

              text-sm
              sm:text-[15px]
              md:text-[17px]

              leading-7
              md:leading-8

              text-white/70

              font-normal
            "
          >
            Salurkan infak, sedekah, wakaf, dan dukungan pendidikan
            terbaik Anda untuk membantu tumbuhnya para santri dan
            penghafal Al-Qur&apos;an. InsyaAllah setiap kebaikan menjadi
            bagian dari amal yang terus mengalir.
          </p>

          {/* =================================================
              CTA BUTTONS
          ================================================= */}
          <div
            className="
              mt-9

              flex
              flex-col
              sm:flex-row

              sm:items-center

              gap-3
            "
          >
            {/* PRIMARY */}
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
                md:px-7

                rounded-xl

                bg-emerald-500
                hover:bg-emerald-400

                text-[#042a1c]

                text-sm
                font-bold

                shadow-[0_15px_40px_rgba(16,185,129,0.25)]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:shadow-[0_18px_45px_rgba(16,185,129,0.32)]

                overflow-hidden
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

                  -translate-x-[130%]

                  group-hover:translate-x-[130%]

                  transition-transform
                  duration-1000
                "
              />

              <HeartHandshake className="relative z-10 w-[18px] h-[18px]" />

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

            {/* SECONDARY */}
            <Link
              href="/program"
              className="
                group

                inline-flex
                items-center
                justify-center

                gap-2

                min-h-[52px]

                px-6

                rounded-xl

                bg-white/[0.07]
                hover:bg-white/[0.12]

                backdrop-blur-xl

                border
                border-white/10
                hover:border-white/20

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

                  text-white/60

                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {/* =================================================
              TRUST INFORMATION
          ================================================= */}
          <div
            className="
              mt-9

              flex
              flex-wrap

              items-center

              gap-x-6
              gap-y-3

              text-[11px]
              sm:text-xs

              text-white/55
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  items-center
                  justify-center

                  w-7
                  h-7

                  rounded-lg

                  bg-emerald-400/10

                  border
                  border-emerald-400/10
                "
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              </div>

              <span>
                Aman & terpercaya
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  items-center
                  justify-center

                  w-7
                  h-7

                  rounded-lg

                  bg-emerald-400/10

                  border
                  border-emerald-400/10
                "
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </div>

              <span>
                Transparan & amanah
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          GLASS CARD DEKORATIF - DESKTOP
      ===================================================== */}
      <div
        className="
          hidden
          xl:block

          absolute

          right-[7%]
          bottom-[18%]

          z-10

          w-[300px]

          rounded-[26px]

          border
          border-white/10

          bg-white/[0.07]

          backdrop-blur-2xl

          p-5

          shadow-[0_30px_80px_rgba(0,0,0,0.28)]
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

              rounded-xl

              bg-emerald-400/15

              border
              border-emerald-300/10
            "
          >
            <HeartHandshake
              className="
                w-5
                h-5
                text-emerald-300
              "
            />
          </div>

          <div>
            <p
              className="
                text-[10px]
                tracking-[0.15em]
                uppercase
                text-white/45
              "
            >
              Kebaikan Bersama
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-semibold
                text-white
              "
            >
              Amal yang terus mengalir
            </p>
          </div>
        </div>

        <div
          className="
            mt-4
            h-px
            w-full
            bg-white/10
          "
        />

        <p
          className="
            mt-4

            text-xs

            leading-6

            text-white/55
          "
        >
          Setiap dukungan Anda ikut membantu pendidikan, kebutuhan
          santri, serta pengembangan dakwah Al-Qur&apos;an.
        </p>
      </div>

      {/* =====================================================
          BOTTOM FADE
      ===================================================== */}
      <div
        className="
          absolute
          bottom-0
          left-0

          z-20

          w-full
          h-28

          bg-gradient-to-t
          from-white
          via-white/20
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

          z-30

          w-full

          overflow-hidden

          pointer-events-none
        "
      >
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="
            block
            w-full
            h-[35px]
            md:h-[55px]
          "
        >
          <path
            d="
              M0,50
              C280,95 470,12 760,42
              C1010,68 1190,92 1440,34
              L1440,90
              L0,90
              Z
            "
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}