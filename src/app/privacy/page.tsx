import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata, siteConfig } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What FaceInsight AI collects, why, and how long it's kept. Photos are never stored.",
  path: "/privacy",
});

const sections = [
  {
    h: "Your photos",
    p: [
      "Photos are compressed in your browser, sent over HTTPS to our analysis service, processed in memory, and discarded immediately. They are never written to disk or a database.",
      "To show your photo on the report page, a small thumbnail is kept in your browser's session storage on your device only. It disappears when you close the tab.",
    ],
  },
  {
    h: "What we store",
    p: [
      "Analysis results: the detected concern labels, confidence scores, and the AI-generated care guide, so you can revisit your report.",
      "Account details from our sign-in provider (Clerk): your user id, email and name.",
      "Follow-up questions you ask and the assistant's answers, linked to the analysis.",
      "For visitors without an account: a random anonymous id in a cookie, and a salted one-way hash of your IP address used only to enforce the free-analysis limit. We never store raw IP addresses.",
    ],
  },
  {
    h: "Service providers",
    p: [
      "Clerk (authentication), Neon (database), Hugging Face (model hosting), Google Gemini (care guide and chat; receives only concern labels and your questions, never your photo), Dodo Payments (checkout), Vercel, PostHog and Google Analytics (hosting and anonymous usage analytics).",
    ],
  },
  {
    h: "Your choices",
    p: [
      "You can delete your account at any time from your account menu. This deletes your analyses and chat history.",
      `Questions? Contact ${siteConfig.contactEmail}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="Short version: we never store your photos, and we keep only what's needed to show your reports."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <div className="container-page max-w-3xl space-y-10 py-14">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-2xl font-medium">{s.h}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              {s.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">Last updated: November 2026</p>
      </div>
    </>
  );
}
