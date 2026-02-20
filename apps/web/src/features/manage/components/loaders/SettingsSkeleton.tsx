import { ManageSkeleton } from './ManageSkeleton';

/**
 * Settings form skeleton - mimics the layout of settings tabs.
 * Preserves structure so tabs + content area don't shift.
 */
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form sections - mimic SettingsSection layout */}
      <div className="space-y-4">
        <ManageSkeleton variant="text" height={20} width="40%" className="mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <ManageSkeleton variant="text" height={14} width={120} />
              <ManageSkeleton variant="rectangular" height={40} width="100%" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <ManageSkeleton variant="text" height={20} width="35%" className="mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <ManageSkeleton variant="text" height={14} width={180} />
              <ManageSkeleton
                variant="rectangular"
                height={24}
                width={44}
                className="rounded-full"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <ManageSkeleton variant="rectangular" height={40} width={120} />
      </div>
    </div>
  );
}
