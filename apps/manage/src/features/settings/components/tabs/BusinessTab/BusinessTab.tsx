import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import { SelectInput } from '../../form/SelectInput';
import { COUNTRY_OPTIONS, BUSINESS_TYPE_OPTIONS, INDUSTRY_OPTIONS } from '../../../utils/constants';
import type { BusinessInfo } from '../../../types';
import { DEFAULT_BUSINESS_INFO } from '../../../utils/defaults';

interface BusinessTabProps {
  onSave?: () => void;
}

export function BusinessTab({ onSave }: BusinessTabProps) {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onSave?.();
  };

  const updateBusiness = (partial: Partial<BusinessInfo>) => {
    setBusinessInfo((prev) => ({ ...prev, ...partial }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <SettingsSection
        title="Business Information"
        description="Used for invoices and legal compliance"
      >
        <div className="grid gap-4">
          <SettingsField label="Legal Business Name">
            <TextInput
              value={businessInfo.businessName}
              onChange={(v) => updateBusiness({ businessName: v })}
              placeholder="Your Company Ltd."
            />
          </SettingsField>

          <SettingsField label="Trading Name" description="Display name (if different)">
            <TextInput
              value={businessInfo.tradingName}
              onChange={(v) => updateBusiness({ tradingName: v })}
              placeholder="Optional"
            />
          </SettingsField>

          <SettingsField label="Business Type">
            <div className="max-w-xs">
              <SelectInput
                value={businessInfo.businessType}
                onChange={(v) => updateBusiness({ businessType: v })}
                options={[{ value: '', label: 'Select type...' }, ...BUSINESS_TYPE_OPTIONS]}
              />
            </div>
          </SettingsField>

          <SettingsField label="Industry">
            <div className="max-w-xs">
              <SelectInput
                value={businessInfo.industry}
                onChange={(v) => updateBusiness({ industry: v })}
                options={[{ value: '', label: 'Select industry...' }, ...INDUSTRY_OPTIONS]}
              />
            </div>
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Business Address">
        <div className="grid gap-4">
          <SettingsField label="Street Address">
            <TextArea
              value={businessInfo.businessAddress}
              onChange={(v) => updateBusiness({ businessAddress: v })}
              rows={2}
              placeholder="Street address"
            />
          </SettingsField>

          <SettingsField label="City / State">
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                value={businessInfo.businessCity}
                onChange={(v) => updateBusiness({ businessCity: v })}
                placeholder="City"
              />
              <TextInput
                value={businessInfo.businessState}
                onChange={(v) => updateBusiness({ businessState: v })}
                placeholder="State / Division"
              />
            </div>
          </SettingsField>

          <SettingsField label="Postal Code / Country">
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                value={businessInfo.businessPostalCode}
                onChange={(v) => updateBusiness({ businessPostalCode: v })}
                placeholder="Postal code"
              />
              <SelectInput
                value={businessInfo.businessCountry}
                onChange={(v) => updateBusiness({ businessCountry: v })}
                options={COUNTRY_OPTIONS}
              />
            </div>
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Tax Information">
        <div className="grid gap-4">
          <SettingsField label="VAT / Tax ID">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.vatNumber}
                onChange={(v) => updateBusiness({ vatNumber: v })}
                placeholder="Optional"
              />
            </div>
          </SettingsField>

          <SettingsField label="BIN Number" description="Bangladesh BIN">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.binNumber}
                onChange={(v) => updateBusiness({ binNumber: v })}
                placeholder="Optional"
              />
            </div>
          </SettingsField>

          <SettingsField label="TIN Number" description="Tax Identification Number">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.tinNumber}
                onChange={(v) => updateBusiness({ tinNumber: v })}
                placeholder="Optional"
              />
            </div>
          </SettingsField>

          <SettingsField label="Registration No." description="Business registration number">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.registrationNumber}
                onChange={(v) => updateBusiness({ registrationNumber: v })}
                placeholder="Optional"
              />
            </div>
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Banking Information" badge="New" badgeVariant="new">
        <div className="grid gap-4">
          <SettingsField label="Bank Name">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.bankName}
                onChange={(v) => updateBusiness({ bankName: v })}
                placeholder="Bank name"
              />
            </div>
          </SettingsField>

          <SettingsField label="Account Name">
            <TextInput
              value={businessInfo.bankAccountName}
              onChange={(v) => updateBusiness({ bankAccountName: v })}
              placeholder="Account holder name"
            />
          </SettingsField>

          <SettingsField label="Account Number">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.bankAccountNumber}
                onChange={(v) => updateBusiness({ bankAccountNumber: v })}
                placeholder="Account number"
              />
            </div>
          </SettingsField>

          <SettingsField label="Routing / Branch">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.bankRoutingNumber}
                onChange={(v) => updateBusiness({ bankRoutingNumber: v })}
                placeholder="Routing number"
              />
            </div>
          </SettingsField>

          <SettingsField label="SWIFT Code" description="For international transfers">
            <div className="max-w-xs">
              <TextInput
                value={businessInfo.bankSwiftCode}
                onChange={(v) => updateBusiness({ bankSwiftCode: v })}
                placeholder="SWIFT code"
              />
            </div>
          </SettingsField>
        </div>
      </SettingsSection>

      <div className="pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
