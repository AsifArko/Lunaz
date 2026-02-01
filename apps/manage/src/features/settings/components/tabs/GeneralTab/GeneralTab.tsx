import type { FormEvent } from 'react';
import { StoreInfoSection } from './StoreInfoSection';
import { RegionalSection } from './RegionalSection';
import { FeaturesSection } from './FeaturesSection';
import { SeoSection } from './SeoSection';
import { SettingsDivider } from '../../shared/SettingsDivider';
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <StoreInfoSection settings={settings} onChange={onChange} />

      <SettingsDivider />

      <RegionalSection settings={settings} onChange={onChange} />

      <SettingsDivider />

      <FeaturesSection settings={settings} onChange={onChange} />

      <SettingsDivider />

      <SeoSection settings={settings} onChange={onChange} />

      <div className="pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
