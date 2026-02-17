import type { FormEvent } from 'react';
import { StoreInfoSection } from './StoreInfoSection';
import { RegionalSection } from './RegionalSection';
import { FeaturesSection } from './FeaturesSection';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import type { StoreSettings } from '../../../types';

interface GeneralTabProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function GeneralTab({ settings, onChange, onSave, isSaving }: GeneralTabProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StoreInfoSection settings={settings} onChange={onChange} />
      <RegionalSection settings={settings} onChange={onChange} />
      <FeaturesSection settings={settings} onChange={onChange} />

      <div className="flex justify-end pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
