// app/sitemap.ts
import { MetadataRoute } from 'next';

// Sesuaikan URL domain utama Pondok Pesantren Asyiq
const BASE_URL = 'https://www.asyiq.ponpes.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Rute Statis Utama (Halaman yang kodenya tertulis manual di proyek)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Prioritas tertinggi untuk Homepage
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  let campaignRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    // 2. Fetch Rute Dinamis untuk Seluruh Program Pesantren / Galang Dana
    const resPrograms = await fetch(`${BASE_URL}/api/programs`, { cache: 'no-store' });
    const jsonPrograms = await resPrograms.json();
    
    if (jsonPrograms.success && Array.isArray(jsonPrograms.data)) {
      campaignRoutes = jsonPrograms.data.map((program: any) => ({
        url: `${BASE_URL}/program/${program.slug}`,
        lastModified: new Date(), // Idealnya menggunakan field updated/_updatedAt dari Sanity
        changeFrequency: 'hourly', // Diubah per jam karena data/donasi dinamis berganti
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch programs for sitemap:', error);
  }

  try {
    // 3. Fetch Rute Dinamis untuk Seluruh Kabar Berita/Blog Pesantren
    const resNews = await fetch(`${BASE_URL}/api/news`, { cache: 'no-store' });
    const jsonNews = await resNews.json();
    
    if (jsonNews.success && Array.isArray(jsonNews.data)) {
      blogRoutes = jsonNews.data.map((article: any) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch news for sitemap:', error);
  }

  // 4. Gabungkan semua rute menjadi satu kesatuan sitemap utuh
  return [...staticRoutes, ...campaignRoutes, ...blogRoutes];
}