import { GlassyContainer } from '@/components/ui/glassy-edge';
import { MetricCardSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      {/* Key Metrics Skeletons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassyContainer key={i}>
            <MetricCardSkeleton />
          </GlassyContainer>
        ))}
      </div>

      {/* Quick Actions Skeletons */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassyContainer key={i} className="overflow-hidden">
            <MetricCardSkeleton />
          </GlassyContainer>
        ))}
      </div>

      {/* Recent Activity & Tasks Skeletons */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <GlassyContainer key={i} className="overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-5 bg-muted/30 rounded animate-pulse w-32" />
                  <div className="h-4 bg-muted/30 rounded animate-pulse w-48" />
                </div>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 py-2">
                    <div className="h-8 w-8 bg-muted/30 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted/30 rounded animate-pulse w-40" />
                      <div className="h-3 bg-muted/30 rounded animate-pulse w-32" />
                    </div>
                    <div className="h-6 w-16 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </GlassyContainer>
        ))}
      </div>

      {/* Revenue Chart Skeleton */}
      <GlassyContainer className="overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 bg-muted/30 rounded animate-pulse w-32" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-48" />
            </div>
            <div className="h-64 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
      </GlassyContainer>
    </div>
  );
}