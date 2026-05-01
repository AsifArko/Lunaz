import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsField } from 'manage-settings/components/shared/SettingsField';
import { SettingsToggle } from 'manage-settings/components/shared/SettingsToggle';
import { TextInput } from 'manage-settings/components/form/TextInput';
import { NumberInput } from 'manage-settings/components/form/NumberInput';
import { SelectInput } from 'manage-settings/components/form/SelectInput';
import { OUT_OF_STOCK_DISPLAY_OPTIONS } from 'manage-settings/utils/constants';
import type { StoreSettings } from 'manage-settings/types';

interface OrderSettingsSectionProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
}

const OrderIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

export function OrderSettingsSection({ settings, onChange }: OrderSettingsSectionProps) {
  return (
    <SettingsSection
      title="Order & Inventory Settings"
      description="Order numbering and stock management"
      icon={OrderIcon}
      iconBg="gray"
      variant="card"
    >
      <div className="space-y-5">
        {/* Order Numbering */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Order Numbering
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Order Prefix" description="e.g., ORD-0001" horizontal={false}>
              <TextInput
                value={settings.orderPrefix}
                onChange={(v) => onChange({ orderPrefix: v })}
                placeholder="ORD"
                maxLength={10}
              />
            </SettingsField>

            <SettingsField label="Starting Number" horizontal={false}>
              <NumberInput
                value={settings.orderNumberStart}
                onChange={(v) => onChange({ orderNumberStart: v })}
                min={1}
                step={1}
              />
            </SettingsField>
          </div>
        </div>

        {/* Order Limits */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Order Limits
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="Minimum Order Amount"
              description="0 for no minimum"
              horizontal={false}
            >
              <NumberInput
                value={settings.minimumOrderAmount}
                onChange={(v) => onChange({ minimumOrderAmount: v })}
                prefix="৳"
                min={0}
              />
            </SettingsField>

            <SettingsField label="Maximum Items" horizontal={false}>
              <NumberInput
                value={settings.maximumOrderItems}
                onChange={(v) => onChange({ maximumOrderItems: v })}
                min={1}
                max={1000}
                step={1}
              />
            </SettingsField>
          </div>
        </div>

        {/* Stock Management */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Stock Management
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Low Stock Threshold" horizontal={false}>
              <NumberInput
                value={settings.lowStockThreshold}
                onChange={(v) => onChange({ lowStockThreshold: v })}
                min={0}
                step={1}
              />
            </SettingsField>

            <SettingsField label="Out of Stock Display" horizontal={false}>
              <SelectInput
                value={settings.outOfStockDisplay}
                onChange={(v) => onChange({ outOfStockDisplay: v as 'hide' | 'show' })}
                options={OUT_OF_STOCK_DISPLAY_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Order Processing
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingsToggle
              label="Auto-confirm Orders"
              description="After payment received"
              checked={settings.autoConfirmOrders}
              onChange={(v) => onChange({ autoConfirmOrders: v })}
            />

            <SettingsToggle
              label="Allow Backorders"
              description="Order out-of-stock items"
              checked={settings.allowBackorder}
              onChange={(v) => onChange({ allowBackorder: v })}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
