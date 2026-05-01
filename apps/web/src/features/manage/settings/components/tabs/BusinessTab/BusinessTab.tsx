import type { FormEvent } from 'react';
import { SettingsSection } from 'manage-settings/components/shared/SettingsSection';
import { SettingsField } from 'manage-settings/components/shared/SettingsField';
import { SettingsSaveButton } from 'manage-settings/components/shared/SettingsSaveButton';
import { TextInput } from 'manage-settings/components/form/TextInput';
import { TextArea } from 'manage-settings/components/form/TextArea';
import { SelectInput } from 'manage-settings/components/form/SelectInput';
import {
  COUNTRY_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from 'manage-settings/utils/constants';
import type { BusinessInfo } from 'manage-settings/types';

interface BusinessTabProps {
  business: BusinessInfo;
  onChange: (v: BusinessInfo | ((prev: BusinessInfo) => BusinessInfo)) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const BusinessIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const AddressIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

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

const BankIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

export function BusinessTab({
  business: businessInfo,
  onChange,
  onSave,
  isSaving,
}: BusinessTabProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  const updateBusiness = (partial: Partial<BusinessInfo>) => {
    onChange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <SettingsSection
        title="Business Information"
        description="Legal details for invoices and compliance"
        icon={BusinessIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Legal Business Name" horizontal={false}>
              <TextInput
                value={businessInfo.businessName}
                onChange={(v) => updateBusiness({ businessName: v })}
                placeholder="Your Company Ltd."
              />
            </SettingsField>

            <SettingsField
              label="Trading Name"
              description="Display name if different"
              horizontal={false}
            >
              <TextInput
                value={businessInfo.tradingName}
                onChange={(v) => updateBusiness({ tradingName: v })}
                placeholder="Optional"
              />
            </SettingsField>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Classification
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingsField label="Business Type" horizontal={false}>
                <SelectInput
                  value={businessInfo.businessType}
                  onChange={(v) => updateBusiness({ businessType: v })}
                  options={[{ value: '', label: 'Select type...' }, ...BUSINESS_TYPE_OPTIONS]}
                />
              </SettingsField>

              <SettingsField label="Industry" horizontal={false}>
                <SelectInput
                  value={businessInfo.industry}
                  onChange={(v) => updateBusiness({ industry: v })}
                  options={[{ value: '', label: 'Select industry...' }, ...INDUSTRY_OPTIONS]}
                />
              </SettingsField>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Business Address */}
      <SettingsSection
        title="Business Address"
        description="Physical location for official correspondence"
        icon={AddressIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-4">
          <SettingsField label="Street Address" horizontal={false}>
            <TextArea
              value={businessInfo.businessAddress}
              onChange={(v) => updateBusiness({ businessAddress: v })}
              rows={2}
              placeholder="Enter street address"
            />
          </SettingsField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="City" horizontal={false}>
              <TextInput
                value={businessInfo.businessCity}
                onChange={(v) => updateBusiness({ businessCity: v })}
                placeholder="City"
              />
            </SettingsField>

            <SettingsField label="State / Division" horizontal={false}>
              <TextInput
                value={businessInfo.businessState}
                onChange={(v) => updateBusiness({ businessState: v })}
                placeholder="State / Division"
              />
            </SettingsField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Postal Code" horizontal={false}>
              <TextInput
                value={businessInfo.businessPostalCode}
                onChange={(v) => updateBusiness({ businessPostalCode: v })}
                placeholder="Postal code"
              />
            </SettingsField>

            <SettingsField label="Country" horizontal={false}>
              <SelectInput
                value={businessInfo.businessCountry}
                onChange={(v) => updateBusiness({ businessCountry: v })}
                options={COUNTRY_OPTIONS}
              />
            </SettingsField>
          </div>
        </div>
      </SettingsSection>

      {/* Tax Information */}
      <SettingsSection
        title="Tax Information"
        description="Tax registration and identification numbers"
        icon={TaxIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField label="VAT / Tax ID" horizontal={false}>
            <TextInput
              value={businessInfo.vatNumber}
              onChange={(v) => updateBusiness({ vatNumber: v })}
              placeholder="VAT number"
            />
          </SettingsField>

          <SettingsField label="BIN Number" description="Bangladesh BIN" horizontal={false}>
            <TextInput
              value={businessInfo.binNumber}
              onChange={(v) => updateBusiness({ binNumber: v })}
              placeholder="BIN number"
            />
          </SettingsField>

          <SettingsField label="TIN Number" description="Tax Identification" horizontal={false}>
            <TextInput
              value={businessInfo.tinNumber}
              onChange={(v) => updateBusiness({ tinNumber: v })}
              placeholder="TIN number"
            />
          </SettingsField>

          <SettingsField
            label="Registration No."
            description="Business registration"
            horizontal={false}
          >
            <TextInput
              value={businessInfo.registrationNumber}
              onChange={(v) => updateBusiness({ registrationNumber: v })}
              placeholder="Registration number"
            />
          </SettingsField>
        </div>
      </SettingsSection>

      {/* Banking Information */}
      <SettingsSection
        title="Banking Information"
        description="Bank account details for payments"
        icon={BankIcon}
        iconBg="gray"
        variant="card"
        collapsible
        defaultOpen={false}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Bank Name" horizontal={false}>
              <TextInput
                value={businessInfo.bankName}
                onChange={(v) => updateBusiness({ bankName: v })}
                placeholder="Select or enter bank name"
              />
            </SettingsField>

            <SettingsField label="Account Name" horizontal={false}>
              <TextInput
                value={businessInfo.bankAccountName}
                onChange={(v) => updateBusiness({ bankAccountName: v })}
                placeholder="Account holder name"
              />
            </SettingsField>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Account Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SettingsField label="Account Number" horizontal={false}>
                <TextInput
                  value={businessInfo.bankAccountNumber}
                  onChange={(v) => updateBusiness({ bankAccountNumber: v })}
                  placeholder="Account number"
                />
              </SettingsField>

              <SettingsField label="Routing / Branch" horizontal={false}>
                <TextInput
                  value={businessInfo.bankRoutingNumber}
                  onChange={(v) => updateBusiness({ bankRoutingNumber: v })}
                  placeholder="Routing number"
                />
              </SettingsField>

              <SettingsField label="SWIFT Code" description="International" horizontal={false}>
                <TextInput
                  value={businessInfo.bankSwiftCode}
                  onChange={(v) => updateBusiness({ bankSwiftCode: v })}
                  placeholder="SWIFT code"
                />
              </SettingsField>
            </div>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end pt-4">
        <SettingsSaveButton isLoading={isSaving} label="Save changes" type="submit" />
      </div>
    </form>
  );
}
