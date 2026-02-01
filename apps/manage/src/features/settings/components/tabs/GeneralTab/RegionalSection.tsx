import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SelectInput } from '../../form/SelectInput';
import {
  CURRENCY_OPTIONS,
  CURRENCY_POSITION_OPTIONS,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  DIMENSION_UNIT_OPTIONS,
} from '../../../utils/constants';
import type { StoreSettings } from '../../../types';

interface RegionalSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const GlobeIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

export function RegionalSection({ settings, onChange }: RegionalSectionProps) {
  return (
    <SettingsSection
      title="Regional Settings"
      description="Currency, timezone, and localization preferences"
      icon={GlobeIcon}
      iconBg="gray"
      variant="card"
    >
      <div className="space-y-5">
        {/* Currency settings */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Currency</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Currency" horizontal={false}>
              <SelectInput
                value={settings.currency}
                onChange={(v) => onChange({ currency: v })}
                options={CURRENCY_OPTIONS}
              />
            </SettingsField>

            <SettingsField label="Currency Position" horizontal={false}>
              <SelectInput
                value={settings.currencyPosition}
                onChange={(v) => onChange({ currencyPosition: v as 'before' | 'after' })}
                options={CURRENCY_POSITION_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>

        {/* Date & Time */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Date & Time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettingsField label="Timezone" horizontal={false}>
              <SelectInput
                value={settings.timezone}
                onChange={(v) => onChange({ timezone: v })}
                options={TIMEZONE_OPTIONS}
              />
            </SettingsField>

            <SettingsField label="Date Format" horizontal={false}>
              <SelectInput
                value={settings.dateFormat}
                onChange={(v) => onChange({ dateFormat: v })}
                options={DATE_FORMAT_OPTIONS}
              />
            </SettingsField>

            <SettingsField label="Time Format" horizontal={false}>
              <SelectInput
                value={settings.timeFormat}
                onChange={(v) => onChange({ timeFormat: v as '12h' | '24h' })}
                options={TIME_FORMAT_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>

        {/* Units & Language */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Units & Language
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettingsField label="Language" horizontal={false}>
              <SelectInput
                value={settings.defaultLanguage}
                onChange={(v) => onChange({ defaultLanguage: v })}
                options={LANGUAGE_OPTIONS}
              />
            </SettingsField>

            <SettingsField label="Weight Unit" horizontal={false}>
              <SelectInput
                value={settings.weightUnit}
                onChange={(v) => onChange({ weightUnit: v as 'kg' | 'lb' | 'g' | 'oz' })}
                options={WEIGHT_UNIT_OPTIONS}
              />
            </SettingsField>

            <SettingsField label="Dimension Unit" horizontal={false}>
              <SelectInput
                value={settings.dimensionUnit}
                onChange={(v) => onChange({ dimensionUnit: v as 'cm' | 'in' | 'm' | 'ft' })}
                options={DIMENSION_UNIT_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
