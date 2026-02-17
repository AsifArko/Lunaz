import type { HTMLAttributes } from 'react';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export function Stack({
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap = false,
  className = '',
  children,
  ...props
}: StackProps) {
  const dirs = {
    row: 'flex-row',
    column: 'flex-col',
  };
  const gaps: Record<number, string> = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };
  const aligns = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };
  const justifies = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };
  const cn = [
    'flex',
    dirs[direction],
    gaps[gap],
    align ? aligns[align] : '',
    justify ? justifies[justify] : '',
    wrap ? 'flex-wrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
}
