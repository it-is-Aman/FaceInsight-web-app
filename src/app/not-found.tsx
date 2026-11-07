import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-medium">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The link may be broken, or the report belongs to a different account.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/analyze">Analyze my skin</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
