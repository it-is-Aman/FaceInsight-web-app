"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export interface Credits {
  remaining: number;
  unlimitedUntil: string | null;
  nextExpiry: string | null;
}

const EVENT = "faceinsight:credits-changed";

/** Call after anything that changes the balance (analysis, purchase) so every badge refreshes. */
export function notifyCreditsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

async function fetchCredits(): Promise<Credits | null> {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    return res.ok ? (await res.json()).credits : null;
  } catch {
    return null;
  }
}

export function useCredits() {
  const { isSignedIn } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    const refresh = () => void fetchCredits().then((c) => active && setCredits(c));
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(EVENT, refresh);
    };
  }, [isSignedIn]);

  return { credits: isSignedIn ? credits : null };
}

export function formatCredits(c: Credits): string {
  if (c.unlimitedUntil) {
    return `Unlimited until ${new Date(c.unlimitedUntil).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return `${c.remaining} ${c.remaining === 1 ? "analysis" : "analyses"} left`;
}
