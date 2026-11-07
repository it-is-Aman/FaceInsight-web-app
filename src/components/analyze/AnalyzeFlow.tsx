"use client";

import { useClerk } from "@clerk/nextjs";
import {
  AlertCircle,
  Camera,
  Check,
  ImageUp,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { notifyCreditsChanged } from "@/hooks/use-credits";
import { readApiError, type ApiErrorBody } from "@/lib/api";
import {
  ACCEPTED_TYPES,
  MAX_INPUT_BYTES,
  checkQuality,
  compressForUpload,
  makeThumbnail,
  saveThumbnail,
} from "@/lib/image-client";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { TryDemoButton } from "./TryDemoButton";

type Phase = "pick" | "preview" | "analyzing";
type FlowError = ApiErrorBody["error"];

const STAGES = ["Preparing your photo", "Finding your face", "Analysing skin", "Building your report"];
const SLOW_AFTER_MS = 9_000;

export default function AnalyzeFlow() {
  const router = useRouter();
  const { openSignUp } = useClerk();
  const [phase, setPhase] = useState<Phase>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<FlowError | null>(null);
  const [stage, setStage] = useState(0);
  const [slow, setSlow] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);

  // Start waking the model as soon as the page opens; free hosts sleep when idle.
  useEffect(() => {
    void fetch("/api/ml/wake").catch(() => {});
  }, []);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const accept = useCallback(async (f: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError({ code: "UNSUPPORTED_TYPE", message: "Please choose a JPG, PNG or WebP photo." });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhase("preview");
    try {
      setWarnings((await checkQuality(f)).warnings);
    } catch {
      setWarnings([]);
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length) {
        const tooBig = rejected[0].errors.some((e) => e.code === "file-too-large");
        setError({
          code: tooBig ? "FILE_TOO_LARGE" : "UNSUPPORTED_TYPE",
          message: tooBig ? "That file is over 20 MB." : "Please choose a JPG, PNG or WebP photo.",
        });
        return;
      }
      if (accepted[0]) void accept(accepted[0]);
    },
    [accept],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: MAX_INPUT_BYTES,
    multiple: false,
    noClick: phase !== "pick",
    noKeyboard: phase !== "pick",
  });

  function reset() {
    setPhase("pick");
    setFile(null);
    setPreview(null);
    setWarnings([]);
    setError(null);
  }

  async function analyze() {
    if (!file) return;
    setError(null);
    setPhase("analyzing");
    setStage(0);
    setSlow(false);
    const timers = [
      setTimeout(() => setStage(1), 900),
      setTimeout(() => setStage(2), 2200),
      setTimeout(() => setSlow(true), SLOW_AFTER_MS),
    ];

    try {
      const compressed = await compressForUpload(file);
      const thumbnail = await makeThumbnail(compressed).catch(() => null);

      const form = new FormData();
      form.append("file", compressed, "photo.jpg");
      const res = await fetch("/api/analyses", { method: "POST", body: form });
      if (!res.ok) throw await readApiError(res);

      const { id } = (await res.json()) as { id: string };
      setStage(3);
      if (thumbnail) saveThumbnail(id, thumbnail);
      notifyCreditsChanged();
      router.push(routes.analysis(id));
    } catch (e) {
      const err: FlowError =
        e && typeof e === "object" && "code" in e
          ? (e as FlowError)
          : { code: "INTERNAL", message: "Network problem. Check your connection and try again." };
      setError(err);
      setPhase("preview");
      if (err.code === "SIGN_IN_REQUIRED") openSignUp({ forceRedirectUrl: routes.analyze });
    } finally {
      timers.forEach(clearTimeout);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "relative overflow-hidden rounded-3xl border-2 border-dashed bg-card transition-colors",
            phase === "pick" && "cursor-pointer hover:border-primary/60 hover:bg-primary/[0.03]",
            isDragActive && "border-primary bg-primary/5",
            phase !== "pick" && "border-solid",
          )}
        >
          <input {...getInputProps()} aria-label="Upload a photo" />

          {phase === "pick" ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-5 p-8 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ImageUp className="size-7" />
              </span>
              <div>
                <p className="font-serif text-2xl">{isDragActive ? "Drop it here" : "Add a selfie"}</p>
                <p className="mt-1 text-sm text-muted-foreground">Drag & drop, or choose a photo. JPG, PNG or WebP.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button onClick={open}>
                  <ImageUp /> Choose photo
                </Button>
                <Button variant="outline" onClick={() => cameraInput.current?.click()}>
                  <Camera /> Take a selfie
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[4/3] bg-muted">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL
                <img src={preview} alt="Your selected photo" className="size-full object-contain" />
              )}
              {/* face guide */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]"
              />
              {phase === "analyzing" && (
                <div aria-hidden className="absolute inset-0 overflow-hidden [--scan-h:100cqh] [container-type:size]">
                  <div className="animate-scan h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_24px_4px] shadow-primary/60" />
                </div>
              )}
              {phase === "preview" && (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={reset}
                  className="absolute right-3 top-3 rounded-full"
                  aria-label="Remove photo"
                >
                  <X />
                </Button>
              )}
            </div>
          )}
        </div>

        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void accept(f);
            e.target.value = "";
          }}
        />

        {error && <ErrorAlert error={error} onRetry={analyze} onReset={reset} />}

        {phase === "preview" && warnings.length > 0 && !error && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {phase === "preview" && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={analyze}>
              <Sparkles /> Analyze photo
            </Button>
            <Button size="lg" variant="outline" onClick={reset}>
              Choose another
            </Button>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="rounded-2xl border bg-card p-5" aria-live="polite">
            <ol className="space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  {i < stage ? (
                    <Check className="size-4 text-success" />
                  ) : i === stage ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="size-4 rounded-full border" />
                  )}
                  <span className={cn(i > stage && "text-muted-foreground")}>{s}</span>
                </li>
              ))}
            </ol>
            {slow && (
              <p className="mt-4 rounded-lg bg-accent/60 p-3 text-sm text-accent-foreground">
                Waking up the model. The first analysis after a quiet period can take up to a minute. Thanks for your patience.
              </p>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="font-sans text-base font-semibold">For the best results</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "Face the camera straight on, filling most of the frame",
              "Soft natural light: face a window, avoid flash",
              "Remove glasses, heavy makeup and beauty filters",
              "Pull hair away from your forehead",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border bg-muted/40 p-6">
          <h2 className="font-sans text-base font-semibold">Not ready to upload?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Open a full sample report. It’s free and needs no photo.</p>
          <TryDemoButton className="mt-4 w-full" />
        </div>
        <p className="px-2 text-xs leading-relaxed text-muted-foreground">
          Your photo is compressed on this device, analysed in memory and never stored. FaceInsight is not a medical
          device; see a dermatologist for diagnosis or treatment.
        </p>
      </aside>
    </div>
  );
}

