import { ArrowRight, CircleCheck, Eye, Sprout, Stethoscope } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, CONDITIONS, getConditionBySlug } from "@/lib/conditions";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONDITIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/conditions/[slug]">) {
  const c = getConditionBySlug((await params).slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name}: causes & what helps`,
    description: c.summary,
    path: routes.condition(c.slug),
  });
}

export default async function ConditionPage({ params }: PageProps<"/conditions/[slug]">) {
  const c = getConditionBySlug((await params).slug);
  if (!c) notFound();

  const related = CONDITIONS.filter((x) => x.category === c.category && x.slug !== c.slug);
  const blocks = [
    { icon: Eye, title: "Signs", items: c.signs },
    { icon: Sprout, title: "Common causes", items: c.causes },
    { icon: CircleCheck, title: "What helps", items: c.care },
  ];

  return (
    <>
      <PageHeader
        eyebrow={CATEGORY_LABELS[c.category]}
        title={c.name}
        description={c.summary}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Skin concerns", path: routes.conditions },
          { name: c.name, path: routes.condition(c.slug) },
        ]}
      />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {blocks.map((b) => (
            <section key={b.title} className="rounded-3xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                <b.icon className="size-5 text-primary" /> {b.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {b.items.map((i) => (
                  <li key={i} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className="flex gap-3 rounded-3xl border border-warning/40 bg-warning/10 p-6">
            <Stethoscope className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-sans text-lg font-semibold">When to see a dermatologist</h2>
              <p className="mt-1 text-muted-foreground">{c.seeADoctor}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <h2 className="font-serif text-2xl">Wondering if this applies to you?</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">Get a free AI skin check from one selfie.</p>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link href={routes.analyze}>
                Analyze my skin <ArrowRight />
              </Link>
            </Button>
          </div>
          {related.length > 0 && (
            <div className="rounded-3xl border bg-card p-6">
              <h2 className="font-sans text-sm font-semibold">Related concerns</h2>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={routes.condition(r.slug)} className="text-sm text-primary hover:underline">
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
