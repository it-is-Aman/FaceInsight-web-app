import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CATEGORY_LABELS, CONDITIONS, type ConditionCategory } from "@/lib/conditions";
import { routes } from "@/lib/routes";

export default function ConcernsGrid({ heading = true }: { heading?: boolean }) {
  const groups = Object.keys(CATEGORY_LABELS) as ConditionCategory[];
  return (
    <section id="concerns" className="py-20">
      <div className="container-page">
        {heading && (
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">What it looks for</p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">15 concerns, explained in plain language</h2>
            <p className="mt-3 text-muted-foreground">
              Every result links to a guide on what it is, why it happens, and what helps.
            </p>
          </div>
        )}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g}>
              <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABELS[g]}
              </h3>
              <ul className="divide-y rounded-2xl border bg-card">
                {CONDITIONS.filter((c) => c.category === g).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={routes.condition(c.slug)}
                      className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <span>
                        <span className="block font-medium">{c.name}</span>
                        <span className="line-clamp-1 text-sm text-muted-foreground">{c.summary}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
