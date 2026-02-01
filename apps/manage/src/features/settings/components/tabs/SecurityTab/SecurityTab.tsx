import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { PasswordInput } from '../../form/PasswordInput';
import { useAuth } from '../../../../../context/AuthContext';
import { api } from '../../../../../api/client';
import { useToast } from '../../../../../context/ToastContext';

export function SecurityTab() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="space-y-8">
      <SettingsSection title="Change Password">
        <form onSubmit={handleChangePassword} className="max-w-md">
          <div className="grid gap-4">
            <SettingsField label="Current Password" horizontal={false}>
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} />
            </SettingsField>

            <SettingsField label="New Password" horizontal={false}>
              <PasswordInput value={newPassword} onChange={setNewPassword} showStrength />
            </SettingsField>

            <SettingsField label="Confirm Password" horizontal={false}>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </SettingsField>
          </div>

          <div className="pt-6">
            <SettingsSaveButton isLoading={isSaving} label="Update password" />
          </div>
        </form>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Two-Factor Authentication">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account</p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded">
            Off
          </span>
        </div>
        <button
          type="button"
          className="mt-3 h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          Enable 2FA
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Use an authenticator app like Google Authenticator or Authy for added security.
        </p>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Login History" badge="New" badgeVariant="new">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Device</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Location</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-gray-900">Today, 10:30 AM</td>
                <td className="px-4 py-3 text-gray-500">Chrome · macOS</td>
                <td className="px-4 py-3 text-gray-500">Dhaka, BD</td>
                <td className="px-4 py-3">
                  <span className="text-green-600 text-xs font-medium">Success</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">Yesterday, 3:45 PM</td>
                <td className="px-4 py-3 text-gray-500">Safari · iOS</td>
                <td className="px-4 py-3 text-gray-500">Dhaka, BD</td>
                <td className="px-4 py-3">
                  <span className="text-green-600 text-xs font-medium">Success</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Danger Zone">
        <p className="text-xs text-gray-500 mb-4">Irreversible and destructive actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="h-8 px-3 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Export all data
          </button>
          <button
            type="button"
            className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            Delete all orders
          </button>
          <button
            type="button"
            className="h-8 px-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            Delete account
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
