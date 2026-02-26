import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-brand-200 rounded-lg",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[var(--shadow-card-soft)]">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3 mt-1" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
  );
}
