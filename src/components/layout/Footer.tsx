"use client"

import Link from "next/link";
import { routes } from "@/lib/routes";

const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-background py-12 md:py-16" role="contentinfo">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-2">
                        <Link href={routes.home} className="flex items-center mb-6" aria-label="FaceInsight AI Home">
                            <span className="bg-primary text-primary-foreground h-9 w-9 rounded-full flex items-center justify-center mr-2 shadow-sm">
                                <span className="font-serif text-lg font-semibold">F</span>
                            </span>
                            <span className="font-serif font-medium text-lg">
                                FaceInsight<span className="text-primary font-bold">AI</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            FaceInsight AI is an AI-powered web platform that allows users to upload skin images for disease analysis, providing diagnostic insights and recommendations.
                        </p>
                        <nav aria-label="Social media links" className="flex space-x-4 mt-6">
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Follow us on Facebook"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Follow us on Instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Follow us on Twitter"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </a>
                        </nav>
                    </div>
                    <nav aria-label="Product navigation">
                        <h3 className="text-base font-medium mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href={routes.upload} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Skin Analysis
                                </Link>
                            </li>
                            <li>
                                <Link href={routes.features} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href={routes.howItWorks} className="text-muted-foreground hover:text-foreground transition-colors">
                                    How It Works
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label="Company navigation">
                        <h3 className="text-base font-medium mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href={routes.about} className="text-muted-foreground hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href={routes.privacy} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href={routes.terms} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} FaceInsight AI. All rights reserved.
                    </p>
                    <nav aria-label="Legal links" className="flex space-x-6 mt-4 md:mt-0">
                        <Link href={routes.privacy} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href={routes.terms} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

