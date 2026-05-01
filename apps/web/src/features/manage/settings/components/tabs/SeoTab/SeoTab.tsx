import { type FormEvent } from 'react';
import { SeoSection } from 'manage-settings/components/tabs/GeneralTab/SeoSection';
import { SettingsSaveButton } from 'manage-settings/components/shared/SettingsSaveButton';
import type { StoreSettings } from 'manage-settings/types';

interface SeoTabProps {
  settings: StoreSettings;
  onChange: (partial: Partial<StoreSettings>) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function SeoTab({ settings, onChange, onSave, isSaving }: SeoTabProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SeoSection settings={settings} onChange={onChange} />

      <div className="flex justify-end pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
