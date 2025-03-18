import { AlertCircle, ArrowRight, Microscope, Sparkles, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Features = () => {
    const features = [
        {
            icon: <Microscope className="h-6 w-6 text-primary" />,
            title: "Accurate Analysis",
            description:
                "Our AI model has been trained on thousands of images to provide accurate skin condition diagnoses.",
        },
        {
            icon: <AlertCircle className="h-6 w-6 text-primary" />,
            title: "Early Detection",
            description:
                "Identify potential skin issues before they become serious problems with regular screenings.",
        },
        {
            icon: <Sparkles className="h-6 w-6 text-primary" />,
            title: "Personalized Care",
            description:
                "Receive tailored recommendations based on your specific skin condition and needs.",
        },
        {
            icon: <MessageSquare className="h-6 w-6 text-primary" />,
            title: "Detailed Reports",
            description:
                "Get comprehensive analysis reports with actionable insights for your skin health.",
        },
        {
            icon: <Shield className="h-6 w-6 text-primary" />,
            title: "Private & Secure",
            description:
                "Your data and images are processed with the highest security standards and never shared.",
        },
    ];

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
            <div className="container">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            Core Features
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Advanced AI for Your Skin Health
                        </h2>
                        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg md:text-xl/relaxed">
                            Our platform uses advanced machine learning to analyze your skin and provide personalized recommendations.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card flex flex-col items-start gap-4 h-full"
                        >
                            <div className="rounded-full bg-primary/10 p-3 shadow-sm">
                                {feature.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold ">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-16">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                        <Link href="/upload" className="flex items-center justify-center">
                            Try It Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Features;