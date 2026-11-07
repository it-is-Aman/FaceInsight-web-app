import "server-only";
import DodoPayments from "dodopayments";
import { env } from "@/lib/env";
import type { PaidPlanId } from "@/lib/plans";

let client: DodoPayments | undefined;

export function dodo() {
  const e = env();
  client ??= new DodoPayments({
    bearerToken: e.DODO_PAYMENTS_API_KEY,
    webhookKey: e.DODO_PAYMENTS_WEBHOOK_KEY,
    environment: e.DODO_PAYMENTS_ENVIRONMENT,
  });
  return client;
}

export function productIdFor(plan: PaidPlanId): string {
  const e = env();
  return plan === "2days" ? e.DODO_PAYMENTS_PRODUCT_ID_2DAYS : e.DODO_PAYMENTS_PRODUCT_ID_7DAYS;
}
