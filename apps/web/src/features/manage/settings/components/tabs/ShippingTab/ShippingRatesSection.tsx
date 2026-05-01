import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsField } from 'manage-settings/components/shared/SettingsField';
import { NumberInput } from 'manage-settings/components/form/NumberInput';
import type { StoreSettings } from 'manage-settings/types';

interface ShippingRatesSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const TruckIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 17h8M8 17v-4m8 4v-4m-8 0h8m-8 0V9m8 4V9m0 0H8m8 0V5a1 1 0 00-1-1H9a1 1 0 00-1 1v4m8 0h2a1 1 0 011 1v3m-3-4h3m-3 0v4"
    />
  </svg>
);

export function ShippingRatesSection({ settings, onChange }: ShippingRatesSectionProps) {
  return (
    <SettingsSection
      title="Shipping Rates"
      description="Configure delivery options and pricing"
      icon={TruckIcon}
      iconBg="gray"
      variant="card"
    >
      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Shipping Cost (Flat Rate)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="Inside Dhaka"
              description="Delivery within Dhaka city"
              horizontal={false}
            >
              <NumberInput
                value={settings.shippingInsideDhaka}
                onChange={(v) => onChange({ shippingInsideDhaka: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>

            <SettingsField
              label="Outside Dhaka"
              description="Delivery outside Dhaka"
              horizontal={false}
            >
              <NumberInput
                value={settings.shippingOutsideDhaka}
                onChange={(v) => onChange({ shippingOutsideDhaka: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
