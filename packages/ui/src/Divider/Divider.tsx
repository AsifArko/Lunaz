import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  ...props
}: DividerProps) {
  const spacings = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };
  const base =
    orientation === 'horizontal'
      ? 'w-full border-t border-gray-200'
      : 'h-full border-l border-gray-200';
  const cn = [base, spacings[spacing], className].filter(Boolean).join(' ');

  return <hr className={cn} {...props} />;
}
