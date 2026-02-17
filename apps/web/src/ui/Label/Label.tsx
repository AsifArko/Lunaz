import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Label({ required, size = 'md', className = '', children, ...props }: LabelProps) {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  const cn = ['block font-medium text-gray-700 mb-1', sizes[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cn} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
