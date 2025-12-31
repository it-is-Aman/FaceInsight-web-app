import { type Metadata, type Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Geist, Geist_Mono } from 'next/font/google'
import "./globals.css";
import { PostHogProvider } from './providers'
import { Analytics } from "@vercel/analytics/next"

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  siteConfig,
  generateOrganizationSchema,
  generateWebSiteSchema
} from '@/lib/seo';

// Font configurations with display swap for better performance
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

// Comprehensive metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - AI-Powered Skin Analysis`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
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
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/image/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI Skin Analysis`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [`${siteConfig.url}/image/og-image.jpg`],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'health',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          {/* JSON-LD Structured Data for Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateOrganizationSchema()),
            }}
          />
          {/* JSON-LD Structured Data for WebSite */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateWebSiteSchema()),
            }}
          />
        </head>
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <PostHogProvider>
            <div className={`${geistMono.className} flex flex-col min-h-screen`}>
              <Header />
              <main className={`${geistSans.className} flex-grow`} role="main">
                {children}
                <Analytics />
              </main>
              <Footer />
            </div>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}