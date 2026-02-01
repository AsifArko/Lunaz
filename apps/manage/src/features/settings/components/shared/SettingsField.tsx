import type { ReactNode } from 'react';

interface SettingsFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  horizontal?: boolean;
  labelWidth?: 'sm' | 'md' | 'lg';
}

const labelWidthClasses = {
  sm: 'w-1/4',
  md: 'w-1/3',
  lg: 'w-1/2',
};

export function SettingsField({
  label,
  description,
  error,
  required = false,
  children,
  horizontal = true,
  labelWidth = 'md',
}: SettingsFieldProps) {
  if (horizontal) {
    return (
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="text-sm text-gray-600 pt-2">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="col-span-2">
          {children}
          {description && !error && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {description && !error && <p className="text-xs text-gray-400">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
