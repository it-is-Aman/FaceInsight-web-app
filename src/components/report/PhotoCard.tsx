"use client";

import { EyeOff, ScanFace } from "lucide-react";
import { useSyncExternalStore } from "react";
import { loadThumbnail } from "@/lib/image-client";

const subscribe = () => () => {};

export function PhotoCard({
  analysisId,
  sampleImage,
  faceConfidence,
}: {
  analysisId: string;
  sampleImage: string | null;
  faceConfidence: number | null;
}) {
  // Read sessionStorage only on the client, without a hydration mismatch.
  const local = useSyncExternalStore(
    subscribe,
    () => loadThumbnail(analysisId),
    () => null,
  );
  const src = sampleImage ?? local;

  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <div className="relative aspect-square bg-muted">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL or local sample
          <img src={src} alt="Analysed photo" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <EyeOff className="size-6" />
            <p className="text-sm">Photo not stored</p>
            <p className="text-xs">For your privacy we only keep the results.</p>
          </div>
        )}
      </div>
      {faceConfidence !== null && (
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <ScanFace className="size-4 text-primary" />
          Face detected ({Math.round(faceConfidence * 100)}% confidence)
          {!sampleImage && local && <span className="ml-auto">Visible on this device only</span>}
        </div>
      )}
    </div>
  );
}
