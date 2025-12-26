import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

/**
 * Robots.txt configuration
 * Next.js automatically serves this at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',           // Disallow API routes
                    '/signin/',        // Disallow auth pages
                    '/signup/',        // Disallow auth pages
                    '/_next/',         // Disallow Next.js internals
                    '/private/',       // Disallow any private routes
                ],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
