import { Moon, ShieldCheck, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Static illustration of what a report looks like, for the landing page. */
export default function ReportPreview() {
  return (
    <section className="py-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="eyebrow">Your report</p>
          <h2 className="text-3xl font-medium sm:text-4xl">Honest results, not false precision</h2>
          <p className="text-muted-foreground">
            Instead of “87.3% acne”, you get clear confidence levels, a short explanation of each concern, and a
            routine built around what was found, with a nudge to see a dermatologist when it matters.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Confidence shown as Likely / Possible / Low signal",
              "Morning and evening routine, with the reason for each step",
              "Ingredients to look for, and what to avoid",
              "Follow-up chat that knows your results",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="rounded-3xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7">
          <div className="flex items-center justify-between">
            <p className="font-serif text-xl">Skin report</p>
            <Badge variant="secondary">Today</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { name: "Oily skin", band: "Likely", w: "w-[72%]" },
              { name: "Dull skin", band: "Possible", w: "w-[42%]" },
              { name: "Dry skin", band: "Low signal", w: "w-[14%]" },
            ].map((r) => (
              <div key={r.name} className="rounded-xl border p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">{r.band}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div className={`h-full rounded-full bg-primary ${r.w}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-accent/60 p-3.5 text-accent-foreground">
              <Sun className="mb-2 size-4" />
              Gel cleanser → Niacinamide → SPF 50
            </div>
            <div className="rounded-xl bg-secondary p-3.5 text-secondary-foreground">
              <Moon className="mb-2 size-4" />
              Cleanse → BHA (3×/week) → Light moisturiser
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
