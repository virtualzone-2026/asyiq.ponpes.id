// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';
import { createClient } from '@sanity/client';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export const dynamic = 'force-dynamic';

// 🚀 BYPASS CLIENT: Menggunakan token tulis/baca rahasia agar kebal dari delay cache/CDN Sanity
const serverMetadataClient = createClient({
  projectId: 'lsnco71s',
  dataset: 'production',
  useCdn: false, // Wajib false agar datanya langsung ditarik real-time dari master database
  apiVersion: '2024-01-01',
  token: 'skOF6YFJx8LIu5AFv5aivLK4nCpco1gA7D3Z9Vh50gBkx6mH6P9PYNULsunZWCU719cpxfJWVJb62pE6EUQrhg1WrloEvpiQOmJqBTnlGLeQuz8x0rivMeOVBynRqvzELsSvEu6LnHImrYrdf2Skp1feDHUnQB0TJjIYGVBl9MkIYoIMe6h0',
});

// ===================================================================
// 🚀 DYNAMIC METADATA: Murni query server-to-server (Anti-Timeout / Kebal 404)
// ===================================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.asyiq.ponpes.id';
  if (!siteUrl.includes('www.')) {
    siteUrl = siteUrl.replace('https://', 'https://www.');
  }
  
  let campaignTitle = 'Sedekah Subuh | Asyiqul Quran';
  let campaignDesc = 'Awali hari dengan keberkahan. Sedekah subuh adalah waktu terbaik untuk berbagi kebaikan.'; 
  let imageUrl = '';

  try {
    // Tembak langsung ke Sanity master server, tangkap semua variasi field gambar (mainImage, image, banner, dll)
    const query = `*[(_type == "program" || _type == "campaign") && slug.current == $slug][0] {
      title,
      description,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "thumbnailUrl": thumbnail.asset->url,
      "bannerUrl": banner.asset->url
    }`;
    
    const found = await serverMetadataClient.fetch(query, { slug });
    
    if (found) {
      if (found.title) campaignTitle = found.title;
      
      // LOGIC PARSING DESKRIPSI
      if (found.description) {
        if (typeof found.description === 'string') {
          campaignDesc = found.description.slice(0, 140) + '...';
        } else if (Array.isArray(found.description)) {
          const plainText = found.description
            .filter((block: any) => block._type === 'block' && block.children)
            .map((block: any) => block.children.map((child: any) => child.text).join(''))
            .join(' ');
          if (plainText) campaignDesc = plainText.slice(0, 140) + '...';
        }
      }

      // Pilih gambar mana pun yang sukses terisi dari CMS Sanity
      const finalSanityImage = found.mainImageUrl || found.imageUrl || found.thumbnailUrl || found.bannerUrl;
      if (finalSanityImage) {
        imageUrl = `${finalSanityImage}?format=jpg&w=1200&h=630&fit=crop`;
      }
    }
  } catch (error) {
    console.error('🔥 Direct server metadata query failed:', error);
  }

  // ABSOLUTE JAMINAN: Jika database kosong/eror, paksa pakai gambar asset blog yang terbukti sukses lolos WhatsApp
  if (!imageUrl) {
    imageUrl = 'https://cdn.sanity.io/images/61d8vnuq/production/54504f4c2810fb8bece0e88229ef5e2ad6f0ba8c-1200x630.jpg?format=jpg';
  }

  return {
    title: campaignTitle,
    description: campaignDesc,
    alternates: {
      canonical: `${siteUrl}/campaign/${slug}`,
    },
    openGraph: {
      title: campaignTitle,
      description: campaignDesc,
      url: `${siteUrl}/campaign/${slug}`,
      siteName: 'Asyiqul Quran',
      locale: 'id_ID',
      type: 'article', // Tetap gunakan tipe artikel karena terbukti sukses meloloskan halaman berita
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: campaignTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaignTitle,
      description: campaignDesc,
      images: [imageUrl],
    },
  };
}

// ===================================================================
// 🖥️ SERVER COMPONENT ENTRY
// ===================================================================
export default async function CampaignPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams;

  return <CampaignDetailClient slug={slug} referral={ref || null} />;
}