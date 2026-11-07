import ConcernsGrid from "@/components/home/ConcernsGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Skin concerns guide",
  description:
    "Plain-language guides to 15 common facial skin concerns: what they are, why they happen, and what helps.",
  path: "/conditions",
});

export default function ConditionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Skin concerns, explained"
        description="The 15 concerns FaceInsight can recognise, with what causes them and what actually helps."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Skin concerns", path: "/conditions" },
        ]}
      />
      <ConcernsGrid heading={false} />
    </>
  );
}
