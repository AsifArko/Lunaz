import type { ReactNode } from 'react';

interface SettingsContentProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function SettingsContent({ children, isLoading = false }: SettingsContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return <div>{children}</div>;
}
