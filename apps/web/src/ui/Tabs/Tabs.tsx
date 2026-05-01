import type { HTMLAttributes } from 'react';
import { createContext, useContext, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within a Tabs provider');
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*                                    Tabs                                    */
/* -------------------------------------------------------------------------- */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value,
  onChange,
  className = '',
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalValue;

  const setActiveTab = (id: string) => {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TabsList                                  */
/* -------------------------------------------------------------------------- */

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsList({
  variant = 'default',
  className = '',
  children,
  ...props
}: TabsListProps) {
  const variants = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b border-gray-200',
  };
  const cn = ['flex gap-1', variants[variant], className].filter(Boolean).join(' ');

  return (
    <div className={cn} role="tablist" {...props}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Tab                                     */
/* -------------------------------------------------------------------------- */

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tab({
  value,
  disabled = false,
  variant = 'default',
  className = '',
  children,
  ...props
}: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  const base =
    'px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
  const variants = {
    default: {
      active: 'border-b-2 border-indigo-600 text-indigo-600 -mb-px',
      inactive: 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 -mb-px',
    },
    pills: {
      active: 'bg-white text-gray-900 rounded-md shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
    underline: {
      active: 'border-b-2 border-indigo-600 text-indigo-600 -mb-px',
      inactive: 'text-gray-500 hover:text-gray-700 -mb-px',
    },
  };

  const cn = [
    base,
    isActive ? variants[variant].active : variants[variant].inactive,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      className={cn}
      onClick={() => !disabled && setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 TabsPanel                                  */
/* -------------------------------------------------------------------------- */

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsPanel({ value, className = '', children, ...props }: TabsPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={`py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
