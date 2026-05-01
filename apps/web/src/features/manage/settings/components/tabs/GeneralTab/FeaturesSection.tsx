import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { Toggle } from 'manage-settings/components/form/Toggle';
import type { StoreSettings } from 'manage-settings/types';

interface FeaturesSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const FeaturesIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function FeatureItem({ icon, iconBg, label, description, checked, onChange }: FeatureItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export function FeaturesSection({ settings, onChange }: FeaturesSectionProps) {
  return (
    <SettingsSection
      title="Store Features"
      description="Enable or disable store functionality"
      icon={FeaturesIcon}
      iconBg="gray"
      collapsible
      defaultOpen={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Product Reviews"
          description="Allow customers to review"
          checked={settings.enableReviews}
          onChange={(v) => onChange({ enableReviews: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Customer Wishlist"
          description="Save favorite products"
          checked={settings.enableWishlist}
          onChange={(v) => onChange({ enableWishlist: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Quick View"
          description="Preview in listings"
          checked={settings.enableQuickView}
          onChange={(v) => onChange({ enableQuickView: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Compare Products"
          description="Side-by-side comparison"
          checked={settings.enableCompare}
          onChange={(v) => onChange({ enableCompare: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Guest Checkout"
          description="No account required"
          checked={settings.allowGuestCheckout}
          onChange={(v) => onChange({ allowGuestCheckout: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Customer Registration"
          description="Allow new accounts"
          checked={settings.allowRegistration}
          onChange={(v) => onChange({ allowRegistration: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Email Verification"
          description="Verify new accounts"
          checked={settings.requireEmailVerification}
          onChange={(v) => onChange({ requireEmailVerification: v })}
        />

        <FeatureItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          iconBg="bg-gray-100 text-gray-500"
          label="Maintenance Mode"
          description="Show maintenance page"
          checked={settings.maintenanceMode}
          onChange={(v) => onChange({ maintenanceMode: v })}
        />
      </div>
    </SettingsSection>
  );
}
