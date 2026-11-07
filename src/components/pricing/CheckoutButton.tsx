"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { readApiError } from "@/lib/api";
import type { PaidPlanId } from "@/lib/plans";

export function CheckoutButton({ plan, highlighted }: { plan: PaidPlanId; highlighted?: boolean }) {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const variant = highlighted ? "default" : "outline";

  if (!isSignedIn) {
    return (
      <SignUpButton mode="modal" forceRedirectUrl="/pricing">
        <Button variant={variant} className="w-full">
          Sign up to buy
        </Button>
      </SignUpButton>
    );
  }

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error((await readApiError(res)).message);
      window.location.assign((await res.json()).url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start checkout.");
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} className="w-full" onClick={checkout} disabled={loading}>
      {loading && <Loader2 className="animate-spin" />}
      Get pass
    </Button>
  );
}
