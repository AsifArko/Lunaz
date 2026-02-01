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

export function RegionalSection({ settings, onChange }: RegionalSectionProps) {
  return (
    <SettingsSection title="Regional Settings">
      <div className="grid gap-4">
        <SettingsField label="Currency">
          <div className="max-w-xs">
            <SelectInput
              value={settings.currency}
              onChange={(v) => onChange({ currency: v })}
              options={CURRENCY_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Currency Position">
          <div className="max-w-xs">
            <SelectInput
              value={settings.currencyPosition}
              onChange={(v) => onChange({ currencyPosition: v as 'before' | 'after' })}
              options={CURRENCY_POSITION_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Timezone">
          <div className="max-w-xs">
            <SelectInput
              value={settings.timezone}
              onChange={(v) => onChange({ timezone: v })}
              options={TIMEZONE_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Date Format">
          <div className="max-w-xs">
            <SelectInput
              value={settings.dateFormat}
              onChange={(v) => onChange({ dateFormat: v })}
              options={DATE_FORMAT_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Time Format">
          <div className="max-w-xs">
            <SelectInput
              value={settings.timeFormat}
              onChange={(v) => onChange({ timeFormat: v as '12h' | '24h' })}
              options={TIME_FORMAT_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Language">
          <div className="max-w-xs">
            <SelectInput
              value={settings.defaultLanguage}
              onChange={(v) => onChange({ defaultLanguage: v })}
              options={LANGUAGE_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Weight Unit">
          <div className="max-w-xs">
            <SelectInput
              value={settings.weightUnit}
              onChange={(v) => onChange({ weightUnit: v as 'kg' | 'lb' | 'g' | 'oz' })}
              options={WEIGHT_UNIT_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Dimension Unit">
          <div className="max-w-xs">
            <SelectInput
              value={settings.dimensionUnit}
              onChange={(v) => onChange({ dimensionUnit: v as 'cm' | 'in' | 'm' | 'ft' })}
              options={DIMENSION_UNIT_OPTIONS}
            />
          </div>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
