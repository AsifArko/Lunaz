import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

/* -------------------------------------------------------------------------- */
/*                                   Table                                    */
/* -------------------------------------------------------------------------- */

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export function Table({
  striped = false,
  hoverable = true,
  className = '',
  children,
  ...props
}: TableProps) {
  const cn = ['min-w-full divide-y divide-gray-200', className].filter(Boolean).join(' ');

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={cn} {...props}>
        {children}
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableHead                                 */
/* -------------------------------------------------------------------------- */

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableHead({ className = '', children, ...props }: TableHeadProps) {
  const cn = ['bg-gray-50', className].filter(Boolean).join(' ');
  return (
    <thead className={cn} {...props}>
      {children}
    </thead>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableBody                                 */
/* -------------------------------------------------------------------------- */

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export function TableBody({
  striped = false,
  hoverable = true,
  className = '',
  children,
  ...props
}: TableBodyProps) {
  const cn = [
    'bg-white divide-y divide-gray-200',
    striped ? '[&>tr:nth-child(odd)]:bg-gray-50' : '',
    hoverable ? '[&>tr]:hover:bg-gray-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tbody className={cn} {...props}>
      {children}
    </tbody>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableRow                                  */
/* -------------------------------------------------------------------------- */

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export function TableRow({ selected = false, className = '', children, ...props }: TableRowProps) {
  const cn = [selected ? 'bg-indigo-50' : '', className].filter(Boolean).join(' ');
  return (
    <tr className={cn} {...props}>
      {children}
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableCell (th)                            */
/* -------------------------------------------------------------------------- */

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  sortable = false,
  sortDirection,
  onSort,
  className = '',
  children,
  ...props
}: TableHeaderCellProps) {
  const cn = [
    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const SortIcon = () => {
    if (!sortable) return null;
    if (!sortDirection) {
      return (
        <svg
          className="ml-1 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return (
      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    );
  };

  return (
    <th className={cn} onClick={sortable ? onSort : undefined} {...props}>
      <div className="flex items-center">
        {children}
        <SortIcon />
      </div>
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TableCell (td)                            */
/* -------------------------------------------------------------------------- */

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className = '', children, ...props }: TableCellProps) {
  const cn = ['px-6 py-4 whitespace-nowrap text-sm text-gray-900', className]
    .filter(Boolean)
    .join(' ');
  return (
    <td className={cn} {...props}>
      {children}
    </td>
  );
}
