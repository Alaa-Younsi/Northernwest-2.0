interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[#1a1a1a] rounded-sm ${className}`}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-0">
      <Skeleton className="h-56 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}
