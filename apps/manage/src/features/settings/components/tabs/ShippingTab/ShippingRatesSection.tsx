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

export function ShippingRatesSection({ settings, onChange }: ShippingRatesSectionProps) {
  return (
    <SettingsSection title="Shipping Rates">
      <div className="grid gap-4">
        <SettingsField label="Free Shipping Above" description="Set to 0 to disable free shipping">
          <div className="max-w-xs">
            <NumberInput
              value={settings.freeShippingThreshold}
              onChange={(v) => onChange({ freeShippingThreshold: v })}
              prefix="৳"
              min={0}
            />
          </div>
        </SettingsField>

        <SettingsField label="Standard Shipping">
          <div className="max-w-xs">
            <NumberInput
              value={settings.standardShippingRate}
              onChange={(v) => onChange({ standardShippingRate: v })}
              prefix="৳"
              min={0}
            />
          </div>
        </SettingsField>

        <SettingsField label="Express Shipping">
          <div className="max-w-xs">
            <NumberInput
              value={settings.expressShippingRate}
              onChange={(v) => onChange({ expressShippingRate: v })}
              prefix="৳"
              min={0}
            />
          </div>
        </SettingsField>

        <SettingsField label="Same Day Delivery">
          <div className="max-w-xs">
            <NumberInput
              value={settings.sameDayShippingRate}
              onChange={(v) => onChange({ sameDayShippingRate: v })}
              prefix="৳"
              min={0}
            />
          </div>
        </SettingsField>

        <SettingsField label="Calculate By" description="How shipping rates are calculated">
          <div className="max-w-xs">
            <SelectInput
              value={settings.shippingCalculation}
              onChange={(v) =>
                onChange({ shippingCalculation: v as 'flat' | 'weight' | 'price' | 'items' })
              }
              options={SHIPPING_CALCULATION_OPTIONS}
            />
          </div>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
