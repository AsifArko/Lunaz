import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { PasswordInput } from '../../form/PasswordInput';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminApi as api } from '@/api/adminClient';
import { useToast } from '@/context/ToastContext';

// Icons
const PasswordIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const ShieldIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const DevicesIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const HistoryIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertsIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const RecoveryIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

// Mock data
const LOGIN_HISTORY = [
  {
    id: 1,
    date: 'Today, 10:30 AM',
    device: 'Chrome on macOS',
    location: 'Dhaka, Bangladesh',
    ip: '103.145.xx.xx',
    status: 'success',
  },
  {
    id: 2,
    date: 'Yesterday, 3:45 PM',
    device: 'Safari on iPhone',
    location: 'Dhaka, Bangladesh',
    ip: '103.145.xx.xx',
    status: 'success',
  },
  {
    id: 3,
    date: 'Jan 28, 2026',
    device: 'Firefox on Windows',
    location: 'Chittagong, Bangladesh',
    ip: '103.148.xx.xx',
    status: 'success',
  },
  {
    id: 4,
    date: 'Jan 25, 2026',
    device: 'Unknown device',
    location: 'Mumbai, India',
    ip: '49.36.xx.xx',
    status: 'failed',
  },
];

const ACTIVE_SESSIONS = [
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

export function SecurityTab() {
  const { token } = useAdminAuth();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [unusualActivityAlerts, setUnusualActivityAlerts] = useState(true);
  const [weeklySecurityReport, setWeeklySecurityReport] = useState(false);

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
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Security Overview</h2>
          <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Secure
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Password</span>
            </div>
            <p className="text-xs text-gray-500">Updated 30 days ago</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">2FA</span>
            </div>
            <p className="text-xs text-gray-500">Not enabled</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Sessions</span>
            </div>
            <p className="text-xs text-gray-500">{ACTIVE_SESSIONS.length} active</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Alerts</span>
            </div>
            <p className="text-xs text-gray-500">Enabled</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <SettingsSection
        title="Password"
        description="Change your password to keep your account secure"
        icon={PasswordIcon}
        iconBg="gray"
        variant="card"
      >
        <form onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2 md:max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current password
              </label>
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} />
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.label === 'Weak'
                          ? 'text-red-600'
                          : passwordStrength.label === 'Fair'
                            ? 'text-yellow-600'
                            : passwordStrength.label === 'Good'
                              ? 'text-blue-600'
                              : 'text-green-600'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { check: newPassword.length >= 8, text: 'At least 8 characters' },
                { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                { check: /[0-9]/.test(newPassword), text: 'One number' },
                { check: /[^A-Za-z0-9]/.test(newPassword), text: 'One special character' },
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <svg
                    className={`w-3.5 h-3.5 ${req.check ? 'text-green-500' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className={`text-xs ${req.check ? 'text-gray-700' : 'text-gray-400'}`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
            <SettingsSaveButton isLoading={isSaving} label="Update password" type="submit" />
          </div>
        </form>
      </SettingsSection>

      {/* Two-Factor Authentication */}
      <SettingsSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={ShieldIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900">Authenticator App</h4>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Use an app like Google Authenticator or Authy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  twoFactorEnabled
                    ? 'text-red-600 bg-white border border-gray-200 hover:bg-red-50'
                    : 'text-white bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Backup Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Backup Codes</p>
                <p className="text-xs text-gray-500">Generate recovery codes</p>
              </div>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Recovery Email</p>
                <p className="text-xs text-gray-500">Set up email recovery</p>
              </div>
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Active Sessions */}
      <SettingsSection
        title="Active Sessions"
        description="Manage devices that are signed in to your account"
        icon={DevicesIcon}
        iconBg="gray"
        variant="card"
        action={
          <button
            type="button"
            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Sign out all other sessions
          </button>
        }
      >
        <div className="space-y-3">
          {ACTIVE_SESSIONS.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-3 rounded-xl ${
                session.current ? 'bg-gray-50 border border-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    session.current ? 'bg-white border border-gray-200' : 'bg-gray-100'
                  }`}
                >
                  {session.device.includes('iPhone') || session.device.includes('iOS') ? (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Current
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
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-200 rounded-md hover:border-red-200 hover:bg-red-50 transition-all"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Security Alerts */}
      <SettingsSection
        title="Security Alerts"
        description="Get notified about important security events"
        icon={AlertsIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-3">
          <SettingsToggle
            label="New login alerts"
            description="Get notified when a new device logs in"
            checked={loginAlerts}
            onChange={setLoginAlerts}
          />
          <SettingsToggle
            label="Unusual activity alerts"
            description="Get notified about suspicious account activity"
            checked={unusualActivityAlerts}
            onChange={setUnusualActivityAlerts}
          />
          <SettingsToggle
            label="Weekly security report"
            description="Receive a weekly summary of security events"
            checked={weeklySecurityReport}
            onChange={setWeeklySecurityReport}
          />
        </div>
      </SettingsSection>

      {/* Login History */}
      <SettingsSection
        title="Login History"
        description="Recent sign-in activity on your account"
        icon={HistoryIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-0 divide-y divide-gray-100">
          {LOGIN_HISTORY.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {item.status === 'success' ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-900">{item.device}</p>
                  <p className="text-xs text-gray-500">
                    {item.location} · {item.ip}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{item.date}</p>
                <p
                  className={`text-xs font-medium ${
                    item.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.status === 'success' ? 'Successful' : 'Failed'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-gray-100">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            View full history
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

      {/* Account Recovery */}
      <SettingsSection
        title="Account Recovery"
        description="Set up recovery options for your account"
        icon={RecoveryIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Recovery email</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Recovery phone</p>
                <p className="text-xs text-gray-500">Not set up</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 bg-red-50/50 border-b border-red-200">
          <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Danger Zone
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sign out everywhere</p>
              <p className="text-xs text-gray-500">
                Sign out of all sessions including the current one
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign out all
            </button>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete all store data</p>
              <p className="text-xs text-gray-500">
                Permanently delete all orders, products, and customers
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete data
            </button>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
