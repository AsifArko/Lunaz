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
  icon?: ReactNode;
  iconBg?: 'gray' | 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red';
  variant?: 'default' | 'card' | 'bordered';
}

const badgeStyles = {
  default: 'bg-gray-100 text-gray-600',
  new: 'bg-emerald-50 text-emerald-600',
  beta: 'bg-blue-50 text-blue-600',
  deprecated: 'bg-orange-50 text-orange-600',
};

const iconBgStyles = {
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  pink: 'bg-pink-50 text-pink-600',
  red: 'bg-red-50 text-red-600',
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
  icon,
  iconBg = 'gray',
  variant = 'default',
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerContent = (
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgStyles[iconBg]}`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${badgeStyles[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex-1 text-left">{headerContent}</div>
          <div className="flex items-center gap-3 ml-4">
            {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
            <div
              className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <svg
                className="w-3.5 h-3.5 text-gray-500"
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
          </div>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-0">
            <div className="pt-4 border-t border-gray-100">{children}</div>
          </div>
        )}
      </section>
    );
  }

  if (variant === 'card') {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          {headerContent}
          {action}
        </div>
        {children}
      </section>
    );
  }

  if (variant === 'bordered') {
    return (
      <section className="border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between mb-5">
          {headerContent}
          {action}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between mb-5">
        {headerContent}
        {action}
      </div>
      {children}
    </section>
  );
}
