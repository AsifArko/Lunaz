import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import type { StoreSettings } from '../../../types';

interface FeaturesSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

export function FeaturesSection({ settings, onChange }: FeaturesSectionProps) {
  return (
    <SettingsSection title="Features">
      <div className="space-y-4">
        <SettingsToggle
          label="Product Reviews"
          description="Allow customers to review products"
          checked={settings.enableReviews}
          onChange={(v) => onChange({ enableReviews: v })}
        />

        <SettingsToggle
          label="Customer Wishlist"
          description="Enable wishlist functionality for customers"
          checked={settings.enableWishlist}
          onChange={(v) => onChange({ enableWishlist: v })}
        />

        <SettingsToggle
          label="Quick View"
          description="Show product quick view in listings"
          checked={settings.enableQuickView}
          onChange={(v) => onChange({ enableQuickView: v })}
        />

        <SettingsToggle
          label="Compare Products"
          description="Enable product comparison feature"
          checked={settings.enableCompare}
          onChange={(v) => onChange({ enableCompare: v })}
        />

        <SettingsToggle
          label="Guest Checkout"
          description="Allow checkout without creating an account"
          checked={settings.allowGuestCheckout}
          onChange={(v) => onChange({ allowGuestCheckout: v })}
        />

        <SettingsToggle
          label="Customer Registration"
          description="Allow new customers to create accounts"
          checked={settings.allowRegistration}
          onChange={(v) => onChange({ allowRegistration: v })}
        />

        <SettingsToggle
          label="Email Verification"
          description="Require email verification for new accounts"
          checked={settings.requireEmailVerification}
          onChange={(v) => onChange({ requireEmailVerification: v })}
        />

        <SettingsToggle
          label="Maintenance Mode"
          description="Show maintenance page to visitors"
          checked={settings.maintenanceMode}
          onChange={(v) => onChange({ maintenanceMode: v })}
        />
      </div>
    </SettingsSection>
  );
}
