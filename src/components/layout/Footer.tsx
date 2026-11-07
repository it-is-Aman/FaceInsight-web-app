import Link from "next/link";
import { PAYMENTS_ENABLED } from "@/lib/plans";
import { routes } from "@/lib/routes";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Analyze", href: routes.analyze },
      { label: "Skin concerns", href: routes.conditions },
      ...(PAYMENTS_ENABLED ? [{ label: "Pricing", href: routes.pricing }] : []),
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: routes.about },
      { label: "Privacy", href: routes.privacy },
      { label: "Terms", href: routes.terms },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            AI-assisted skin insights from a single selfie. Your photo is analysed in memory and never stored.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 font-sans text-sm font-semibold">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FaceInsight AI. Not a medical device and not a substitute for a dermatologist.</p>
          <p>
            Built by{" "}
            <a href="https://github.com/it-is-Aman" className="underline-offset-4 hover:underline">
              Aman
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
