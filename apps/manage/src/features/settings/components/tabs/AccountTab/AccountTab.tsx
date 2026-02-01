import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsCard } from '../../shared/SettingsCard';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { useAuth } from '../../../../../context/AuthContext';
import { api } from '../../../../../api/client';
import { useToast } from '../../../../../context/ToastContext';

export function AccountTab() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
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

  return (
    <div className="space-y-8">
      <SettingsSection title="Profile">
        <SettingsCard variant="muted" className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-gray-600">
              {adminName.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{adminName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{adminEmail}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-200 rounded">
              Admin
            </span>
          </div>
        </SettingsCard>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <SettingsField label="Full Name">
              <div className="max-w-sm">
                <TextInput value={adminName} onChange={setAdminName} />
              </div>
            </SettingsField>

            <SettingsField label="Email">
              <div className="max-w-sm">
                <TextInput type="email" value={adminEmail} onChange={setAdminEmail} />
              </div>
            </SettingsField>
          </div>

          <div className="pt-6">
            <SettingsSaveButton isLoading={isSaving} label="Update profile" />
          </div>
        </form>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Active Sessions" description="Manage your active sessions">
        <SettingsCard variant="muted">
          <div className="flex items-center justify-between">
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
                <p className="text-xs text-gray-500">Chrome · macOS · Now</p>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </SettingsCard>

        <p className="text-xs text-gray-400 mt-3">
          You can sign out of all other sessions from the Security tab.
        </p>
      </SettingsSection>
    </div>
  );
}
