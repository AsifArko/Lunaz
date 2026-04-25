import type { ReactNode } from 'react';
import { SettingsHeader } from './SettingsHeader';
import { SettingsTabs } from './SettingsTabs';
import { SettingsContent } from './SettingsContent';
import type { SettingsTab, SettingsTabId } from 'manage-settings/types';

interface SettingsLayoutProps {
  children: ReactNode;
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function SettingsLayout({
  children,
  tabs,
  activeTab,
  onTabChange,
  isLoading = false,
  title,
  description,
}: SettingsLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <SettingsHeader title={title} description={description} />
      <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <SettingsContent isLoading={isLoading}>{children}</SettingsContent>
    </div>
  );
}
