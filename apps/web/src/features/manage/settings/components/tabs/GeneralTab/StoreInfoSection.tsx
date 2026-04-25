import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsField } from 'manage-settings/components/shared/SettingsField';
import { TextInput } from 'manage-settings/components/form/TextInput';
import { TextArea } from 'manage-settings/components/form/TextArea';
import { FileUpload } from 'manage-settings/components/form/FileUpload';
import type { StoreSettings } from 'manage-settings/types';

interface StoreInfoSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const StoreIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

export function StoreInfoSection({ settings, onChange }: StoreInfoSectionProps) {
  return (
    <SettingsSection
      title="Store Information"
      description="Basic details about your store"
      icon={StoreIcon}
      iconBg="gray"
      variant="card"
    >
      <div className="space-y-5">
        {/* Store name and logo row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <SettingsField label="Store Name" required horizontal={false}>
              <TextInput
                value={settings.storeName}
                onChange={(v) => onChange({ storeName: v })}
                placeholder="Your store name"
              />
            </SettingsField>

            <SettingsField
              label="Description"
              description="Brief description for customers"
              horizontal={false}
            >
              <TextArea
                value={settings.storeDescription}
                onChange={(v) => onChange({ storeDescription: v })}
                rows={3}
                maxLength={500}
              />
            </SettingsField>
          </div>

          <div>
            <SettingsField
              label="Store Logo"
              description="200x60px PNG recommended"
              horizontal={false}
            >
              <FileUpload
                value={settings.logoUrl}
                onChange={() => {}}
                accept="image/png,image/jpeg,image/svg+xml"
                maxSize={2 * 1024 * 1024}
                label="Upload logo"
              />
            </SettingsField>
          </div>
        </div>

        {/* Contact details in 2-column grid */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Contact Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Contact Email" horizontal={false}>
              <TextInput
                type="email"
                value={settings.storeEmail}
                onChange={(v) => onChange({ storeEmail: v })}
                placeholder="hello@example.com"
              />
            </SettingsField>

            <SettingsField label="Support Email" horizontal={false}>
              <TextInput
                type="email"
                value={settings.supportEmail}
                onChange={(v) => onChange({ supportEmail: v })}
                placeholder="support@example.com"
              />
            </SettingsField>

            <SettingsField label="Phone" horizontal={false}>
              <TextInput
                type="tel"
                value={settings.phone}
                onChange={(v) => onChange({ phone: v })}
                placeholder="+880 1234-567890"
              />
            </SettingsField>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
