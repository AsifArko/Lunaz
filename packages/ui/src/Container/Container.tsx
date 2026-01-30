import type { HTMLAttributes } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Container({
  maxWidth = 'xl',
  className = '',
  children,
  ...props
}: ContainerProps) {
  const widths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  };
  const cn = ['mx-auto px-4 sm:px-6 lg:px-8', widths[maxWidth], className].filter(Boolean).join(' ');

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
}
