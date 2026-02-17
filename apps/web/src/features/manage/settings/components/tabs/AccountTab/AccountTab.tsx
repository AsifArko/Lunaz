import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { SelectInput } from '../../form/SelectInput';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi as api } from '@/api/adminClient';
import { useToast } from '@/context/ToastContext';

// Icons
const UserIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const PreferencesIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SessionsIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const ActivityIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DataIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (GMT+5:30)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

// Mock data for sessions and activity
const SESSIONS = [
  {
    id: 1,
    device: 'Chrome on macOS',
    location: 'Dhaka, Bangladesh',
    lastActive: 'Now',
    current: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone',
    location: 'Dhaka, Bangladesh',
    lastActive: '2 hours ago',
    current: false,
  },
];

const ACTIVITY = [
  {
    id: 1,
    action: 'Signed in',
    device: 'Chrome on macOS',
    time: 'Today, 9:42 AM',
    ip: '103.145.xx.xx',
  },
  {
    id: 2,
    action: 'Password changed',
    device: 'Chrome on macOS',
    time: 'Jan 28, 2026',
    ip: '103.145.xx.xx',
  },
  {
    id: 3,
    action: 'Signed in',
    device: 'Safari on iPhone',
    time: 'Jan 27, 2026',
    ip: '103.145.xx.xx',
  },
];

export function AccountTab() {
  const { user, token } = useAdminAuth();
  const { addToast } = useToast();
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
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

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'A'
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-50" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-2xl font-semibold text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200">
                {getInitials(adminName)}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 pt-2 sm:pt-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{adminName || 'Admin User'}</h2>
                <span className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-full">
                  Administrator
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{adminEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400">Member since</p>
                <p className="text-sm text-gray-600">January 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <SettingsSection
        title="Personal Information"
        description="Update your personal details"
        icon={UserIcon}
        iconBg="gray"
        variant="card"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <TextInput value={adminName} onChange={setAdminName} placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <TextInput
                type="email"
                value={adminEmail}
                onChange={setAdminEmail}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <TextInput
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <div className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                <span className="text-sm text-gray-500">Administrator</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
            <SettingsSaveButton isLoading={isSaving} label="Save changes" type="submit" />
          </div>
        </form>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection
        title="Preferences"
        description="Customize your experience"
        icon={PreferencesIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <SelectInput value={timezone} onChange={setTimezone} options={TIMEZONE_OPTIONS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <SelectInput value={language} onChange={setLanguage} options={LANGUAGE_OPTIONS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
              <SelectInput value={theme} onChange={setTheme} options={THEME_OPTIONS} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Email Preferences
            </p>
            <div className="space-y-3">
              <SettingsToggle
                label="Email notifications"
                description="Receive important updates via email"
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
              <SettingsToggle
                label="Marketing emails"
                description="Receive tips, product updates, and offers"
                checked={marketingEmails}
                onChange={setMarketingEmails}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Active Sessions */}
      <SettingsSection
        title="Active Sessions"
        description="Devices currently signed in to your account"
        icon={SessionsIcon}
        iconBg="gray"
        variant="card"
        action={
          <button
            type="button"
            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Sign out all
          </button>
        }
      >
        <div className="space-y-3">
          {SESSIONS.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                session.current ? 'bg-gray-50 border border-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    session.current ? 'bg-white border border-gray-200' : 'bg-gray-100'
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  type="button"
                  className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Recent Activity */}
      <SettingsSection
        title="Recent Activity"
        description="Your recent account activity"
        icon={ActivityIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-0">
          {ACTIVITY.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 py-3 ${
                index !== ACTIVITY.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.action === 'Signed in' ? (
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500">{item.device}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">{item.time}</p>
                <p className="text-xs text-gray-400">{item.ip}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-gray-100">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            View all activity
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection
        title="Data & Privacy"
        description="Manage your data and privacy settings"
        icon={DataIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Download your data</p>
              <p className="text-xs text-gray-500">Get a copy of your account data</p>
            </div>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Privacy settings</p>
              <p className="text-xs text-gray-500">Manage data sharing preferences</p>
            </div>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connected apps</p>
              <p className="text-xs text-gray-500">Manage third-party access</p>
            </div>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Activity log</p>
              <p className="text-xs text-gray-500">View detailed activity history</p>
            </div>
          </button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
            <p className="text-xs text-gray-600 mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="mt-3 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
