import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsField } from 'manage-settings/components/shared/SettingsField';
import { TextInput } from 'manage-settings/components/form/TextInput';
import { TextArea } from 'manage-settings/components/form/TextArea';
import { TagInput } from 'manage-settings/components/form/TagInput';
import type { StoreSettings } from 'manage-settings/types';

interface SeoSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const SearchIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ChartIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export function SeoSection({ settings, onChange }: SeoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Meta Information */}
      <SettingsSection
        title="Meta Information"
        description="Default SEO tags for search engines"
        icon={SearchIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-4">
          <SettingsField label="Meta Title" description="60 characters max" horizontal={false}>
            <TextInput
              value={settings.metaTitle}
              onChange={(v) => onChange({ metaTitle: v })}
              placeholder="Your Store Name | Tagline"
              maxLength={60}
            />
          </SettingsField>

          <SettingsField
            label="Meta Description"
            description="160 characters max"
            horizontal={false}
          >
            <TextArea
              value={settings.metaDescription}
              onChange={(v) => onChange({ metaDescription: v })}
              placeholder="Describe your store in a few sentences..."
              rows={3}
              maxLength={160}
            />
          </SettingsField>

          <SettingsField
            label="Meta Keywords"
            description="Add relevant keywords"
            horizontal={false}
          >
            <TagInput
              value={settings.metaKeywords}
              onChange={(v) => onChange({ metaKeywords: v })}
              placeholder="Add keyword..."
              maxTags={10}
            />
          </SettingsField>
        </div>
      </SettingsSection>

      {/* Analytics & Tracking */}
      <SettingsSection
        title="Analytics & Tracking"
        description="Connect your analytics services"
        icon={ChartIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            label="Google Analytics ID"
            description="GA4 Measurement ID"
            horizontal={false}
          >
            <TextInput
              value={settings.googleAnalyticsId}
              onChange={(v) => onChange({ googleAnalyticsId: v })}
              placeholder="G-XXXXXXXXXX"
            />
          </SettingsField>

          <SettingsField label="Facebook Pixel ID" horizontal={false}>
            <TextInput
              value={settings.facebookPixelId}
              onChange={(v) => onChange({ facebookPixelId: v })}
              placeholder="XXXXXXXXXXXXXXX"
            />
          </SettingsField>

          <SettingsField
            label="Google Tag Manager"
            description="GTM Container ID"
            horizontal={false}
          >
            <TextInput
              value={settings.googleTagManagerId}
              onChange={(v) => onChange({ googleTagManagerId: v })}
              placeholder="GTM-XXXXXXX"
            />
          </SettingsField>
        </div>
      </SettingsSection>
    </div>
  );
}
