import { ArrowRight, Brain, Cpu, Database, Lock, MessageSquareText, ScanFace } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description: "Why FaceInsight AI exists, how the skin model works, and how your privacy is protected.",
  path: "/about",
});

const pipeline = [
  {
    icon: ScanFace,
    title: "Face check",
    body: "OpenCV's YuNet detector confirms there is a clear, front-facing face before anything else runs.",
  },
  {
    icon: Brain,
    title: "Skin classifier",
    body: "A ResNet-50 fine-tuned with fastai on 15 facial skin concerns, exported to ONNX for fast CPU inference.",
  },
  {
    icon: MessageSquareText,
    title: "Care guide",
    body: "Google Gemini turns the top results into a structured routine and answers follow-up questions, with safety rules that keep it non-diagnostic.",
  },
];

const stack = [
  { icon: Cpu, label: "Inference", value: "ONNX Runtime · Gradio · Hugging Face Spaces" },
  { icon: Database, label: "App", value: "Next.js 16 · Prisma 7 · Postgres (Neon) · Clerk" },
  { icon: Lock, label: "Privacy", value: "Photos processed in memory, never written to disk" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Skin insights that are honest about what they are"
        description="FaceInsight started as a learning project: could a small, well-built model give people a useful first look at their skin, and point them to a professional when it matters?"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="container-page py-16">
        <h2 className="text-3xl font-medium">How an analysis works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {pipeline.map((p, i) => (
            <li key={p.title} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </span>
                <span className="text-sm text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/30">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-medium">What it is, and isn’t</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                FaceInsight is an educational tool. It recognises visual patterns associated with common concerns
                like dark circles, oily skin or blackheads. It can’t see beneath the surface, doesn’t know your
                history, and can be wrong, which is why every result shows its confidence.
              </p>
              <p>
                It is not a medical device and doesn’t diagnose disease. If something is painful, spreading,
                bleeding or changing, please see a dermatologist.
              </p>
            </div>
          </div>
          <ul className="space-y-3 self-start">
            {stack.map((s) => (
              <li key={s.label} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <s.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-sm text-muted-foreground">{s.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <h2 className="text-3xl font-medium">See it for yourself</h2>
        <Button asChild size="lg" className="mt-6">
          <Link href={routes.analyze}>
            Analyze my skin <ArrowRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
