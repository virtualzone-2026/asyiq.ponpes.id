// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@sanity/client";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import LiveDonationNotification, { Donation } from "@/components/LiveDonationNotification";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 INITIALIZE SANITY CLIENT (Server-Side Direct Bypass)
const serverClient = createClient({
  projectId: "61d8vnuq",
  dataset: "production",
  useCdn: false, // Wajib false agar data donasi terbaru real-time langsung tertangkap
  apiVersion: "2024-01-01",
  token: "sk44JM4AlD6urcLa9Ak9vvnRpLGlsRai9aftW1wPA4w9zxwhrCpKREk2ArKU25K4kENIPxVXenu4kZhm2cOSaxGP69kz8az2qM2BZDIVzqyAGLjIvVTGKMu39CExUrKwbw2wCb2bfxKPgZ4lqEt2nwLZT4HEc4XT1qfrZ0i6KYupIlT6IOlP",
});

// 🚀 MASTER SEO & PWA METADATA READY
export const metadata: Metadata = {
  title: {
    default: "Pondok Pesantren Asyiq | Platform Pendidikan, Donasi & Infaq Online Amanah",
    template: "%s | Pondok Pesantren Asyiq"
  },
  description: "Salurkan infaq, donasi pendidikan, zakat, dan wakaf Anda secara instan dan amanah melalui Pondok Pesantren Asyiq (asyiq.ponpes.id). Mengalirkan keberkahan untuk kemajuan pendidikan santri, fasilitas pesantren, dan program dakwah ummat.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pesantren Asyiq",
  },
  keywords: [
    "pondok pesantren asyiq",
    "pesantren asyiq",
    "asyiq ponpes id",
    "donasi pesantren",
    "infaq online",
    "bayar zakat online",
    "wakaf pembangunan",
    "donasi santri",
    "lembaga pendidikan islam amanah",
    "infaq produktif",
    "pesantren asyiq banyumas"
  ],
  authors: [{ name: "Pondok Pesantren Asyiq", url: "https://www.asyiq.ponpes.id" }],
  creator: "Pondok Pesantren Asyiq",
  publisher: "Pondok Pesantren Asyiq",
  metadataBase: new URL("https://www.asyiq.ponpes.id"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pondok Pesantren Asyiq | Platform Pendidikan, Donasi & Infaq Online Amanah",
    description: "Tunaikan kepedulian Anda dengan mudah. Dukung program pendidikan santri, pembangunan fasilitas, dan infaq operasional secara transparan dan otomatis via QRIS & Virtual Account bersama asyiq.ponpes.id.",
    url: "https://www.asyiq.ponpes.id",
    siteName: "Pondok Pesantren Asyiq",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://www.asyiq.ponpes.id/images/banner.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Pondok Pesantren Asyiq - Mengalirkan Keberkahan Melalui Pendidikan dan Infaq",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pondok Pesantren Asyiq | Donasi & Infaq Pendidikan Online Mudah",
    description: "Platform resmi galang donasi, infaq, dan wakaf amanah bersama Pondok Pesantren Asyiq.",
    images: ["https://www.asyiq.ponpes.id/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-token-anda",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  let dynamicDonations: Donation[] = [];

  try {
    // 🔥 GROQ QUERY JUJUR: Tarik nama program dari relasi, atau tangkap slug transaksi
    const rawData = await serverClient.fetch(
      `*[_type == "donationTransaction" && status == "success"] | order(_createdAt desc)[0...10] {
        "id": _id,
        "name": donorName,
        "amount": amount,
        "program": coalesce(program->title, campaign->title, programName),
        "slug": slug,
        _createdAt
      }`
    );

    if (rawData && rawData.length > 0) {
      dynamicDonations = rawData.map((item: any) => {
        // Hitung selisih waktu dinamis
        const diffMs = Math.abs(new Date().getTime() - new Date(item._createdAt).getTime());
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        let timeLabel = "baru saja";
        if (diffMins > 0 && diffMins < 60) {
          timeLabel = `${diffMins} menit yang lalu`;
        } else if (diffMins >= 60) {
          timeLabel = `${Math.floor(diffMins / 60)} jam yang lalu`;
        }

        // 🚀 LOGIKA AMBIL PROGRAM ASLI:
        // 1. Pakai judul dari relasi Sanity jika ada.
        // 2. Jika relasi kosong, format dari field slug transaksi (misal: "pembangunan-asrama" -> "Pembangunan Asrama").
        // 3. Fallback terakhir ke "Infaq Pesantren".
        let displayProgram = item.program;

        if (!displayProgram && item.slug) {
          displayProgram = String(item.slug)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char: string) => char.toUpperCase());
        }

        if (!displayProgram) {
          displayProgram = "Infaq Pesantren";
        }

        return {
          id: item.id,
          name: item.name || "Hamba Allah",
          amount: new Intl.NumberFormat("id-ID", { 
            style: "currency", 
            currency: "IDR", 
            minimumFractionDigits: 0 
          }).format(item.amount),
          program: displayProgram,
          timeLabel: timeLabel
        };
      });
    }
  } catch (err) {
    console.error("🔥 Gagal mengambil data donasi asli di layout:", err);
  }

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-50 flex flex-col text-gray-800" suppressHydrationWarning>
        
        {/* 🚀 POP-UP NOTIFICATION: Mengoper data asli yang diambil langsung dari server */}
        <LiveDonationNotification donations={dynamicDonations} />

        {/* 🚀 LAYOUT CLIENT WRAPPER */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

      </body>
    </html>
  );
}