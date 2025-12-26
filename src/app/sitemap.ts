import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

/**
 * Dynamic sitemap generation for SEO
 * Next.js automatically serves this at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    // Static pages with their priorities and change frequencies
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/upload`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    // TODO: Add dynamic pages here when you have them
    // For example, if you add skin condition pages:
    // const conditionPages = skinConditions.map(condition => ({
    //   url: `${baseUrl}/conditions/${condition.slug}`,
    //   lastModified: condition.updatedAt,
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.7,
    // }));

    return [
        ...staticPages,
        // ...conditionPages,
    ];
}
