import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { TextInput } from '../../form/TextInput';
import { NumberInput } from '../../form/NumberInput';
import { SelectInput } from '../../form/SelectInput';
import { OUT_OF_STOCK_DISPLAY_OPTIONS } from '../../../utils/constants';
import type { StoreSettings } from '../../../types';

interface OrderSettingsSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

export function OrderSettingsSection({ settings, onChange }: OrderSettingsSectionProps) {
  return (
    <SettingsSection title="Order Settings">
      <div className="grid gap-4">
        <SettingsField label="Order Prefix" description="e.g., ORD-0001">
          <div className="max-w-xs">
            <TextInput
              value={settings.orderPrefix}
              onChange={(v) => onChange({ orderPrefix: v })}
              placeholder="ORD"
              maxLength={10}
            />
          </div>
        </SettingsField>

        <SettingsField label="Order Number Start" description="Starting order number">
          <div className="max-w-xs">
            <NumberInput
              value={settings.orderNumberStart}
              onChange={(v) => onChange({ orderNumberStart: v })}
              min={1}
              step={1}
            />
          </div>
        </SettingsField>

        <SettingsField label="Low Stock Threshold" description="Alert when stock falls below">
          <div className="max-w-xs">
            <NumberInput
              value={settings.lowStockThreshold}
              onChange={(v) => onChange({ lowStockThreshold: v })}
              min={0}
              step={1}
            />
          </div>
        </SettingsField>

        <SettingsField label="Out of Stock Display">
          <div className="max-w-xs">
            <SelectInput
              value={settings.outOfStockDisplay}
              onChange={(v) => onChange({ outOfStockDisplay: v as 'hide' | 'show' })}
              options={OUT_OF_STOCK_DISPLAY_OPTIONS}
            />
          </div>
        </SettingsField>

        <SettingsField label="Minimum Order Amount" description="Set to 0 for no minimum">
          <div className="max-w-xs">
            <NumberInput
              value={settings.minimumOrderAmount}
              onChange={(v) => onChange({ minimumOrderAmount: v })}
              prefix="৳"
              min={0}
            />
          </div>
        </SettingsField>

        <SettingsField label="Maximum Items Per Order">
          <div className="max-w-xs">
            <NumberInput
              value={settings.maximumOrderItems}
              onChange={(v) => onChange({ maximumOrderItems: v })}
              min={1}
              max={1000}
              step={1}
            />
          </div>
        </SettingsField>

        <div className="space-y-4 pt-2">
          <SettingsToggle
            label="Auto-confirm Orders"
            description="Automatically confirm orders after payment"
            checked={settings.autoConfirmOrders}
            onChange={(v) => onChange({ autoConfirmOrders: v })}
          />

          <SettingsToggle
            label="Allow Backorders"
            description="Allow orders when products are out of stock"
            checked={settings.allowBackorder}
            onChange={(v) => onChange({ allowBackorder: v })}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
