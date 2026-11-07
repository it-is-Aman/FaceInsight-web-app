export type PlanId = "free" | "2days" | "7days";
export type PaidPlanId = Exclude<PlanId, "free">;

export interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  tagline: string;
  /** Number of analyses included. `null` = unlimited during the pass. */
  analyses: number | null;
  durationDays: number | null;
  features: string[];
  highlighted?: boolean;
}

/** Unlimited passes are stored with a large numeric limit so credit maths stays uniform. */
export const UNLIMITED_LIMIT = 1_000_000;

/** Signed-out visitors get this many real analyses per 24h before being asked to sign in. */
export const GUEST_DAILY_LIMIT = 1;

/** Chat questions allowed per analysis (keeps Gemini usage bounded). */
export const CHAT_LIMIT_PER_ANALYSIS = 20;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    tagline: "Included with every account",
    analyses: 10,
    durationDays: null,
    features: ["10 skin analyses", "AI care routine for each analysis", "Ask follow-up questions", "Analysis history"],
  },
  "2days": {
    id: "2days",
    name: "2-Day Pass",
    priceLabel: "$4",
    tagline: "For a quick deep-dive",
    analyses: 50,
    durationDays: 2,
    features: ["50 analyses within 48 hours", "Everything in Free", "Compare different lighting and angles"],
  },
  "7days": {
    id: "7days",
    name: "7-Day Pass",
    priceLabel: "$7",
    tagline: "Track a new routine for a week",
    analyses: null,
    durationDays: 7,
    features: ["Unlimited analyses for 7 days", "Everything in Free", "Best for tracking progress"],
    highlighted: true,
  },
};

export const PAID_PLANS = [PLANS["2days"], PLANS["7days"]];

export function isPaidPlan(id: unknown): id is PaidPlanId {
  return id === "2days" || id === "7days";
}
