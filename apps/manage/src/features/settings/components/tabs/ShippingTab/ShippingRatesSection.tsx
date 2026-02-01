import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { NumberInput } from '../../form/NumberInput';
import { SelectInput } from '../../form/SelectInput';
import { SHIPPING_CALCULATION_OPTIONS } from '../../../utils/constants';
import type { StoreSettings } from '../../../types';

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
            Delivery Methods
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettingsField label="Standard Shipping" horizontal={false}>
              <NumberInput
                value={settings.standardShippingRate}
                onChange={(v) => onChange({ standardShippingRate: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>

            <SettingsField label="Express Shipping" horizontal={false}>
              <NumberInput
                value={settings.expressShippingRate}
                onChange={(v) => onChange({ expressShippingRate: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>

            <SettingsField label="Same Day Delivery" horizontal={false}>
              <NumberInput
                value={settings.sameDayShippingRate}
                onChange={(v) => onChange({ sameDayShippingRate: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Free Shipping & Calculation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="Free Shipping Above"
              description="0 to disable"
              horizontal={false}
            >
              <NumberInput
                value={settings.freeShippingThreshold}
                onChange={(v) => onChange({ freeShippingThreshold: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>

            <SettingsField
              label="Calculate By"
              description="Rate calculation method"
              horizontal={false}
            >
              <SelectInput
                value={settings.shippingCalculation}
                onChange={(v) =>
                  onChange({ shippingCalculation: v as 'flat' | 'weight' | 'price' | 'items' })
                }
                options={SHIPPING_CALCULATION_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
