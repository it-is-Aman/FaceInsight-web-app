import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10 9.5h-1.5a1 1 0 0 0-1 1V12M22 9.5h1.5a1 1 0 0 1 1 1V12M10 22.5h-1.5a1 1 0 0 1-1-1V20M22 22.5h1.5a1 1 0 0 0 1-1V20"
        className="stroke-primary-foreground"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="16" r="3.2" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 font-serif text-lg font-medium", className)}>
      <LogoMark />
      <span>
        FaceInsight <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
