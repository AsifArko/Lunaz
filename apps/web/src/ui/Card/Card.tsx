import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  const cn = ['bg-white rounded-lg shadow border border-gray-200', paddings[padding], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
}
