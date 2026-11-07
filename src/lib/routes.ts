import type { Route } from "next";
import { PAYMENTS_ENABLED } from "@/lib/plans";

export const routes = {
  home: "/",
  analyze: "/analyze",
  analysis: (id: string) => `/analysis/${id}` as Route,
  history: "/history",
  pricing: "/pricing",
  conditions: "/conditions",
  condition: (slug: string) => `/conditions/${slug}` as Route,
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  signIn: "/signin" as Route,
  signUp: "/signup" as Route,
} as const satisfies Record<string, Route | ((arg: string) => Route)>;

export const mainNav = [
  { label: "Analyze", href: routes.analyze },
  { label: "Skin concerns", href: routes.conditions },
  ...(PAYMENTS_ENABLED ? [{ label: "Pricing", href: routes.pricing }] : []),
  { label: "About", href: routes.about },
] as const;
