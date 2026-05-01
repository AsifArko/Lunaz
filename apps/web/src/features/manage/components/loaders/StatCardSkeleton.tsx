import { ManageSkeleton } from './ManageSkeleton';

/**
 * Stat card skeleton - matches Dashboard/Reports stat card layout.
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <ManageSkeleton variant="text" height={12} width={80} />
          <ManageSkeleton variant="text" height={28} width={100} />
        </div>
        <ManageSkeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
      </div>
    </div>
  );
}
