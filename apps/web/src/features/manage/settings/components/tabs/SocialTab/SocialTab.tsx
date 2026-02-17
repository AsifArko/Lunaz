import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import type { SocialSettings } from '../../../types';
import { DEFAULT_SOCIAL_SETTINGS } from '../../../utils/defaults';

interface SocialTabProps {
  onSave?: () => void;
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourhandle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourprofile' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourprofile' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/1234567890' },
] as const;

const SHARING_PLATFORMS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'pinterest', label: 'Pinterest' },
  { key: 'email', label: 'Email' },
] as const;

// Section Icons
const SocialLinksIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const ShareIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

const TemplateIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const PreviewIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

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

  const updateSocial = (key: string, value: string | boolean | string[]) => {
    setSocialSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSharingPlatform = (platform: string) => {
    const current = socialSettings.socialSharingPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    updateSocial('socialSharingPlatforms', updated);
  };

  const connectedCount = SOCIAL_PLATFORMS.filter(
    (p) => socialSettings[p.key as keyof SocialSettings]
  ).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Social Media Profiles */}
      <SettingsSection
        title="Social Media Profiles"
        description="Connect your store's social media accounts"
        icon={SocialLinksIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">Connected accounts</span>
            <span className="text-xs font-medium text-gray-700">
              {connectedCount} of {SOCIAL_PLATFORMS.length}
            </span>
          </div>

          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const value = (socialSettings[platform.key as keyof SocialSettings] as string) || '';
              const isConnected = !!value;

              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{platform.label}</span>
                      {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <TextInput
                      type="url"
                      value={value}
                      onChange={(v) => updateSocial(platform.key, v)}
                      placeholder={platform.placeholder}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      {/* Social Sharing Settings */}
      <SettingsSection
        title="Product Sharing"
        description="Allow customers to share products on social media"
        icon={ShareIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable share buttons"
            description="Display share buttons on product pages"
            checked={socialSettings.enableSocialSharing}
            onChange={(v) => updateSocial('enableSocialSharing', v)}
          />

          {socialSettings.enableSocialSharing && (
            <>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Select platforms
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHARING_PLATFORMS.map((platform) => {
                    const isActive = socialSettings.socialSharingPlatforms?.includes(platform.key);
                    return (
                      <button
                        key={platform.key}
                        type="button"
                        onClick={() => toggleSharingPlatform(platform.key)}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {platform.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SettingsToggle
                label="Include product image"
                description="Attach the product image when sharing"
                checked={socialSettings.socialShareIncludeImage}
                onChange={(v) => updateSocial('socialShareIncludeImage', v)}
              />
            </>
          )}
        </div>
      </SettingsSection>

      {/* Share Template */}
      <SettingsSection
        title="Share Message"
        description="Default text when customers share products"
        icon={TemplateIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-3">
          <TextArea
            value={socialSettings.socialShareTemplate || ''}
            onChange={(v) => updateSocial('socialShareTemplate', v)}
            placeholder="Check out {product_name} at {store_name}! {product_url}"
            rows={3}
          />
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Use these variables in your message:</p>
              <div className="flex flex-wrap gap-1.5">
                {['{product_name}', '{product_url}', '{store_name}', '{price}'].map((variable) => (
                  <code
                    key={variable}
                    className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono"
                  >
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Social Preview */}
      <SettingsSection
        title="Link Preview"
        description="How your store appears when links are shared"
        icon={PreviewIcon}
        iconBg="gray"
        variant="card"
        badge="Preview"
        badgeVariant="default"
      >
        <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-10 h-10 text-gray-300 mx-auto mb-1"
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
              <p className="text-xs text-gray-400">Open Graph Image</p>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-gray-100">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">
              yourstore.com
            </p>
            <p className="text-sm font-medium text-gray-900 mb-0.5 line-clamp-1">Your Store Name</p>
            <p className="text-xs text-gray-500 line-clamp-2">
              Your store description will appear here when shared on social media platforms.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Configure Open Graph settings in the <span className="font-medium">SEO</span> tab to
          customize this preview.
        </p>
      </SettingsSection>

      <div className="flex justify-end pt-2">
        <SettingsSaveButton isLoading={isSaving} label="Save changes" type="submit" />
      </div>
    </form>
  );
}
