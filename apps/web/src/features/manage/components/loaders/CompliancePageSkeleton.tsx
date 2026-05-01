import { ManageSkeleton } from './ManageSkeleton';
import { StatCardSkeleton } from './StatCardSkeleton';

/**
 * Compliance page skeleton - header + stat cards grid.
 * Preserves Compliance Dashboard layout.
 */
export function CompliancePageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <ManageSkeleton variant="text" height={28} width={280} />
        <ManageSkeleton variant="text" height={16} width={320} className="mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <ManageSkeleton variant="text" height={18} width={160} />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <ManageSkeleton key={j} variant="text" height={14} width={j === 4 ? '70%' : '100%'} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <ManageSkeleton variant="text" height={18} width={140} />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <ManageSkeleton key={j} variant="text" height={14} width={j === 3 ? '60%' : '100%'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
