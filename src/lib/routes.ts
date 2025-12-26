/**
 * Centralized route definitions for internal linking
 * Use these constants throughout the app for consistent URLs
 */

export const routes = {
    home: '/',
    about: '/about',
    upload: '/upload',
    pricing: '/pricing',

    // Auth routes
    signIn: '/signin',
    signUp: '/signup',

    // Legal pages (to be created)
    privacy: '/privacy',
    terms: '/terms',

    // Feature sections (anchor links on home page)
    features: '/#features',
    howItWorks: '/#how-it-works',
} as const;

/**
 * Navigation items for header/footer
 */
export const mainNavItems = [
    { label: 'Home', href: routes.home },
    { label: 'Upload', href: routes.upload },
    { label: 'About', href: routes.about },
] as const;

/**
 * Footer navigation structure
 */
export const footerNavigation = {
    product: [
        { label: 'Features', href: routes.features },
        { label: 'Skin Analysis', href: routes.upload },
        { label: 'Pricing', href: routes.pricing },
    ],
    company: [
        { label: 'About', href: routes.about },
        { label: 'Privacy Policy', href: routes.privacy },
        { label: 'Terms of Service', href: routes.terms },
    ],
    social: [
        { label: 'Twitter', href: 'https://twitter.com/', icon: 'twitter' },
        { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
        { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    ],
} as const;

export type RouteKey = keyof typeof routes;
