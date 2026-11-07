import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of service",
  description: "The terms for using FaceInsight AI.",
  path: "/terms",
});

const sections = [
  {
    h: "Not medical advice",
    p: "FaceInsight AI provides educational, AI-generated information about visible skin concerns. It is not a medical device, does not diagnose or treat any condition, and is not a substitute for a qualified dermatologist. Always seek professional advice for medical concerns.",
  },
  {
    h: "Acceptable use",
    p: "Only upload photos of yourself, or of someone who has given you permission. Don't upload images of minors, attempt to overload or reverse-engineer the service, or use it for unlawful purposes.",
  },
  {
    h: "Accounts and passes",
    p: "Free accounts include a fixed number of analyses. Paid passes grant additional analyses for a limited period from the time of purchase and are non-transferable. If a technical failure prevents an analysis, the credit is returned automatically.",
  },
  {
    h: "Refunds",
    p: "If a pass doesn't work as described, contact us within 7 days of purchase and we'll make it right.",
  },
  {
    h: "Liability",
    p: "The service is provided “as is”. Results may be inaccurate. To the extent permitted by law, we are not liable for decisions made based on the information provided.",
  },
  {
    h: "Changes",
    p: "We may update these terms. Continued use after changes means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <div className="container-page max-w-3xl space-y-10 py-14">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-2xl font-medium">{s.h}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">Last updated: November 2026</p>
      </div>
    </>
  );
}
