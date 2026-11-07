import { Camera, ListChecks, MessagesSquare } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Take or upload a selfie",
    body: "Front-facing, natural light, no filters. The photo is compressed on your device and analysed in memory.",
  },
  {
    icon: ListChecks,
    title: "Get your skin report",
    body: "A ResNet-50 model trained on 15 concerns highlights what stands out, with an honest confidence level for each.",
  },
  {
    icon: MessagesSquare,
    title: "Follow a routine, ask questions",
    body: "Gemini turns the results into a morning and evening routine. Ask follow-ups like “is this hormonal?”.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/30 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl">From selfie to routine in under a minute</h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border bg-card p-6">
              <span className="absolute right-6 top-6 font-serif text-5xl text-muted-foreground/20">{i + 1}</span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-sans text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
