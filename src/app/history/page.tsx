import { auth } from "@clerk/nextjs/server";
import { ArrowRight, ScanFace } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { predictionsSchema } from "@/lib/analysis";
import { BAND_COPY, confidenceBand, conditionName } from "@/lib/conditions";
import { ensureUser, getCreditSummary } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";
import { claimGuestAnalyses, getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Your reports", robots: { index: false } };

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect(routes.signIn);

  await ensureUser(userId);
  await claimGuestAnalyses(userId, (await getViewer()).guestId);

  const [rows, credits] = await Promise.all([
    prisma.analysis.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 100,
      select: { id: true, created_at: true, predictions: true, source: true },
    }),
    getCreditSummary(userId),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Your skin reports"
        description={
          credits.unlimitedUntil
            ? `Unlimited analyses until ${credits.unlimitedUntil.toLocaleDateString("en", { month: "long", day: "numeric" })}.`
            : `You have ${credits.remaining} ${credits.remaining === 1 ? "analysis" : "analyses"} left.`
        }
      />
      <div className="container-page py-10">
        {rows.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed p-10 text-center">
            <ScanFace className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 text-2xl">No reports yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your analyses will appear here so you can track changes over time.
            </p>
            <Button asChild className="mt-6">
              <Link href={routes.analyze}>Start your first analysis</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => {
              const preds = predictionsSchema.safeParse(r.predictions);
              const top = preds.success ? preds.data.slice(0, 3) : [];
              return (
                <li key={r.id}>
                  <Link
                    href={routes.analysis(r.id)}
                    className="group block h-full rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-muted-foreground" dateTime={r.created_at.toISOString()}>
                        {r.created_at.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                      {r.source === "sample" && <Badge variant="secondary">Demo</Badge>}
                    </div>
                    <p className="mt-3 font-serif text-xl">{top[0] ? conditionName(top[0].label) : "Report"}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {top.slice(1).map((p) => (
                        <Badge key={p.label} variant="outline" className="font-normal">
                          {conditionName(p.label)} · {BAND_COPY[confidenceBand(p.confidence)].label}
                        </Badge>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open report <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
