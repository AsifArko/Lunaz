import type { HTMLAttributes } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  rowGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  colGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
}

export function Grid({
  cols = 1,
  gap,
  rowGap,
  colGap,
  className = '',
  children,
  ...props
}: GridProps) {
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };
  const gapsMap: Record<number, string> = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
  };
  const rowGapsMap: Record<number, string> = {
    0: 'gap-y-0',
    1: 'gap-y-1',
    2: 'gap-y-2',
    3: 'gap-y-3',
    4: 'gap-y-4',
    5: 'gap-y-5',
    6: 'gap-y-6',
    8: 'gap-y-8',
  };
  const colGapsMap: Record<number, string> = {
    0: 'gap-x-0',
    1: 'gap-x-1',
    2: 'gap-x-2',
    3: 'gap-x-3',
    4: 'gap-x-4',
    5: 'gap-x-5',
    6: 'gap-x-6',
    8: 'gap-x-8',
  };

  const cn = [
    'grid',
    colsMap[cols],
    gap !== undefined ? gapsMap[gap] : '',
    rowGap !== undefined ? rowGapsMap[rowGap] : '',
    colGap !== undefined ? colGapsMap[colGap] : '',
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
