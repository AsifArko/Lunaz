import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { NumberInput } from '../../form/NumberInput';
import { TextInput } from '../../form/TextInput';
import type { StoreSettings } from '../../../types';

interface TaxSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

export function TaxSection({ settings, onChange }: TaxSectionProps) {
  return (
    <SettingsSection title="Tax Settings">
      <div className="space-y-4">
        <SettingsToggle
          label="Enable Tax"
          description="Apply tax to orders"
          checked={settings.enableTax}
          onChange={(v) => onChange({ enableTax: v })}
        />

        {settings.enableTax && (
          <div className="grid gap-4 mt-4 pl-0">
            <SettingsField label="Tax Rate">
              <div className="max-w-xs">
                <NumberInput
                  value={settings.taxRate}
                  onChange={(v) => onChange({ taxRate: v })}
                  suffix="%"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </div>
            </SettingsField>

            <SettingsField label="Tax Label" description="e.g., VAT, GST, Sales Tax">
              <div className="max-w-xs">
                <TextInput
                  value={settings.taxLabel}
                  onChange={(v) => onChange({ taxLabel: v })}
                  placeholder="Tax"
                />
              </div>
            </SettingsField>

            <SettingsToggle
              label="Tax Included in Prices"
              description="Product prices already include tax"
              checked={settings.taxIncludedInPrices}
              onChange={(v) => onChange({ taxIncludedInPrices: v })}
            />

            <SettingsToggle
              label="Display Tax in Cart"
              description="Show tax breakdown in cart"
              checked={settings.displayTaxInCart}
              onChange={(v) => onChange({ displayTaxInCart: v })}
            />

            <SettingsToggle
              label="Show Tax Number on Invoices"
              description="Display your tax ID on invoices"
              checked={settings.showTaxNumber}
              onChange={(v) => onChange({ showTaxNumber: v })}
            />
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
