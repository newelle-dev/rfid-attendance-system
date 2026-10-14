/**
 * Admin Portal Route Loading Skeleton
 * Rendered natively by Next.js App Router streaming during route transitions.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading page content">
      {/* Tier 1: PageHeader Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-0.5">
        <div className="h-4 w-44 bg-muted rounded" />
        <div className="h-7 w-32 bg-muted rounded-full" />
      </div>

      {/* Tier 2: Command Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-7 w-56 bg-muted rounded" />
          <div className="h-3.5 w-72 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Tier 3: KPI Metrics Strip Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="h-20 bg-muted/60 border border-border/80 rounded-lg p-4 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
        <div className="h-20 bg-muted/60 border border-border/80 rounded-lg p-4 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
        <div className="h-20 bg-muted/60 border border-border/80 rounded-lg p-4 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
        <div className="h-20 bg-muted/60 border border-border/80 rounded-lg p-4 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
      </div>

      {/* Tier 4: Workspace Card Skeleton */}
      <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-28 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded" />
          </div>
        </div>
        <div className="h-64 rounded-md bg-muted/40 border border-border/60" />
      </div>
    </div>
  );
}
