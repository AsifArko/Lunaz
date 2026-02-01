import { useState, type ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'new' | 'beta' | 'deprecated';
}

const badgeStyles = {
  default: 'bg-gray-100 text-gray-600',
  new: 'bg-green-100 text-green-700',
  beta: 'bg-blue-100 text-blue-700',
  deprecated: 'bg-orange-100 text-orange-700',
};

export function SettingsSection({
  title,
  description,
  children,
  action,
  collapsible = false,
  defaultOpen = true,
  badge,
  badgeVariant = 'default',
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerContent = (
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-medium text-gray-900">{title}</h2>
      {badge && (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${badgeStyles[badgeVariant]}`}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div>
            {headerContent}
            {description && <p className="text-xs text-gray-500 mt-0.5 text-left">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
        {isOpen && <div className="p-4">{children}</div>}
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          {headerContent}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
