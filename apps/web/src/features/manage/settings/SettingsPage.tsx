import { useState, useEffect } from 'react';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';

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
import type {
  SettingsTabId,
  StoreSettings,
  BusinessInfo,
  SocialSettings,
  NotificationSettings,
  PaymentSettings,
  PaymentGateways,
  SettingsApiPayload,
} from './types';
import { SETTINGS_TABS } from './utils/constants';
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_BUSINESS_INFO,
  DEFAULT_SOCIAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_PAYMENT_GATEWAYS,
} from './utils/defaults';
import { useMinimumLoadingTime } from '@/features/manage/hooks/useMinimumLoadingTime';

export function SettingsPage() {
  const { token } = useAdminAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [business, setBusiness] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [social, setSocial] = useState<SocialSettings>(DEFAULT_SOCIAL_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [gateways, setGateways] = useState<PaymentGateways>(DEFAULT_PAYMENT_GATEWAYS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!token) return;
      try {
        const data = await api<SettingsApiPayload>('/settings', { token });
        const {
          business: biz,
          social: soc,
          notifications: notif,
          paymentSettings: paySet,
          gateways: gw,
          ...storeData
        } = data;
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...storeData });
        setBusiness({ ...DEFAULT_BUSINESS_INFO, ...biz });
        setSocial({ ...DEFAULT_SOCIAL_SETTINGS, ...soc });
        setNotifications({ ...DEFAULT_NOTIFICATION_SETTINGS, ...notif });
        setPaymentSettings({ ...DEFAULT_PAYMENT_SETTINGS, ...paySet });
        setGateways({ ...DEFAULT_PAYMENT_GATEWAYS, ...gw });
      } catch {
        setSettings(DEFAULT_STORE_SETTINGS);
        setBusiness(DEFAULT_BUSINESS_INFO);
        setSocial(DEFAULT_SOCIAL_SETTINGS);
        setNotifications(DEFAULT_NOTIFICATION_SETTINGS);
        setPaymentSettings(DEFAULT_PAYMENT_SETTINGS);
        setGateways(DEFAULT_PAYMENT_GATEWAYS);
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

  // Build full payload for API
  const buildPayload = (): SettingsApiPayload => ({
    ...settings,
    business,
    social,
    notifications,
    paymentSettings,
    gateways,
  });

  // Save settings handler
  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const payload = buildPayload();
      const data = await api<SettingsApiPayload>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
        token,
      });
      setSettings((prev) => ({ ...prev, ...data }));
      if (data.business) setBusiness((prev) => ({ ...prev, ...data.business }));
      if (data.social) setSocial((prev) => ({ ...prev, ...data.social }));
      if (data.notifications) setNotifications((prev) => ({ ...prev, ...data.notifications }));
      if (data.paymentSettings)
        setPaymentSettings((prev) => ({ ...prev, ...data.paymentSettings }));
      if (data.gateways) setGateways((prev) => ({ ...prev, ...data.gateways }));
      addToast('Settings saved successfully', 'success');
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showLoading = useMinimumLoadingTime(isLoading, 450);

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
        return (
          <NotificationsTab
            notifications={notifications}
            onChange={setNotifications}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case 'business':
        return (
          <BusinessTab
            business={business}
            onChange={setBusiness}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case 'social':
        return (
          <SocialTab social={social} onChange={setSocial} onSave={handleSave} isSaving={isSaving} />
        );
      case 'account':
        return <AccountTab />;
      case 'security':
        return <SecurityTab />;
      case 'payment':
        return (
          <PaymentTab
            paymentSettings={paymentSettings}
            gateways={gateways}
            onPaymentChange={setPaymentSettings}
            onGatewaysChange={setGateways}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
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
      isLoading={showLoading}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
}
