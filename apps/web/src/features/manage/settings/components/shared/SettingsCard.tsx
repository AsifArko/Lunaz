import type { ReactNode } from 'react';

interface SettingsCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'outlined';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClasses = {
  default: 'bg-white border border-gray-200',
  muted: 'bg-gray-50 border border-gray-100',
  outlined: 'bg-white border-2 border-gray-200',
};

export function SettingsCard({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}: SettingsCardProps) {
  return (
    <div
      className={`rounded-lg ${paddingClasses[padding]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
