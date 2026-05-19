import { Skeleton } from "@/components/Skeleton";

// Shown automatically while any (app) route's server data loads.
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* TopBar placeholder */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Header / hero number */}
      <div className="px-4 pb-2 pt-5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="mt-3 h-9 w-44" />
      </div>

      {/* Three cards */}
      <div className="space-y-3 px-4 pt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2.5 h-7 w-32" />
                <Skeleton className="mt-2 h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-3 w-36" />
          </div>
        ))}
      </div>

      {/* List rows */}
      <div className="mt-6 space-y-3 px-4">
        <Skeleton className="h-4 w-28" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1.5 h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
