import { ManageSkeleton } from './ManageSkeleton';

interface TableSkeletonProps {
  /** Number of columns (default: 6) */
  columns?: number;
  /** Number of rows (default: 8) */
  rows?: number;
  /** Show thumbnail column (for products) */
  withThumbnail?: boolean;
  /** Extra class for the table container */
  className?: string;
}

/**
 * Table skeleton that preserves the exact layout of data tables.
 * Keeps header + body structure so layout doesn't shift.
 */
export function TableSkeleton({
  columns = 6,
  rows = 8,
  withThumbnail = false,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {withThumbnail && (
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-12" />
              )}
              {Array.from({ length: columns }).map((_, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                />
              ))}
              <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-transparent">
                {withThumbnail && (
                  <td className="px-4 py-2">
                    <ManageSkeleton
                      variant="rectangular"
                      width={28}
                      height={28}
                      className="rounded"
                    />
                  </td>
                )}
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2.5">
                    <ManageSkeleton
                      variant="text"
                      height={14}
                      width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '90%'}
                    />
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right">
                  <ManageSkeleton
                    variant="rectangular"
                    width={24}
                    height={24}
                    className="rounded ml-auto"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
