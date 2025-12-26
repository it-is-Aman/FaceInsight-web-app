import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/seo';

// Noindex for upload page - user-specific content shouldn't be indexed
export const metadata: Metadata = genMeta({
    title: 'Skin Condition Analysis',
    description: 'Upload your skin image for AI-powered analysis. Get instant diagnosis and personalized skincare recommendations.',
    path: '/upload',
    noIndex: true, // Don't index user-generated content pages
});

export default function UploadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
