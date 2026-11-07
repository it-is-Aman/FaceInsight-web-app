import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Prediction } from "@/lib/analysis";
import { BAND_COPY, confidenceBand, conditionName, getConditionByLabel } from "@/lib/conditions";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const bandStyles = {
  likely: "bg-primary/12 text-primary border-primary/20",
  possible: "bg-warning/15 text-foreground border-warning/30",
  unlikely: "bg-muted text-muted-foreground border-border",
} as const;

export function ConcernCard({ prediction, rank }: { prediction: Prediction; rank: number }) {
  const band = confidenceBand(prediction.confidence);
  const condition = getConditionByLabel(prediction.label);
  const pct = Math.round(prediction.confidence * 100);

  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">#{rank}</p>
          <h3 className="font-serif text-xl">{conditionName(prediction.label)}</h3>
        </div>
        <Badge variant="outline" className={cn("shrink-0", bandStyles[band])} title={BAND_COPY[band].hint}>
          {BAND_COPY[band].label}
        </Badge>
      </div>

      <div className="mt-4">
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Model confidence for ${conditionName(prediction.label)}`}
        >
          <div
            className={cn("h-full rounded-full", band === "unlikely" ? "bg-muted-foreground/40" : "bg-primary")}
            style={{ width: `${Math.max(pct, 3)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Model confidence {pct}%</p>
      </div>

      {condition && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{condition.summary}</p>
          <Link
            href={routes.condition(condition.slug)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline print:hidden"
          >
            Learn more <ArrowRight className="size-3.5" />
          </Link>
        </>
      )}
    </article>
  );
}
