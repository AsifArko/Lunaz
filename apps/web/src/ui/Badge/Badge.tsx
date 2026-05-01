import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  const radius = pill ? 'rounded-full' : 'rounded';
  const cn = [
    'inline-flex items-center font-medium',
    variants[variant],
    sizes[size],
    radius,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cn} {...props}>
      {children}
    </span>
  );
}
