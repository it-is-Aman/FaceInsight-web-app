"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";

function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;
    const qs = searchParams.toString();
    posthog.capture("$pageview", { $current_url: window.origin + pathname + (qs ? `?${qs}` : "") });
  }, [pathname, searchParams, posthog]);

  return null;
}

export default function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageView />
    </Suspense>
  );
}
