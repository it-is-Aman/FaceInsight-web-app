import type { Route } from "next";
import Link from "next/link";
import { breadcrumbSchema, jsonLd } from "@/lib/seo";

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: { name: string; path: string }[];
}) {
  return (
    <header className="border-b bg-muted/30">
      {crumbs && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(crumbs))} />}
      <div className="container-page py-12 md:py-16">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex items-center gap-2">
                  {i < crumbs.length - 1 ? (
                    <>
                      <Link href={c.path as Route} className="hover:text-foreground">
                        {c.name}
                      </Link>
                      <span aria-hidden>/</span>
                    </>
                  ) : (
                    <span aria-current="page" className="text-foreground">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-4xl font-medium sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}
      </div>
    </header>
  );
}
