import type { FormEvent } from 'react';
import { ShippingRatesSection } from './ShippingRatesSection';
import { TaxSection } from './TaxSection';
import { OrderSettingsSection } from './OrderSettingsSection';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import type { StoreSettings } from '../../../types';

interface ShippingTabProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function ShippingTab({ settings, onChange, onSave, isSaving }: ShippingTabProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ShippingRatesSection settings={settings} onChange={onChange} />
      <TaxSection settings={settings} onChange={onChange} />
      <OrderSettingsSection settings={settings} onChange={onChange} />

      <div className="flex justify-end pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
