"use client";

import { AlertTriangle, Ban, FlaskConical, Moon, RefreshCw, Sparkles, Stethoscope, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Insights } from "@/lib/analysis";
import { readApiError } from "@/lib/api";
import { conditionName } from "@/lib/conditions";

async function fetchInsights(analysisId: string): Promise<Insights> {
  const res = await fetch(`/api/analyses/${analysisId}/insights`, { method: "POST" });
  if (!res.ok) throw new Error((await readApiError(res)).message);
  return (await res.json()).insights;
}

export function InsightsPanel({ analysisId, initial }: { analysisId: string; initial: Insights | null }) {
  const [insights, setInsights] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchInsights(analysisId)
      .then((data) => {
        setError(null);
        setInsights(data);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Couldn't load your care guide."));
  }, [analysisId]);

  useEffect(() => {
    if (!initial) load();
  }, [initial, load]);

  if (error) {
    return (
      <section className="rounded-3xl border bg-card p-6">
        <p className="font-medium">Care guide unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button
          size="sm"
          className="mt-4"
          onClick={() => {
            setError(null);
            load();
          }}
        >
          <RefreshCw /> Retry
        </Button>
      </section>
    );
  }

  if (!insights) return <InsightsSkeleton />;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/[0.07] via-card to-card p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> Summary
        </p>
        <p className="mt-3 font-serif text-xl leading-snug">{insights.overview}</p>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="text-2xl">Your routine</h2>
        <Tabs defaultValue="morning" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-72">
            <TabsTrigger value="morning">
              <Sun /> Morning
            </TabsTrigger>
            <TabsTrigger value="evening">
              <Moon /> Evening
            </TabsTrigger>
          </TabsList>
          {(["morning", "evening"] as const).map((time) => (
            <TabsContent key={time} value={time} className="mt-4">
              <ol className="space-y-3">
                {insights.routine[time].map((s, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{s.step}</p>
                      <p className="text-sm text-muted-foreground">{s.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="text-2xl">About each concern</h2>
        <Accordion type="multiple" defaultValue={[insights.concerns[0]?.label ?? ""]} className="mt-2">
          {insights.concerns.map((c) => (
            <AccordionItem key={c.label} value={c.label}>
              <AccordionTrigger className="text-base">{conditionName(c.label)}</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">{c.whatItIs}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-sm font-semibold">Common causes</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {c.likelyCauses.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-sm font-semibold">What helps</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {c.whatHelps.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="flex gap-2 rounded-xl bg-warning/10 p-3 text-sm">
                  <Stethoscope className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong className="font-semibold">See a dermatologist if:</strong> {c.seeADermatologistIf}
                  </span>
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
            <FlaskConical className="size-4 text-primary" /> Ingredients to look for
          </h2>
          <ul className="mt-4 space-y-3">
            {insights.ingredients.map((i) => (
              <li key={i.name}>
                <p className="font-medium">{i.name}</p>
                <p className="text-sm text-muted-foreground">{i.benefit}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
            <Ban className="size-4 text-destructive" /> Best to avoid
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {insights.avoid.map((a) => (
              <li key={a} className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Generating your care guide">
      <div className="rounded-3xl border bg-card p-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" /> Writing your personalised care guide…
        </p>
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-4/5" />
      </div>
      <div className="space-y-3 rounded-3xl border bg-card p-6">
        <Skeleton className="h-7 w-40" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
