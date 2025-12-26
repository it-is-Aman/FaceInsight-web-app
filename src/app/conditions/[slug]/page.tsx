import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { skinConditions, getConditionBySlug } from '@/lib/conditions';
import { generateMetadata as genMeta, generateBreadcrumbSchema } from '@/lib/seo';
import { routes } from '@/lib/routes';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return skinConditions.map((condition) => ({
        slug: condition.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const condition = getConditionBySlug(slug);

    if (!condition) {
        return genMeta({
            title: 'Condition Not Found',
            description: 'The requested skin condition information could not be found.',
            path: `/conditions/${slug}`,
        });
    }

    return genMeta({
        title: `${condition.name} - Symptoms & Recommendations`,
        description: condition.description,
        path: `/conditions/${slug}`,
    });
}

export default async function ConditionPage({ params }: PageProps) {
    const { slug } = await params;
    const condition = getConditionBySlug(slug);

    if (!condition) {
        notFound();
    }

    return (
        <>
            {/* Breadcrumb Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Conditions', path: '/conditions' },
                        { name: condition.name, path: `/conditions/${slug}` },
                    ])),
                }}
            />

            <div className="min-h-screen bg-slate-50/50 pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Navigation */}
                        <Link
                            href={routes.home}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </Link>

                        {/* Header Section */}
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Info className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-sm font-semibold text-primary tracking-wider uppercase">Condition Guide</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                Understanding {condition.name}
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed">
                                {condition.description}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Symptoms Section */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-50 rounded-xl">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Common Symptoms</h2>
                                </div>

                                <ul className="space-y-4">
                                    {condition.symptoms.map((symptom, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                            <span className="text-slate-600 leading-relaxed">{symptom}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations Section */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Care Advice</h2>
                                </div>

                                <ul className="space-y-4">
                                    {condition.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                            <span className="text-slate-600 leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">Concerned about your skin?</h3>
                                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                    Get a personalized analysis using our AI technology. Upload a photo for instant insights and care recommendations.
                                </p>
                                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full">
                                    <Link href={routes.upload}>
                                        Start Free Analysis
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="mt-8 text-center text-sm text-slate-400 max-w-2xl mx-auto">
                            Disclaimer: This information is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for diagnosis and treatment.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
