import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { NumberInput } from '../../form/NumberInput';
import { TextInput } from '../../form/TextInput';
import { Toggle } from '../../form/Toggle';
import type { StoreSettings } from '../../../types';

interface TaxSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const TaxIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
    />
  </svg>
);

export function TaxSection({ settings, onChange }: TaxSectionProps) {
  return (
    <SettingsSection
      title="Tax Settings"
      description="Configure tax rates and display options"
      icon={TaxIcon}
      iconBg="gray"
      variant="card"
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Enable Tax</span>
          <Toggle checked={settings.enableTax} onChange={(v) => onChange({ enableTax: v })} />
        </div>
      }
    >
      {settings.enableTax ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Tax Rate" horizontal={false}>
              <NumberInput
                value={settings.taxRate}
                onChange={(v) => onChange({ taxRate: v })}
                suffix="%"
                min={0}
                max={100}
                step={0.01}
              />
            </SettingsField>

            <SettingsField label="Tax Label" description="e.g., VAT, GST" horizontal={false}>
              <TextInput
                value={settings.taxLabel}
                onChange={(v) => onChange({ taxLabel: v })}
                placeholder="Tax"
              />
            </SettingsField>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Display Options
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SettingsToggle
                label="Included in Prices"
                description="Prices include tax"
                checked={settings.taxIncludedInPrices}
                onChange={(v) => onChange({ taxIncludedInPrices: v })}
              />

              <SettingsToggle
                label="Show in Cart"
                description="Tax breakdown"
                checked={settings.displayTaxInCart}
                onChange={(v) => onChange({ displayTaxInCart: v })}
              />

              <SettingsToggle
                label="Show on Invoices"
                description="Display tax ID"
                checked={settings.showTaxNumber}
                onChange={(v) => onChange({ showTaxNumber: v })}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Tax calculation is disabled</p>
          <p className="text-xs mt-1">Enable tax to configure rates and display options</p>
        </div>
      )}
    </SettingsSection>
  );
}
