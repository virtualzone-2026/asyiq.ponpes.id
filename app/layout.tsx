// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@sanity/client";

import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import LiveDonationNotification from "@/components/LiveDonationNotification";
import type { Donation } from "@/components/LiveDonationNotification";

import "./globals.css";

// ============================================================================
// FONT
// ============================================================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_NAME = "Asyiqul Quran";
const SITE_URL = "https://www.asyiq.ponpes.id";
const SITE_DOMAIN = "www.asyiq.ponpes.id";

const DEFAULT_TITLE =
  "Pondok Pesantren Asyiqul Quran | Pendidikan, Donasi & Infaq Online Amanah";

const DEFAULT_DESCRIPTION =
  "Salurkan infaq, donasi pendidikan, zakat, dan wakaf melalui Pondok Pesantren Asyiqul Quran. Dukung pendidikan santri, fasilitas pesantren, dakwah Al-Quran, dan berbagai program kebaikan.";

const OG_IMAGE = `${SITE_URL}/images/og-banner.jpg`;

// ============================================================================
// SANITY CONFIG
// ============================================================================

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "lsnco71s";

const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * PENTING:
 *
 * Jangan pernah menulis token Sanity langsung di source code.
 *
 * Buat environment variable:
 *
 * SANITY_API_READ_TOKEN=xxxxxxxx
 *
 * Jika dataset Sanity Anda public, token sebenarnya bisa tidak digunakan
 * untuk query read-only seperti di bawah.
 */
const SANITY_READ_TOKEN =
  process.env.SANITY_API_READ_TOKEN;

// ============================================================================
// SANITY SERVER CLIENT
// ============================================================================

const serverClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,

  // Ambil langsung dari Sanity API.
  useCdn: false,

  apiVersion: "2026-09-24",

  ...(SANITY_READ_TOKEN
    ? {
        token: SANITY_READ_TOKEN,
      }
    : {}),
});

// ============================================================================
// REVALIDATE DONATION DATA
// ============================================================================
//
// Donasi terbaru diperbarui maksimal setiap 60 detik.
//
// Ini lebih ringan daripada membuat SELURUH website force-dynamic.
// ============================================================================

export const revalidate = 60;

// ============================================================================
// MASTER SEO METADATA
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // --------------------------------------------------------------------------
  // BASIC
  // --------------------------------------------------------------------------

  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: SITE_NAME,

  manifest: "/manifest.json",

  // --------------------------------------------------------------------------
  // PWA
  // --------------------------------------------------------------------------

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pesantren Asyiq",
  },

  // --------------------------------------------------------------------------
  // KEYWORDS
  // --------------------------------------------------------------------------

  keywords: [
    "Pondok Pesantren Asyiqul Quran",
    "Pesantren Asyiqul Quran",
    "Asyiqul Quran",
    "asyiq ponpes id",
    "donasi pesantren",
    "infaq pesantren",
    "infaq online",
    "zakat online",
    "wakaf pesantren",
    "wakaf pembangunan pesantren",
    "donasi pendidikan santri",
    "donasi santri",
    "pendidikan Islam",
    "dakwah Al-Quran",
    "program pesantren",
  ],

  // --------------------------------------------------------------------------
  // AUTHOR
  // --------------------------------------------------------------------------

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  // --------------------------------------------------------------------------
  // CANONICAL
  // --------------------------------------------------------------------------

  alternates: {
    canonical: SITE_URL,
  },

  // ==========================================================================
  // OPEN GRAPH
  // ==========================================================================
  //
  // INI YANG DIBACA WHATSAPP / FACEBOOK.
  //
  // File wajib berada di:
  //
  // public/images/og-banner.jpg
  //
  // Sehingga bisa dibuka dari:
  //
  // https://www.asyiq.ponpes.id/images/og-banner.jpg
  //
  // ==========================================================================

  openGraph: {
    title: DEFAULT_TITLE,

    description:
      "Tunaikan kepedulian Anda dengan mudah. Dukung pendidikan santri, pembangunan fasilitas pesantren, dakwah Al-Quran, infaq, sedekah, zakat, dan wakaf bersama Asyiqul Quran.",

    url: SITE_URL,

    siteName: SITE_NAME,

    locale: "id_ID",

    type: "website",

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Pondok Pesantren Asyiqul Quran",
      },
    ],
  },

  // ==========================================================================
  // TWITTER / X
  // ==========================================================================

  twitter: {
    card: "summary_large_image",

    title: DEFAULT_TITLE,

    description:
      "Dukung pendidikan santri, dakwah Al-Quran, infaq, sedekah, zakat, dan wakaf bersama Pondok Pesantren Asyiqul Quran.",

    images: [OG_IMAGE],
  },

  // ==========================================================================
  // ROBOTS
  // ==========================================================================

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ==========================================================================
  // FORMAT DETECTION
  // ==========================================================================

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  // ==========================================================================
  // VERIFICATION
  // ==========================================================================
  //
  // Jangan masukkan:
  //
  // google-site-verification-token-anda
  //
  // karena itu hanya placeholder.
  //
  // Kalau sudah punya token asli Search Console, aktifkan:
  //
  // verification: {
  //   google: "TOKEN_GOOGLE_ASLI",
  // },
  //
  // ==========================================================================
};

