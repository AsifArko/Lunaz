import type { HTMLAttributes, ReactNode } from 'react';

/* -------------------------------------------------------------------------- */
/*                                 Breadcrumb                                 */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  separator?: ReactNode;
}

export function Breadcrumb({
  separator = (
    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  className = '',
  children,
  ...props
}: BreadcrumbProps) {
  const cn = ['flex items-center space-x-2', className].filter(Boolean).join(' ');

  // Inject separator between children
  const items = Array.isArray(children) ? children : [children];
  const withSeparators: ReactNode[] = [];

  items.forEach((child, index) => {
    if (index > 0) {
      withSeparators.push(
        <span key={`sep-${index}`} className="flex-shrink-0">
          {separator}
        </span>
      );
    }
    withSeparators.push(child);
  });

  return (
    <nav className={cn} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center space-x-2">{withSeparators}</ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                               BreadcrumbItem                               */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  href?: string;
  isCurrent?: boolean;
}

export function BreadcrumbItem({
  href,
  isCurrent = false,
  className = '',
  children,
  ...props
}: BreadcrumbItemProps) {
  const textStyles = isCurrent
    ? 'text-gray-700 font-medium'
    : 'text-gray-500 hover:text-gray-700';

  const cn = ['flex items-center text-sm', textStyles, className].filter(Boolean).join(' ');

  const handleClick = () => {
    if (href && typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <li className={cn} {...props}>
      {href && !isCurrent ? (
        <button
          type="button"
          onClick={handleClick}
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          aria-current={isCurrent ? 'page' : undefined}
        >
          {children}
        </button>
      ) : (
        <span aria-current={isCurrent ? 'page' : undefined}>{children}</span>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                               BreadcrumbHome                               */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbHomeProps extends BreadcrumbItemProps {}

export function BreadcrumbHome({ href = '/', className = '', ...props }: BreadcrumbHomeProps) {
  return (
    <BreadcrumbItem href={href} className={className} {...props}>
      <svg
        className="h-4 w-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
      <span className="sr-only">Home</span>
    </BreadcrumbItem>
  );
}
