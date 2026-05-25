import { Skeleton } from "@/components/Skeleton";

// Shown automatically while any (app) route's server data loads.
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-8">
        <Skeleton className="h-5 w-28 lg:hidden" />
        <div className="hidden lg:block" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8">
        <div className="px-4 pb-2 pt-5 lg:px-0 lg:pt-8">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="mt-3 h-9 w-44 lg:h-12 lg:w-64" />
        </div>

        <div className="grid gap-3 px-4 pt-4 lg:grid-cols-3 lg:px-0 lg:pt-6">
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

        <div className="mt-6 grid gap-4 lg:grid-cols-5 lg:gap-6">
          <div className="mx-4 rounded-2xl border border-border bg-surface p-4 shadow-card lg:col-span-2 lg:mx-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-32 w-full" />
          </div>
          <div className="space-y-3 px-4 lg:col-span-3 lg:px-0">
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
      </div>
    </div>
  );
}
