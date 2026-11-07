import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ConcernsGrid from "@/components/home/ConcernsGrid";
import Faq from "@/components/home/Faq";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import ReportPreview from "@/components/home/ReportPreview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ReportPreview />
      <ConcernsGrid />
      <Faq />
      <section className="pb-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-medium sm:text-4xl">Ready to meet your skin?</h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
              Your first analysis is free. No account needed.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href={routes.analyze}>
                Start your free analysis <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
