import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';


export default function About() {

    return (
        <div className="flex flex-col min-h-screen">
            <section className="pt-24 pb-12 bg-gradient-to-b from-[#F5F5F5] to-white">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#283E4A] mb-4">
                        About FaceInsight AI
                    </h1>
                    <div className="grid md:grid-cols-2 gap-12 mt-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-[#283E4A] mb-4">Our Mission</h2>
                            <p className="text-lg text-[#4A4A4A] mb-6">
                                FaceInsight AI combines cutting-edge artificial intelligence with dermatological expertise
                                to provide accurate skin condition analysis and personalized recommendations. Our goal
                                is to make professional skin analysis accessible to everyone.
                            </p>
                            <h2 className="text-2xl font-semibold text-[#283E4A] mb-4">Technology</h2>
                            <p className="text-lg text-[#4A4A4A] mb-6">
                                We use advanced deep learning models trained on thousands of dermatological images
                                to identify various skin conditions. Our AI system is continuously updated to provide
                                the most accurate and reliable results.
                            </p>
                            <Button
                                asChild variant="outline" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group"
                            >
                                <Link href={"/upload"} >
                            Try Face Analysis
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-[#283E4A] mb-4">Key Features</h2>
                    <ul className="space-y-4 text-lg text-[#4A4A4A]">
                        <li>• Instant skin condition analysis</li>
                        <li>• Personalized treatment recommendations</li>
                        <li>• AI-powered condition identification</li>
                        <li>• Secure and private analysis</li>
                        <li>• Expert-backed advice</li>
                    </ul>
                </div>
        </div>
                </div >
            </section >
        </div >
    );
}
