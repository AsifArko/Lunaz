import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import { TagInput } from '../../form/TagInput';
import type { StoreSettings } from '../../../types';

interface SeoSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

export function SeoSection({ settings, onChange }: SeoSectionProps) {
  return (
    <SettingsSection title="SEO Settings" description="Search engine optimization defaults">
      <div className="grid gap-4">
        <SettingsField label="Meta Title" description="Default page title">
          <TextInput
            value={settings.metaTitle}
            onChange={(v) => onChange({ metaTitle: v })}
            placeholder="Your Store Name | Tagline"
            maxLength={60}
          />
        </SettingsField>

        <SettingsField label="Meta Description" description="Default page description">
          <TextArea
            value={settings.metaDescription}
            onChange={(v) => onChange({ metaDescription: v })}
            placeholder="Describe your store..."
            rows={2}
            maxLength={160}
          />
        </SettingsField>

        <SettingsField label="Meta Keywords" description="Comma-separated keywords">
          <TagInput
            value={settings.metaKeywords}
            onChange={(v) => onChange({ metaKeywords: v })}
            placeholder="Add keyword..."
            maxTags={10}
          />
        </SettingsField>

        <SettingsField label="Google Analytics ID" description="GA4 Measurement ID">
          <div className="max-w-xs">
            <TextInput
              value={settings.googleAnalyticsId}
              onChange={(v) => onChange({ googleAnalyticsId: v })}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </SettingsField>

        <SettingsField label="Facebook Pixel ID">
          <div className="max-w-xs">
            <TextInput
              value={settings.facebookPixelId}
              onChange={(v) => onChange({ facebookPixelId: v })}
              placeholder="XXXXXXXXXXXXXXX"
            />
          </div>
        </SettingsField>

        <SettingsField label="Google Tag Manager" description="GTM Container ID">
          <div className="max-w-xs">
            <TextInput
              value={settings.googleTagManagerId}
              onChange={(v) => onChange({ googleTagManagerId: v })}
              placeholder="GTM-XXXXXXX"
            />
          </div>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
