import AnalyzeFlow from "@/components/analyze/AnalyzeFlow";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Analyze your skin",
  description: "Upload or take a selfie and get an AI skin report with a personalised routine in seconds.",
  path: "/analyze",
});

export default function AnalyzePage() {
  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">Skin analysis</p>
        <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Let’s take a look</h1>
        <p className="mt-2 text-muted-foreground">One clear, front-facing photo is all it takes.</p>
      </div>
      <AnalyzeFlow />
    </div>
  );
}
