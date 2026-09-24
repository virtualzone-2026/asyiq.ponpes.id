// app/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import BlogDetailClient from '@/components/BlogDetailClient';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// ============================================================================
// SITE CONFIG
// ============================================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://asyiq.ponpes.id';

const SITE_NAME = 'asyiq.ponpes.id';

const DEFAULT_TITLE = `Berita & Artikel | ${SITE_NAME}`;

const DEFAULT_DESCRIPTION =
  'Baca berita, artikel, informasi pesantren, pendidikan, dakwah, dan berbagai kegiatan terbaru melalui asyiq.ponpes.id.';

const DEFAULT_IMAGE = `${SITE_URL}/images/banner-utama.png`;

// ============================================================================
// CACHE
// ============================================================================

/**
 * Halaman diperbarui maksimal setiap 60 detik.
 *
 * Jangan memakai:
 *
 * export const dynamic = 'force-dynamic'
 *
 * karena force-dynamic akan membuat halaman selalu dinamis dan
 * membuat konsep revalidate 60 detik menjadi tidak optimal.
 */
export const revalidate = 60;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Mengubah Portable Text Sanity menjadi plain text.
 */
function portableTextToPlainText(content: unknown): string {
  if (!Array.isArray(content)) return '';

  return content
    .filter(
      (block: any) =>
        block &&
        block._type === 'block' &&
        Array.isArray(block.children)
    )
    .map((block: any) =>
      block.children
        .map((child: any) =>
          typeof child?.text === 'string' ? child.text : ''
        )
        .join('')
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Membatasi deskripsi metadata tanpa memotong terlalu kasar.
 */
function createExcerpt(text: string, maxLength = 160): string {
  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (!cleanText) return '';

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  const sliced = cleanText.slice(0, maxLength);

  const lastSpace = sliced.lastIndexOf(' ');

  return `${sliced.slice(0, lastSpace > 100 ? lastSpace : maxLength).trim()}...`;
}

/**
 * Memastikan URL gambar valid dan absolute.
 */
function normalizeImageUrl(image: unknown): string {
  if (!image || typeof image !== 'string') {
    return DEFAULT_IMAGE;
  }

  const value = image.trim();

  if (!value) {
    return DEFAULT_IMAGE;
  }

  // Sudah absolute URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Relative URL
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

// ============================================================================
// DYNAMIC METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  // --------------------------------------------------------------------------
  // DEFAULT VALUES
  // --------------------------------------------------------------------------

  let articleTitle = DEFAULT_TITLE;
  let articleExcerpt = DEFAULT_DESCRIPTION;
  let imageUrl = DEFAULT_IMAGE;

  try {
    // =========================================================================
    // FETCH ARTICLE
    // =========================================================================

    const res = await fetch(
      `${SITE_URL}/api/news/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Gagal mengambil artikel. HTTP status: ${res.status}`
      );
    }

    const json = await res.json();

    const article = json?.data?.article;

    // =========================================================================
    // ARTICLE FOUND
    // =========================================================================

    if (article) {
      // -----------------------------------------------------------------------
      // TITLE
      // -----------------------------------------------------------------------

      if (
        typeof article.title === 'string' &&
        article.title.trim()
      ) {
        articleTitle = article.title.trim();
      }

      // -----------------------------------------------------------------------
      // DESCRIPTION / EXCERPT
      // -----------------------------------------------------------------------

      let rawExcerpt = '';

      // Prioritas pertama: excerpt dari Sanity/API
      if (
        typeof article.excerpt === 'string' &&
        article.excerpt.trim()
      ) {
        rawExcerpt = article.excerpt;
      }

      // Prioritas kedua: content berupa string
      else if (
        typeof article.content === 'string' &&
        article.content.trim()
      ) {
        rawExcerpt = article.content;
      }

      // Prioritas ketiga: Portable Text
      else if (Array.isArray(article.content)) {
        rawExcerpt = portableTextToPlainText(article.content);
      }

      articleExcerpt = createExcerpt(rawExcerpt);

      // -----------------------------------------------------------------------
      // FALLBACK DESCRIPTION
      // -----------------------------------------------------------------------

      if (!articleExcerpt) {
        articleExcerpt =
          `Baca informasi lengkap mengenai "${articleTitle}" ` +
          `di ${SITE_NAME}.`;
      }

      // -----------------------------------------------------------------------
      // IMAGE
      // -----------------------------------------------------------------------

      const rawImage =
        article.imageUrl ||
        article.image ||
        article.mainImage ||
        article.thumbnail;

      imageUrl = normalizeImageUrl(rawImage);
    }
  } catch (error) {
    console.error(
      `[${SITE_NAME}] Gagal generate metadata artikel:`,
      error
    );

    articleExcerpt = DEFAULT_DESCRIPTION;
    imageUrl = DEFAULT_IMAGE;
  }

  // ==========================================================================
  // CANONICAL URL
  // ==========================================================================

  const articleUrl = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;

  // ==========================================================================
  // RETURN METADATA
  // ==========================================================================

  return {
    title: articleTitle,

    description: articleExcerpt,

    alternates: {
      canonical: articleUrl,
    },

    // =========================================================================
    // OPEN GRAPH
    // =========================================================================

    openGraph: {
      title: articleTitle,

      description: articleExcerpt,

      url: articleUrl,

      siteName: SITE_NAME,

      locale: 'id_ID',

      type: 'article',

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: articleTitle,
        },
      ],
    },

    // =========================================================================
    // TWITTER / X
    // =========================================================================

    twitter: {
      card: 'summary_large_image',

      title: articleTitle,

      description: articleExcerpt,

      images: [imageUrl],
    },
  };
}

// ============================================================================
// SERVER COMPONENT ENTRY
// ============================================================================

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;

  return <BlogDetailClient slug={slug} />;
}