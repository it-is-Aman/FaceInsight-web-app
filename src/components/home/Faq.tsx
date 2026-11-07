import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FREE_ACCOUNT_OFFER, PAYMENTS_ENABLED } from "@/lib/plans";
import { faqSchema, jsonLd } from "@/lib/seo";

export const FAQS = [
  {
    q: "Is this a medical diagnosis?",
    a: "No. FaceInsight is an educational tool. It highlights visible concerns and suggests general skincare. For anything painful, changing or persistent, please see a dermatologist.",
  },
  {
    q: "Do you store my photo?",
    a: "No. Your photo is compressed on your device, sent over HTTPS, analysed in memory and discarded. We only keep the result (labels and confidence scores) so you can revisit your report.",
  },
  {
    q: "How accurate is it?",
    a: "The model is a ResNet-50 trained on 15 facial skin concerns. Lighting, angle, makeup and filters all affect results, which is why we show confidence levels (Likely / Possible / Low signal) instead of a single verdict.",
  },
  {
    q: "What does it cost?",
    a: PAYMENTS_ENABLED
      ? "Your first analysis needs no account. A free account adds 10 analyses plus follow-up questions. Short passes are available if you want to track changes more often."
      : `It's free. Your first analysis needs no account, and a free account gives you ${FREE_ACCOUNT_OFFER} plus follow-up questions.`,
  },
  {
    q: "What makes a good photo?",
    a: "Face the camera in soft natural light, remove glasses and heavy makeup, keep your hair off your face, and don't use beauty filters.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(FAQS))} />
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl">Good questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
