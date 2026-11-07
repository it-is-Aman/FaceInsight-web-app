import { ArrowLeft, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/report/PrintButton";
import { ChatPanel } from "@/components/report/ChatPanel";
import { ConcernCard } from "@/components/report/ConcernCard";
import { InsightsPanel } from "@/components/report/InsightsPanel";
import { PhotoCard } from "@/components/report/PhotoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAnalysisForViewer,
  getChatMessages,
  parseInsights,
  parsePredictions,
} from "@/lib/analyses.server";
import { conditionName } from "@/lib/conditions";
import { CHAT_LIMIT_PER_ANALYSIS } from "@/lib/plans";
import { routes } from "@/lib/routes";
import { getSample } from "@/lib/samples";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Your skin report", robots: { index: false } };

export default async function AnalysisPage({ params }: PageProps<"/analysis/[id]">) {
  const { id } = await params;
  const viewer = await getViewer();
  const analysis = await getAnalysisForViewer(id, viewer);
  if (!analysis) notFound();

  const predictions = parsePredictions(analysis);
  const insights = parseInsights(analysis);
  const messages = viewer.userId ? await getChatMessages(id) : [];
  const sample = analysis.sample_id ? getSample(analysis.sample_id) : undefined;
  const date = analysis.created_at.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={viewer.userId ? routes.history : routes.analyze}>
            <ArrowLeft /> {viewer.userId ? "All reports" : "New analysis"}
          </Link>
        </Button>
        <div className="flex gap-2">
          <PrintButton />
          <Button asChild size="sm">
            <Link href={routes.analyze}>New analysis</Link>
          </Button>
        </div>
      </div>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">Skin report · {date}</p>
          {analysis.source === "sample" && <Badge variant="secondary">Demo</Badge>}
        </div>
        <h1 className="mt-2 text-3xl font-medium sm:text-4xl">
          Mostly <span className="text-primary">{conditionName(predictions[0].label).toLowerCase()}</span>
          {predictions[1] && predictions[1].confidence >= 0.2 ? (
            <>, with signs of {conditionName(predictions[1].label).toLowerCase()}</>
          ) : null}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PhotoCard
            analysisId={analysis.id}
            sampleImage={sample?.image ?? null}
            faceConfidence={analysis.face_confidence}
          />
          {predictions.map((p, i) => (
            <ConcernCard key={p.label} prediction={p} rank={i + 1} />
          ))}
          <p className="flex gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Educational insights, not a diagnosis. Lighting, angle and makeup affect results.
          </p>
        </div>

        <div className="space-y-6">
          <InsightsPanel analysisId={analysis.id} initial={insights} />
          <ChatPanel
            analysisId={analysis.id}
            initialMessages={messages}
            signedIn={Boolean(viewer.userId)}
            topConcern={conditionName(predictions[0].label)}
            limit={CHAT_LIMIT_PER_ANALYSIS}
          />
        </div>
      </div>
    </div>
  );
}
