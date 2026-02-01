import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import { FileUpload } from '../../form/FileUpload';
import type { StoreSettings } from '../../../types';

interface StoreInfoSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

export function StoreInfoSection({ settings, onChange }: StoreInfoSectionProps) {
  return (
    <SettingsSection title="Store Information">
      <div className="grid gap-4">
        <SettingsField label="Store Name" required>
          <TextInput
            value={settings.storeName}
            onChange={(v) => onChange({ storeName: v })}
            placeholder="Your store name"
          />
        </SettingsField>

        <SettingsField label="Description" description="Brief description for SEO">
          <TextArea
            value={settings.storeDescription}
            onChange={(v) => onChange({ storeDescription: v })}
            rows={2}
            maxLength={500}
          />
        </SettingsField>

        <SettingsField label="Contact Email">
          <TextInput
            type="email"
            value={settings.storeEmail}
            onChange={(v) => onChange({ storeEmail: v })}
            placeholder="hello@example.com"
          />
        </SettingsField>

        <SettingsField label="Support Email">
          <TextInput
            type="email"
            value={settings.supportEmail}
            onChange={(v) => onChange({ supportEmail: v })}
            placeholder="support@example.com"
          />
        </SettingsField>

        <SettingsField label="Phone">
          <TextInput
            type="tel"
            value={settings.phone}
            onChange={(v) => onChange({ phone: v })}
            placeholder="+880 1234-567890"
          />
        </SettingsField>

        <SettingsField label="Store Logo" description="Recommended: 200x60px PNG">
          <div className="max-w-xs">
            <FileUpload
              value={settings.logoUrl}
              onChange={() => {}}
              accept="image/png,image/jpeg,image/svg+xml"
              maxSize={2 * 1024 * 1024}
              label="Upload logo"
            />
          </div>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
