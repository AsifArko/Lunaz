import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { SOCIAL_PLATFORMS } from '../../../utils/constants';
import type { SocialSettings } from '../../../types';
import { DEFAULT_SOCIAL_SETTINGS } from '../../../utils/defaults';

interface SocialTabProps {
  onSave?: () => void;
}

export function SocialTab({ onSave }: SocialTabProps) {
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(DEFAULT_SOCIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onSave?.();
  };

  const updateSocial = (key: string, value: string) => {
    setSocialSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <SettingsSection title="Social Media" description="Connect your social profiles">
        <div className="grid gap-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <SettingsField key={platform.key} label={platform.label}>
              <TextInput
                type="url"
                value={(socialSettings[platform.key as keyof SocialSettings] as string) || ''}
                onChange={(v) => updateSocial(platform.key, v)}
                placeholder={platform.placeholder}
              />
            </SettingsField>
          ))}
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection
        title="Social Preview"
        description="How your store appears when shared"
        badge="Coming Soon"
        badgeVariant="beta"
      >
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">
            Social preview cards for Facebook, Twitter, and LinkedIn will appear here.
          </p>
        </div>
      </SettingsSection>

      <div className="pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
