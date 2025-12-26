import { Metadata } from 'next';
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import {
  generateMetadata as genMeta,
  generateSoftwareApplicationSchema,
  generateWebPageSchema
} from '@/lib/seo';

// Page-specific SEO metadata
export const metadata: Metadata = genMeta({
  title: 'AI-Powered Skin Analysis & Diagnosis',
  description: 'Upload your skin image and get instant AI-powered diagnosis with personalized skincare recommendations. Accurate skin condition analysis in seconds.',
  path: '/',
});

export default function Home() {
  return (
    <>
      {/* Structured Data for SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareApplicationSchema()),
        }}
      />
      {/* Structured Data for WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebPageSchema({
            title: 'AI-Powered Skin Analysis & Diagnosis',
            description: 'Upload your skin image and get instant AI-powered diagnosis with personalized skincare recommendations.',
            path: '/',
          })),
        }}
      />
      <div>
        <Hero />
        <Features />
        <HowItWorks />
      </div>
    </>
  );
}