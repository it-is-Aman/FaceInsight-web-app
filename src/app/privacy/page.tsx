import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Shield, Lock, Eye, Database } from 'lucide-react';
import { generateMetadata as genMeta } from '@/lib/seo';
import { routes } from '@/lib/routes';

export const metadata: Metadata = genMeta({
    title: 'Privacy Policy',
    description: 'How we handle and protect your data at FaceInsight AI.',
    path: '/privacy',
});

export default function PrivacyPage() {
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
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-primary tracking-wider uppercase">Privacy</span>
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
                        <p className="text-slate-500 mb-12">Last updated: {lastUpdated}</p>

                        <div className="prose prose-slate max-w-none">
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">Our Commitment</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    At FaceInsight AI, we believe your health data is your most personal information. Our mission is to provide you with insights while maintaining the highest standards of data protection. We never sell your personal information or images to third parties.
                                </p>
                            </section>

                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <Eye className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">Information We Collect</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    To provide our skin analysis service, we collect:
                                </p>
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span><strong>Images:</strong> The photos you upload for analysis. These are processed by our AI to provide results.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span><strong>Account Details:</strong> Your email and name if you choose to create an account.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span><strong>Usage Data:</strong> Basic technical information about how you use our site to help us improve the experience.</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <Database className="w-5 h-5 text-slate-400" />
                                    <h2 className="text-2xl font-bold text-slate-900 m-0">How We Use Your Data</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Your data is used strictly for:
                                </p>
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Providing the AI-powered skin analysis results.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Saving your analysis history (if you have an account).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-slate-900">•</span>
                                        <span>Improving the accuracy of our AI models (anonymized data only).</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You have the right to access, correct, or delete your personal data at any time. If you wish to delete your account and all associated data, you can do so through your account settings or by contacting our support team.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
