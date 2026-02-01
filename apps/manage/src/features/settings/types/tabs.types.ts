import type { ReactNode } from 'react';

export type SettingsTabId =
  | 'general'
  | 'shipping'
  | 'notifications'
  | 'business'
  | 'social'
  | 'account'
  | 'security'
  | 'payment'
  | 'advanced';

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  icon?: ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'new' | 'beta' | 'deprecated';
  disabled?: boolean;
}

export interface TabPanelProps {
  isActive: boolean;
  children: ReactNode;
}
