import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-10 w-2/3" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    </div>
  );
}
