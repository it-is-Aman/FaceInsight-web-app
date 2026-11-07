"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { History, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCredits, useCredits } from "@/hooks/use-credits";
import { mainNav, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

function CreditsBadge() {
  const { credits } = useCredits();
  if (!credits) return null;
  return (
    <Link
      href={credits.mode === "daily" ? routes.history : routes.pricing}
      className="hidden items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary lg:flex"
    >
      <Sparkles className="size-3.5 text-primary" />
      {formatCredits(credits)}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/65">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Show when="signed-in">
            <Link
              href={routes.history}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(routes.history) && "text-foreground",
              )}
            >
              History
            </Link>
          </Show>
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <CreditsBadge />
          </Show>
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </SignInButton>
          </Show>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={routes.analyze}>Analyze my skin</Link>
          </Button>
          <Show when="signed-in">
            <UserButton />
          </Show>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive(item.href) && "bg-muted text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Show when="signed-in">
                  <Link
                    href={routes.history}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <History className="size-4" /> History
                  </Link>
                </Show>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href={routes.analyze}>Analyze my skin</Link>
                  </Button>
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <Button variant="outline">Sign in</Button>
                    </SignInButton>
                  </Show>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
