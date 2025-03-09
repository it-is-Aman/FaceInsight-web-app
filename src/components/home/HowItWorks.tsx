import { ArrowRight, Upload, Search, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <Upload className="h-6 w-6 text-secondary" />,
      title: "Upload Your Image",
      description:
        "Take a clear photo of your skin concern and upload it to our secure platform.",
    },
    {
      number: "02",
      icon: <Search className="h-6 w-6 text-secondary" />,
      title: "AI Analysis",
      description:
        "Our advanced AI model analyzes your image and identifies potential skin conditions.",
    },
    {
      number: "03",
      icon: <FileText className="h-6 w-6 text-secondary" />,
      title: "Get Detailed Results",
      description:
        "Receive a comprehensive report with diagnosis, confidence score, and personalized recommendations.",
    },
    {
      number: "04",
      icon: <MessageSquare className="h-6 w-6 text-secondary" />,
      title: "Chat Support",
      description:
        "Ask questions and get personalized advice.",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How FaceCare AI Works
            </h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground text-lg md:text-xl/relaxed">
              Get accurate skin analysis in just a few simple steps.
            </p>
          </div>
        </div>

        <div className="relative mt-20">
          {/* Connecting Line */}
          <div className="absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block"></div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center relative group"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white mb-8 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="absolute top-0 -left-2 text-8xl font-bold text-gray-100 dark:text-gray-900 opacity-60 z-0 font-display">
                  {step.number}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-20">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
            <Link href="/upload" className="flex items-center justify-center">
              Start Analysis <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;