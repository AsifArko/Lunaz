import type { SettingsTab, SettingsTabId } from '../../types';

interface SettingsTabsProps {
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
}

const badgeStyles = {
  default: 'bg-gray-100 text-gray-600',
  new: 'bg-green-100 text-green-700',
  beta: 'bg-blue-100 text-blue-700',
  deprecated: 'bg-orange-100 text-orange-700',
};

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-6 -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                  badgeStyles[tab.badgeVariant || 'default']
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
