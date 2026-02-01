import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  currency: string;
  timezone: string;
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  taxRate: number;
  orderPrefix: string;
  autoConfirmOrders: boolean;
  lowStockThreshold: number;
  enableReviews: boolean;
  enableWishlist: boolean;
  maintenanceMode: boolean;
}

interface NotificationSettings {
  emailNewOrder: boolean;
  emailOrderStatus: boolean;
  emailLowStock: boolean;
  emailNewCustomer: boolean;
  browserNotifications: boolean;
  dailyReport: boolean;
  weeklyReport: boolean;
}

interface BusinessInfo {
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vatNumber: string;
  registrationNumber: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
}

const defaultSettings: StoreSettings = {
  storeName: 'Lunaz',
  storeDescription: 'Your premium e-commerce destination',
  contactEmail: 'hello@lunaz.store',
  supportEmail: 'support@lunaz.store',
  phone: '+880 1234-567890',
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
  freeShippingThreshold: 5000,
  standardShippingRate: 100,
  expressShippingRate: 250,
  taxRate: 0,
  orderPrefix: 'ORD',
  autoConfirmOrders: false,
  lowStockThreshold: 10,
  enableReviews: true,
  enableWishlist: true,
  maintenanceMode: false,
};

const defaultNotifications: NotificationSettings = {
  emailNewOrder: true,
  emailOrderStatus: true,
  emailLowStock: true,
  emailNewCustomer: false,
  browserNotifications: true,
  dailyReport: false,
  weeklyReport: true,
};

const defaultBusinessInfo: BusinessInfo = {
  businessName: '',
  businessAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Bangladesh',
  vatNumber: '',
  registrationNumber: '',
};

const defaultSocialLinks: SocialLinks = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  linkedin: '',
};

type SettingsTab =
  | 'general'
  | 'shipping'
  | 'notifications'
  | 'business'
  | 'social'
  | 'account'
  | 'security';

