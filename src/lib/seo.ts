import { Metadata } from 'next';

// ============================================================
// Site Configuration - Update these values for your production site
// ============================================================
export const siteConfig = {
  name: 'FaceInsight AI',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://faceinsight.ai',
  description: 'AI-powered skin analysis and personalized skincare recommendations. Upload your skin image and get instant diagnosis with expert care advice.',
  keywords: [
    'skin analysis',
    'AI dermatology',
    'skin condition detection',
    'skincare recommendations',
    'face analysis',
    'skin health',
    'dermatology AI',
    'skin disease detection',
    'personalized skincare',
    'skin diagnosis',
  ],
  author: 'FaceInsight AI',
  twitterHandle: '@faceinsightai',
  locale: 'en_US',
};

// ============================================================
// Metadata Generation Utilities
// ============================================================

/**
 * Generates canonical URL for a given path
 */
export function generateCanonicalUrl(path: string = ''): string {
  const baseUrl = siteConfig.url.endsWith('/') 
    ? siteConfig.url.slice(0, -1) 
    : siteConfig.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Generates comprehensive metadata for a page
 */
export function generateMetadata({
  title,
  description,
  path = '',
  noIndex = false,
  images = [],
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  images?: { url: string; alt: string; width?: number; height?: number }[];
}): Metadata {
  const canonicalUrl = generateCanonicalUrl(path);
  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
  
  // Default OG image if none provided
  const ogImages = images.length > 0 
    ? images 
    : [{ 
        url: `${siteConfig.url}/image/og-image.jpg`,
        alt: siteConfig.name,
        width: 1200,
        height: 630,
      }];

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex 
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      images: ogImages.map(img => img.url),
    },
  };
}

// ============================================================
// JSON-LD Structured Data Generators
// ============================================================

/**
 * Organization schema - use in root layout
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/image/logo.png`,
    description: siteConfig.description,
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/',
      // 'https://facebook.com/',
    ],
  };
}

/**
 * WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  };
}

/**
 * SoftwareApplication schema for the AI tool
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: siteConfig.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };
}

/**
 * WebPage schema generator
 */
export function generateWebPageSchema({
  title,
  description,
  path = '',
}: {
  title: string;
  description: string;
  path?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: generateCanonicalUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/**
 * Breadcrumb schema generator
 */
export function generateBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: generateCanonicalUrl(item.path),
    })),
  };
}

/**
 * FAQPage schema generator
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
