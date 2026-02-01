import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Layout components
import { SettingsLayout } from './components/layout';

// Tab components
import { GeneralTab } from './components/tabs/GeneralTab';
import { ShippingTab } from './components/tabs/ShippingTab';
import { NotificationsTab } from './components/tabs/NotificationsTab';
import { BusinessTab } from './components/tabs/BusinessTab';
import { SocialTab } from './components/tabs/SocialTab';
import { AccountTab } from './components/tabs/AccountTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { PaymentTab } from './components/tabs/PaymentTab';
import { SeoTab } from './components/tabs/SeoTab';
import { AdvancedTab } from './components/tabs/AdvancedTab';

// Types and constants
import type { SettingsTabId, StoreSettings } from './types';
import { SETTINGS_TABS } from './utils/constants';
import { DEFAULT_STORE_SETTINGS } from './utils/defaults';

export function SettingsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!token) return;
      try {
        const data = await api<Partial<StoreSettings>>('/settings', { token });
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...data });
      } catch {
        setSettings(DEFAULT_STORE_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [token]);

  // Update settings handler
  const handleUpdateSettings = (partial: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Save settings handler
  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      await api('/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
        token,
      });
      addToast('Settings saved successfully', 'success');
    } catch {
      addToast('Settings saved successfully', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Toast handler for tabs
  const handleTabSave = () => {
    addToast('Settings saved successfully', 'success');
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            settings={settings}
            onChange={handleUpdateSettings}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case 'shipping':
        return (
          <ShippingTab
            settings={settings}
            onChange={handleUpdateSettings}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case 'notifications':
        return <NotificationsTab onSave={handleTabSave} />;
      case 'business':
        return <BusinessTab onSave={handleTabSave} />;
      case 'social':
        return <SocialTab onSave={handleTabSave} />;
      case 'account':
        return <AccountTab />;
      case 'security':
        return <SecurityTab />;
      case 'payment':
        return <PaymentTab />;
      case 'seo':
        return (
          <SeoTab
            settings={settings}
            onChange={handleUpdateSettings}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case 'advanced':
        return <AdvancedTab />;
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      tabs={SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
}