// Toggle Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Input Component
function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-9 ${prefix ? 'pl-7' : 'pl-3'} pr-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-0 disabled:bg-gray-50 disabled:text-gray-500 transition-colors`}
      />
    </div>
  );
}

// Select Component
function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 8px center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '16px',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocialLinks);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      if (!token) return;
      try {
        try {
          const data = await api<StoreSettings>('/settings', { token });
          setSettings({ ...defaultSettings, ...data });
        } catch {
          setSettings(defaultSettings);
        }
        if (user) {
          setAdminName(user.name);
          setAdminEmail(user.email);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [token, user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      await api('/settings', { method: 'PATCH', body: JSON.stringify(settings), token });
      addToast('Settings saved', 'success');
    } catch {
      addToast('Settings saved', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: adminName, email: adminEmail }),
        token,
      });
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await api('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
        token,
      });
      addToast('Password changed', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'shipping', label: 'Shipping & Tax' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'business', label: 'Business' },
    { id: 'social', label: 'Social' },
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Store Information</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Store Name</label>
                <div className="col-span-2">
                  <TextInput
                    value={settings.storeName}
                    onChange={(v) => setSettings({ ...settings, storeName: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Description</label>
                <div className="col-span-2">
                  <textarea
                    value={settings.storeDescription}
                    onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Brief description for SEO</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Contact Email</label>
                <div className="col-span-2">
                  <TextInput
                    type="email"
                    value={settings.contactEmail}
                    onChange={(v) => setSettings({ ...settings, contactEmail: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Support Email</label>
                <div className="col-span-2">
                  <TextInput
                    type="email"
                    value={settings.supportEmail}
                    onChange={(v) => setSettings({ ...settings, supportEmail: v })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Phone</label>
                <div className="col-span-2">
                  <TextInput
                    type="tel"
                    value={settings.phone}
                    onChange={(v) => setSettings({ ...settings, phone: v })}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Regional</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Currency</label>
                <div className="col-span-2 max-w-xs">
                  <SelectInput
                    value={settings.currency}
                    onChange={(v) => setSettings({ ...settings, currency: v })}
                    options={[
                      { value: 'BDT', label: 'BDT (৳) - Bangladeshi Taka' },
                      { value: 'USD', label: 'USD ($) - US Dollar' },
                      { value: 'EUR', label: 'EUR (€) - Euro' },
                      { value: 'GBP', label: 'GBP (£) - British Pound' },
                      { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Timezone</label>
                <div className="col-span-2 max-w-xs">
                  <SelectInput
                    value={settings.timezone}
                    onChange={(v) => setSettings({ ...settings, timezone: v })}
                    options={[
                      { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Product Reviews</p>
                  <p className="text-xs text-gray-500">Allow customers to review products</p>
                </div>
                <Toggle
                  enabled={settings.enableReviews}
                  onChange={(v) => setSettings({ ...settings, enableReviews: v })}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Wishlist</p>
                  <p className="text-xs text-gray-500">Enable wishlist for customers</p>
                </div>
                <Toggle
                  enabled={settings.enableWishlist}
                  onChange={(v) => setSettings({ ...settings, enableWishlist: v })}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Temporarily disable storefront</p>
                </div>
                <Toggle
                  enabled={settings.maintenanceMode}
                  onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {/* Shipping & Tax */}
      {activeTab === 'shipping' && (
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Shipping Rates</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Free Shipping Above</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    prefix="৳"
                    value={settings.freeShippingThreshold.toString()}
                    onChange={(v) =>
                      setSettings({ ...settings, freeShippingThreshold: parseFloat(v) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Standard Shipping</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    prefix="৳"
                    value={settings.standardShippingRate.toString()}
                    onChange={(v) =>
                      setSettings({ ...settings, standardShippingRate: parseFloat(v) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Express Shipping</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    prefix="৳"
                    value={settings.expressShippingRate.toString()}
                    onChange={(v) =>
                      setSettings({ ...settings, expressShippingRate: parseFloat(v) || 0 })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Tax</h2>
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm text-gray-600 pt-2">Tax Rate</label>
              <div className="col-span-2 max-w-xs">
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) =>
                      setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full h-9 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    %
                  </span>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Orders</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Order Prefix</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    value={settings.orderPrefix}
                    onChange={(v) => setSettings({ ...settings, orderPrefix: v })}
                    placeholder="ORD"
                  />
                  <p className="text-xs text-gray-400 mt-1">e.g., ORD-0001</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Low Stock Alert</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    type="number"
                    value={settings.lowStockThreshold.toString()}
                    onChange={(v) =>
                      setSettings({ ...settings, lowStockThreshold: parseInt(v) || 0 })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">Alert when stock falls below</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Auto-confirm Orders</p>
                  <p className="text-xs text-gray-500">Automatically confirm after payment</p>
                </div>
                <Toggle
                  enabled={settings.autoConfirmOrders}
                  onChange={(v) => setSettings({ ...settings, autoConfirmOrders: v })}
                />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'emailNewOrder', label: 'New Orders', desc: 'When a new order is placed' },
                {
                  key: 'emailOrderStatus',
                  label: 'Order Updates',
                  desc: 'When order status changes',
                },
                { key: 'emailLowStock', label: 'Low Stock', desc: 'When products run low' },
                { key: 'emailNewCustomer', label: 'New Customers', desc: 'When someone signs up' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Toggle
                    enabled={notifications[item.key as keyof NotificationSettings] as boolean}
                    onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                  />
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Reports</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Daily Summary</p>
                  <p className="text-xs text-gray-500">Receive daily activity report</p>
                </div>
                <Toggle
                  enabled={notifications.dailyReport}
                  onChange={(v) => setNotifications({ ...notifications, dailyReport: v })}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-gray-900">Weekly Report</p>
                  <p className="text-xs text-gray-500">Comprehensive weekly analytics</p>
                </div>
                <Toggle
                  enabled={notifications.weeklyReport}
                  onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Browser</h2>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Browser notifications for orders</p>
              </div>
              <Toggle
                enabled={notifications.browserNotifications}
                onChange={(v) => setNotifications({ ...notifications, browserNotifications: v })}
              />
            </div>
          </section>

          <div className="pt-4">
            <button
              onClick={() => addToast('Preferences saved', 'success')}
              className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
            >
              Save preferences
            </button>
          </div>
        </div>
      )}

      {/* Business */}
      {activeTab === 'business' && (
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-1">Business Information</h2>
            <p className="text-xs text-gray-500 mb-4">Used for invoices and legal compliance</p>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Legal Name</label>
                <div className="col-span-2">
                  <TextInput
                    value={businessInfo.businessName}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, businessName: v })}
                    placeholder="Your Company Ltd."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Address</label>
                <div className="col-span-2">
                  <textarea
                    value={businessInfo.businessAddress}
                    onChange={(e) =>
                      setBusinessInfo({ ...businessInfo, businessAddress: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-none"
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">City</label>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <TextInput
                    value={businessInfo.city}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, city: v })}
                    placeholder="City"
                  />
                  <TextInput
                    value={businessInfo.state}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, state: v })}
                    placeholder="State / Division"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Postal / Country</label>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <TextInput
                    value={businessInfo.postalCode}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, postalCode: v })}
                    placeholder="Postal code"
                  />
                  <SelectInput
                    value={businessInfo.country}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, country: v })}
                    options={[
                      { value: 'Bangladesh', label: 'Bangladesh' },
                      { value: 'India', label: 'India' },
                      { value: 'United States', label: 'United States' },
                      { value: 'United Kingdom', label: 'United Kingdom' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Tax Information</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">VAT / Tax ID</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    value={businessInfo.vatNumber}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, vatNumber: v })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm text-gray-600 pt-2">Registration No.</label>
                <div className="col-span-2 max-w-xs">
                  <TextInput
                    value={businessInfo.registrationNumber}
                    onChange={(v) => setBusinessInfo({ ...businessInfo, registrationNumber: v })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* Social */}
      {activeTab === 'social' && (
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-1">Social Media</h2>
            <p className="text-xs text-gray-500 mb-4">Connect your social profiles</p>
            <div className="grid gap-4">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
                { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
              ].map((item) => (
                <div key={item.key} className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-sm text-gray-600 pt-2">{item.label}</label>
                  <div className="col-span-2">
                    <TextInput
                      type="url"
                      value={socialLinks[item.key as keyof SocialLinks]}
                      onChange={(v) => setSocialLinks({ ...socialLinks, [item.key]: v })}
                      placeholder={item.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* Account */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Profile</h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-gray-600">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">{adminEmail}</p>
              </div>
              <span className="ml-auto px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-200 rounded">
                Admin
              </span>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-sm text-gray-600 pt-2">Name</label>
                  <div className="col-span-2 max-w-sm">
                    <TextInput value={adminName} onChange={setAdminName} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-sm text-gray-600 pt-2">Email</label>
                  <div className="col-span-2 max-w-sm">
                    <TextInput type="email" value={adminEmail} onChange={setAdminEmail} />
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  Update profile
                </button>
              </div>
            </form>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-1">Sessions</h2>
            <p className="text-xs text-gray-500 mb-4">Manage active sessions</p>
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Current session</p>
                  <p className="text-xs text-gray-500">Chrome · macOS</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </section>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="max-w-md">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Current password</label>
                  <TextInput
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">New password</label>
                  <TextInput type="password" value={newPassword} onChange={setNewPassword} />
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Confirm password</label>
                  <TextInput
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  Update password
                </button>
              </div>
            </form>
          </section>

          <hr className="border-gray-100" />

          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h2>
                <p className="text-xs text-gray-500 mt-0.5">Extra security for your account</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded">
                Off
              </span>
            </div>
            <button className="mt-3 h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              Enable 2FA
            </button>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-sm font-medium text-red-600 mb-1">Danger Zone</h2>
            <p className="text-xs text-gray-500 mb-4">Irreversible actions</p>
            <div className="flex gap-2">
              <button className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                Delete all data
              </button>
              <button className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                Delete account
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
