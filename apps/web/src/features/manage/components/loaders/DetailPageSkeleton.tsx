import { ManageSkeleton } from './ManageSkeleton';

/**
 * Detail page skeleton (product form, order detail, customer detail, etc.).
 * Preserves the typical detail layout: header + main content area.
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb / back link area */}
      <div className="flex items-center gap-2">
        <ManageSkeleton variant="text" height={14} width={60} />
        <ManageSkeleton variant="text" height={14} width={12} />
        <ManageSkeleton variant="text" height={14} width={100} />
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <ManageSkeleton variant="text" height={24} width={200} />
            <ManageSkeleton variant="text" height={14} width={300} />
          </div>
          <ManageSkeleton variant="rectangular" height={36} width={100} />
        </div>

        {/* Form fields / content blocks */}
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <ManageSkeleton variant="text" height={14} width={100} />
              <ManageSkeleton variant="rectangular" height={40} width="100%" />
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <ManageSkeleton variant="rectangular" height={40} width={80} />
          <ManageSkeleton variant="rectangular" height={40} width={100} />
        </div>
      </div>
    </div>
  );
}