function ErrorAlert({ error, onRetry, onReset }: { error: FlowError; onRetry: () => void; onReset: () => void }) {
  const { openSignUp } = useClerk();
  const actions: Record<string, React.ReactNode> = {
    NO_FACE: <Button size="sm" variant="outline" onClick={onReset}>Try a different photo</Button>,
    INVALID_IMAGE: <Button size="sm" variant="outline" onClick={onReset}>Choose another photo</Button>,
    UNSUPPORTED_TYPE: <Button size="sm" variant="outline" onClick={onReset}>Choose another photo</Button>,
    ML_UNAVAILABLE: <Button size="sm" onClick={onRetry}><RefreshCw /> Try again</Button>,
    AI_UNAVAILABLE: <Button size="sm" onClick={onRetry}><RefreshCw /> Try again</Button>,
    INTERNAL: <Button size="sm" onClick={onRetry}><RefreshCw /> Try again</Button>,
    NO_CREDITS: <Button size="sm" asChild><Link href={routes.pricing}>See passes</Link></Button>,
    DAILY_LIMIT: <Button size="sm" variant="outline" asChild><Link href={routes.history}>View your reports</Link></Button>,
    SIGN_IN_REQUIRED: (
      <Button size="sm" onClick={() => openSignUp({ forceRedirectUrl: routes.analyze })}>
        Create free account
      </Button>
    ),
  };
  const titles: Record<string, string> = {
    NO_FACE: "We couldn't find a face",
    SIGN_IN_REQUIRED: "You've used your free check",
    NO_CREDITS: "Out of analyses",
    DAILY_LIMIT: "Daily limit reached",
    ML_UNAVAILABLE: "The model is starting up",
  };
  return (
    <Alert variant={["SIGN_IN_REQUIRED", "NO_CREDITS", "DAILY_LIMIT"].includes(error.code) ? "default" : "destructive"}>
      <AlertCircle />
      <AlertTitle>{titles[error.code] ?? "Something went wrong"}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {actions[error.code] && <div className="mt-3">{actions[error.code]}</div>}
      </AlertDescription>
    </Alert>
  );
}
