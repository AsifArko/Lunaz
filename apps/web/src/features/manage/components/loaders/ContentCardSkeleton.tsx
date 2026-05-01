import { ManageSkeleton } from './ManageSkeleton';

/**
 * Content card skeleton - for compliance pages, authenticity, etc.
 * Preserves card layout with header + body.
 */
export function ContentCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <ManageSkeleton variant="text" height={18} width={180} />
        <ManageSkeleton variant="rectangular" height={32} width={100} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <ManageSkeleton
            key={i}
            variant="text"
            height={14}
            width={i === rows - 1 ? '70%' : '100%'}
          />
        ))}
      </div>
    </div>
  );
}
