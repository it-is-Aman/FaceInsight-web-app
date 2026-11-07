import { Check, PartyPopper } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PAID_PLANS, PLANS, type Plan } from "@/lib/plans";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Pricing",
  description: "Start free. Get 10 analyses with a free account, or a short pass for more.",
  path: "/pricing",
});

function PlanCard({ plan, action }: { plan: Plan; action: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-7",
        plan.highlighted && "border-primary shadow-xl shadow-primary/10",
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most popular
        </span>
      )}
      <h2 className="font-sans text-lg font-semibold">{plan.name}</h2>
      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
      <p className="mt-6 font-serif text-5xl">
        {plan.priceLabel}
        <span className="ml-1 font-sans text-base text-muted-foreground">
          {plan.durationDays ? "one-time" : "forever"}
        </span>
      </p>
      <ul className="my-7 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
      {action}
    </div>
  );
}

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const { checkout } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Start free. Pay only if you want more."
        description="No subscriptions. Passes are one-time purchases that never auto-renew."
      />
      <div className="container-page py-14">
        {checkout === "success" && (
          <Alert className="mb-10 border-success/40 bg-success/10">
            <PartyPopper />
            <AlertTitle>Payment received, thank you!</AlertTitle>
            <AlertDescription>
              Your pass will appear in your balance within a few seconds.{" "}
              <Link href={routes.analyze} className="font-medium underline">
                Start analysing
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          <PlanCard
            plan={PLANS.free}
            action={
              <Button asChild variant="secondary" className="w-full">
                <Link href={routes.analyze}>Start free</Link>
              </Button>
            }
          />
          {PAID_PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              action={<CheckoutButton plan={p.id as "2days" | "7days"} highlighted={p.highlighted} />}
            />
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Secure checkout by Dodo Payments. If an analysis fails on our side, the credit is returned automatically.
        </p>
      </div>
    </>
  );
}
