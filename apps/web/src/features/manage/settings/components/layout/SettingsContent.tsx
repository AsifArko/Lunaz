import type { ReactNode } from 'react';
import { SettingsSkeleton } from '@/features/manage/components/loaders';

interface SettingsContentProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function SettingsContent({ children, isLoading = false }: SettingsContentProps) {
  if (isLoading) {
    return (
      <div className="pt-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return <div>{children}</div>;
}
