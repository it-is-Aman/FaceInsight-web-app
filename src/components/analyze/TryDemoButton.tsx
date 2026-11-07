"use client";

import { Loader2, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { readApiError } from "@/lib/api";
import { routes } from "@/lib/routes";
import { SAMPLES } from "@/lib/samples";

export function TryDemoButton({
  sampleId = SAMPLES[0].id,
  label = "See a demo report",
  ...props
}: { sampleId?: string; label?: string } & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleId }),
      });
      if (!res.ok) throw new Error((await readApiError(res)).message);
      const { id } = (await res.json()) as { id: string };
      router.push(routes.analysis(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open the demo.");
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={run} disabled={loading} {...props}>
      {loading ? <Loader2 className="animate-spin" /> : <PlayCircle />}
      {label}
    </Button>
  );
}
