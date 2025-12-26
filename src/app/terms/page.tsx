import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileText, Scale, AlertCircle, HelpCircle } from 'lucide-react';
import { generateMetadata as genMeta } from '@/lib/seo';
import { routes } from '@/lib/routes';

export const metadata: Metadata = genMeta({
    title: 'Terms of Service',
    description: 'The terms and conditions for using FaceInsight AI.',
    path: '/terms',
});

export default function TermsPage() {
    const lastUpdated = 'December 26, 2025';

    return (
        <div className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href={routes.home}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-primary tracking-wider uppercase">Legal</span>
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
                        <p className="text-slate-500 mb-12">Last updated: {lastUpdated}</p>

                        <div className="prose prose-slate max-w-none">
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <Scale className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">Agreement to Terms</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    By accessing or using FaceInsight AI, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services.
                                </p>
                            </section>

                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">Medical Disclaimer</h2>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mt-4">
                                    <p className="text-amber-900 font-medium mb-2">CRITICAL NOTICE:</p>
                                    <p className="text-amber-800 leading-relaxed m-0">
                                        FaceInsight AI is an educational tool powered by artificial intelligence. It is <strong>NOT</strong> a medical device and does <strong>NOT</strong> provide medical diagnoses. The results are for informational purposes only and should never replace professional medical advice, diagnosis, or treatment from a qualified dermatologist or healthcare provider.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <HelpCircle className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">Use of Service</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    When using our platform, you agree to:
                                </p>
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Only upload images that you have the right to use.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Provide accurate information when creating an account.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Not use the service for any illegal or unauthorized purpose.</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    FaceInsight AI and its creators shall not be liable for any decisions made based on the AI analysis results. You use the service at your own risk and understand that AI analysis can have errors or inaccuracies.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
