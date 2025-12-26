import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Activity } from "lucide-react";
import Image from "next/image";

const Hero = () => {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70"></div>
            <div className="container relative z-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="space-y-4">
                            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                Advanced Skin Analysis Technology
                            </div>
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                Your Personal Skin Health Assistant
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                                Upload your skin image and get AI-powered diagnosis with personalized care recommendations in seconds.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 min-[400px]:flex-row">
                            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                                <Link href="/upload" className="flex items-center justify-center">
                                    Start Analysis <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border border-primary/20 hover:bg-primary/5">
                                <Link href="/about" className="flex items-center justify-center">
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium">Secure Analysis</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full shadow-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium">Results in Seconds</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full shadow-sm">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium">Precision Diagnosis</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] animate-float">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl opacity-30"></div>
                            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-elegant">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay"></div>
                                <Image
                                    src="/image/homePageImg.jpg"
                                    alt="AI-powered skin analysis showing a person receiving personalized skincare recommendations through FaceInsight AI technology"
                                    className="object-cover h-full w-full rounded-2xl opacity-90 transition-all duration-500 hover:scale-105"
                                    width={500}
                                    height={300}
                                    priority
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                                    <h3 className="font-serif text-xl font-semibold">Advanced Analysis</h3>
                                    <p className="text-sm opacity-90">Powered by cutting-edge AI technology</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
