import type { Metadata } from "next";

export const siteConfig = {
  name: "FaceInsight AI",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://faceinsight.ai").replace(/\/+$/, ""),
  description:
    "Check your skin from a single selfie. FaceInsight AI spots 15 common facial skin concerns and builds a personalised care routine in seconds. Photos are never stored.",
  keywords: [
    "skin analysis",
    "AI skin check",
    "skincare routine",
    "face skin analyzer",
    "acne",
    "dark circles",
    "oily skin",
    "dry skin",
    "personalised skincare",
  ],
  author: "Aman",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "the email listed on our GitHub profile",
  locale: "en_US",
};

export function canonical(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean === "/" ? "" : clean}`;
}

export function pageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path), siteName: siteConfig.name, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
