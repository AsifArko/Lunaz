import type { HTMLAttributes, ReactNode } from 'react';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  onBack?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  onBack,
  className = '',
  ...props
}: PageHeaderProps) {
  const cn = ['mb-6', className].filter(Boolean).join(' ');

  const BackButton = () => {
    if (!backHref && !onBack) return null;

    const handleClick = () => {
      if (onBack) {
        onBack();
      } else if (backHref && typeof window !== 'undefined') {
        window.location.href = backHref;
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    );
  };

  return (
    <div className={cn} {...props}>
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
