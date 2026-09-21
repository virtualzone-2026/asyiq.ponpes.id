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
        sm:px-5
        md:px-8
        lg:px-10

        pt-5
        md:pt-6

        pb-8
        md:pb-10
      "
    >
      {/* =====================================================
          HERO CONTAINER
          Lebih sempit dan mengikuti lebar konten website
      ===================================================== */}
      <div
        className="
          relative
          isolate

          w-full
          max-w-[1120px]
          mx-auto

          min-h-[620px]
          sm:min-h-[640px]
          md:min-h-[650px]
          lg:min-h-[660px]

          overflow-hidden

          rounded-[20px]
          md:rounded-[26px]

          bg-[#06130e]

          shadow-[0_18px_50px_rgba(15,23,42,0.08)]
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
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 95vw,
              1120px
            "
            className="
              object-cover

              object-[56%_center]
              sm:object-center
              lg:object-[center_48%]
            "
          />
        </div>

        {/* =====================================================
            OVERLAY HORIZONTAL
            Gelap di kiri untuk teks,
            sangat tipis di kanan supaya foto tetap terlihat
        ===================================================== */}
        <div
          className="
            absolute
            inset-0
            -z-20

            bg-gradient-to-r

            from-[#03140e]/90
            via-[#03140e]/48
            to-transparent
          "
        />

        {/* =====================================================
            OVERLAY VERTICAL
            Sangat lembut
        ===================================================== */}
        <div
          className="
            absolute
            inset-0
            -z-20

            bg-gradient-to-b

            from-black/[0.04]
            via-transparent
            to-[#02110b]/35
          "
        />

        {/* =====================================================
            AMBIENT GREEN
        ===================================================== */}
        <div
          className="
            absolute
            -z-10

            -left-32
            top-32

            w-[420px]
            h-[420px]

            rounded-full

            bg-emerald-500/[0.06]

            blur-[120px]

            pointer-events-none
          "
        />

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div
          className="
            relative
            z-10

            w-full

            min-h-[620px]
            sm:min-h-[640px]
            md:min-h-[650px]
            lg:min-h-[660px]

            flex
            items-center
          "
        >
          <div
            className="
              w-full

              px-5
              sm:px-7
              md:px-9
              lg:px-12

              pt-16
              pb-16

              sm:pt-20
              sm:pb-20
            "
          >
            <div className="max-w-[570px]">
              {/* =================================================
                  BRAND BADGE
              ================================================= */}
              <div
                className="
                  inline-flex
                  items-center

                  gap-2.5

                  max-w-full

                  mb-6

                  px-3
                  py-2

                  rounded-full

                  bg-white/[0.10]

                  border
                  border-white/[0.14]

                  backdrop-blur-xl

                  shadow-[0_8px_25px_rgba(0,0,0,0.12)]
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

                    shadow-[0_0_8px_rgba(52,211,153,0.7)]
                  "
                />

                <span
                  className="
                    truncate

                    text-[9px]
                    sm:text-[10px]
                    md:text-[11px]

                    font-semibold

                    tracking-[0.11em]

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
                  text-[36px]
                  sm:text-[42px]
                  md:text-[48px]
                  lg:text-[52px]

                  leading-[1.04]

                  tracking-[-0.04em]

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
                  SUB HEADLINE
              ================================================= */}
              <p
                className="
                  mt-5

                  max-w-[500px]

                  text-[22px]
                  sm:text-[25px]
                  md:text-[28px]
                  lg:text-[30px]

                  leading-[1.22]

                  tracking-[-0.025em]

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
                  mt-6

                  max-w-[540px]

                  text-[13px]
                  sm:text-[14px]
                  md:text-[15px]

                  leading-7

                  text-white/72
                "
              >
                Salurkan infak, sedekah, wakaf, dan dukungan
                pendidikan terbaik Anda untuk membantu tumbuhnya
                para santri dan penghafal Al-Qur&apos;an. InsyaAllah
                setiap kebaikan menjadi bagian dari amal yang
                terus mengalir.
              </p>

              {/* =================================================
                  CTA
              ================================================= */}
              <div
                className="
                  mt-7

                  flex
                  flex-col
                  sm:flex-row

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

                    min-h-[50px]

                    px-6

                    rounded-xl

                    overflow-hidden

                    bg-emerald-500
                    hover:bg-emerald-400

                    text-[#03291c]

                    text-sm
                    font-bold

                    shadow-[0_12px_30px_rgba(16,185,129,0.18)]

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

                {/* SECONDARY */}
                <Link
                  href="/program"
                  className="
                    group

                    inline-flex
                    items-center
                    justify-center

                    gap-2.5

                    min-h-[50px]

                    px-6

                    rounded-xl

                    bg-white/[0.09]
                    hover:bg-white/[0.15]

                    backdrop-blur-xl

                    border
                    border-white/[0.14]

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
                  TRUST INFO
              ================================================= */}
              <div
                className="
                  mt-7

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
                    <ShieldCheck
                      className="
                        w-3.5
                        h-3.5

                        text-emerald-300
                      "
                    />
                  </span>

                  <span>
                    Aman & terpercaya
                  </span>
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
                    <Sparkles
                      className="
                        w-3.5
                        h-3.5

                        text-emerald-300
                      "
                    />
                  </span>

                  <span>
                    Transparan & amanah
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FLOATING CARD
            Hanya desktop besar
        ===================================================== */}
        <div
          className="
            hidden
            xl:block

            absolute

            right-6
            bottom-6

            z-20

            w-[250px]

            rounded-[20px]

            border
            border-white/[0.13]

            bg-[#05140e]/55

            backdrop-blur-xl

            p-4

            shadow-[0_20px_50px_rgba(0,0,0,0.22)]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                items-center
                justify-center

                w-10
                h-10

                shrink-0

                rounded-xl

                bg-emerald-400/15

                border
                border-emerald-300/15
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
                  text-[9px]

                  tracking-[0.12em]

                  uppercase

                  text-white/45
                "
              >
                Kebaikan Bersama
              </p>

              <p
                className="
                  mt-0.5

                  text-[13px]

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
              my-3.5

              h-px

              bg-white/10
            "
          />

          <p
            className="
              text-[11px]

              leading-5

              text-white/55
            "
          >
            Setiap dukungan Anda ikut membantu pendidikan,
            kebutuhan santri, serta pengembangan dakwah
            Al-Qur&apos;an.
          </p>
        </div>

        {/* =====================================================
            SOFT BOTTOM SHADE
            Bukan gelombang, hanya gradasi tipis
        ===================================================== */}
        <div
          className="
            absolute

            bottom-0
            left-0

            z-10

            w-full
            h-20

            bg-gradient-to-t

            from-[#03110b]/30
            to-transparent

            pointer-events-none
          "
        />
      </div>
    </section>
  );
}