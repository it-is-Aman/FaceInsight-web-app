import { ArrowRight, Lock, Timer, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TryDemoButton } from "@/components/analyze/TryDemoButton";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const chips = [
  { label: "Oily skin", band: "Likely", className: "left-[-6%] top-[18%]" },
  { label: "Dull skin", band: "Possible", className: "right-[-8%] top-[46%]" },
  { label: "AM / PM routine", band: "Ready", className: "left-[4%] bottom-[10%]" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="surface-grid absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="container-page grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-7">
          <p className="eyebrow">AI skin check · free to try</p>
          <h1 className="text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-6xl">
            Understand your skin from <em className="text-primary not-italic sm:italic">one selfie</em>.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            FaceInsight spots 15 common facial skin concerns, from dark circles to oily skin, then builds a
            simple morning and evening routine you can actually follow.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link href={routes.analyze}>
                Analyze my skin
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <TryDemoButton size="lg" label="See a demo report" />
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Photos never stored
            </li>
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-primary" /> Results in seconds
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> No sign-up for your first check
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-primary/10">
            <Image
              src="/samples/demo-illustration.jpg"
              alt="Illustrated face being analysed"
              fill
              priority
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
            {/* scan frame */}
            <div aria-hidden className="absolute inset-[14%] overflow-hidden rounded-[1.5rem] border-2 border-white/70 [--scan-h:100cqh] [container-type:size]">
              <div className="animate-scan h-0.5 w-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_16px_2px_rgba(255,255,255,0.7)]" />
            </div>
          </div>
          {chips.map((c) => (
            <div
              key={c.label}
              className={`animate-float absolute hidden rounded-xl border bg-background/90 px-3.5 py-2 shadow-lg backdrop-blur sm:block ${c.className}`}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{c.band}</p>
              <p className="text-sm font-semibold">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
