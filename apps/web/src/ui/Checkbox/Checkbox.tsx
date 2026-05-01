import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Checkbox({
  label,
  description,
  error,
  size = 'md',
  id,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s/g, '-');
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  const base =
    'rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 cursor-pointer';
  const state = error ? 'border-red-500' : '';
  const cn = [base, state, sizes[size], className].filter(Boolean).join(' ');

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input id={checkboxId} type="checkbox" className={cn} {...props} />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={checkboxId} className="font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-gray-500">{description}</p>}
          {error && <p className="text-red-600 mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
