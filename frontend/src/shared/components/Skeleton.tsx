interface SkeletonProps {
  cantidad?: number;
  className?: string;
}

export function Skeleton({ cantidad = 6, className = "h-64" }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-xl border border-slate-200 bg-slate-200/70 ${className}`}
        />
      ))}
    </div>
  );
}