// ============================================================================
// TYPES
// ============================================================================

interface SanityDonation {
  id?: string;
  name?: string;
  amount?: number | string;
  program?: string;
  slug?: string;
  _createdAt?: string;
}

// ============================================================================
// HELPER: RELATIVE TIME
// ============================================================================

function getRelativeTime(createdAt?: string): string {
  if (!createdAt) {
    return "baru saja";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "baru saja";
  }

  const now = Date.now();

  const difference = Math.max(
    0,
    now - date.getTime()
  );

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} jam yang lalu`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days} hari yang lalu`;
  }

  const months = Math.floor(
    days / 30
  );

  return `${months} bulan yang lalu`;
}

// ============================================================================
// HELPER: PROGRAM NAME
// ============================================================================

function getProgramName(
  item: SanityDonation
): string {
  if (
    typeof item.program === "string" &&
    item.program.trim()
  ) {
    return item.program.trim();
  }

  if (
    typeof item.slug === "string" &&
    item.slug.trim()
  ) {
    return item.slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  return "Infaq & Wakaf Pesantren";
}

// ============================================================================
// HELPER: FORMAT AMOUNT
// ============================================================================

function formatAmount(
  amount: number | string | undefined
): string {
  const value = Number(amount);

  const safeAmount =
    Number.isFinite(value) && value >= 0
      ? value
      : 0;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(safeAmount);
}

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let dynamicDonations: Donation[] = [];

  // ==========================================================================
  // AMBIL DONASI TERBARU
  // ==========================================================================

  try {
    const rawData =
      await serverClient.fetch<SanityDonation[]>(
        `
          *[
            _type == "donationTransaction" &&
            status == "success"
          ]
          | order(_createdAt desc)[0...10] {
            "id": _id,
            "name": donorName,
            "amount": amount,

            "program": coalesce(
              program->title,
              campaign->title,
              programName
            ),

            "slug": coalesce(
              slug.current,
              slug
            ),

            _createdAt
          }
        `,
        {},
        {
          next: {
            revalidate: 60,
          },
        }
      );

    if (
      Array.isArray(rawData) &&
      rawData.length > 0
    ) {
      dynamicDonations = rawData.map(
        (item, index) => {
          const donorName =
            typeof item.name === "string" &&
            item.name.trim()
              ? item.name.trim()
              : "Hamba Allah";

          return {
            id:
              item.id ||
              `donation-${index}`,

            name: donorName,

            amount:
              formatAmount(
                item.amount
              ),

            program:
              getProgramName(item),

            timeLabel:
              getRelativeTime(
                item._createdAt
              ),
          };
        }
      );
    }
  } catch (error) {
    console.error(
      `[${SITE_NAME}] Gagal mengambil data donasi terbaru:`,
      error
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="min-h-screen bg-gray-50 flex flex-col text-gray-800"
        suppressHydrationWarning
      >
        {/* ================================================================
            LIVE DONATION NOTIFICATION
            ================================================================ */}

        <LiveDonationNotification
          donations={dynamicDonations}
        />

        {/* ================================================================
            MAIN LAYOUT
            ================================================================ */}

        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}