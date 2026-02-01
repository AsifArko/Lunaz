import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsField } from '../../shared/SettingsField';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsDivider } from '../../shared/SettingsDivider';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { SettingsCard } from '../../shared/SettingsCard';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import { Toggle } from '../../form/Toggle';
import type { PaymentSettings, PaymentGateways } from '../../../types';
import { DEFAULT_PAYMENT_SETTINGS, DEFAULT_PAYMENT_GATEWAYS } from '../../../utils/defaults';

export function PaymentTab() {
  const [payments, setPayments] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [gateways, setGateways] = useState<PaymentGateways>(DEFAULT_PAYMENT_GATEWAYS);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const updatePayment = (key: keyof PaymentSettings, value: unknown) => {
    setPayments((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <SettingsSection title="Payment Methods" description="Configure accepted payment methods">
        <div className="space-y-4">
          <SettingsCard variant="muted">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Accept cash when order is delivered</p>
                </div>
              </div>
              <Toggle
                checked={payments.cashOnDelivery}
                onChange={(v) => updatePayment('cashOnDelivery', v)}
              />
            </div>
            {payments.cashOnDelivery && (
              <TextArea
                value={payments.codInstructions}
                onChange={(v) => updatePayment('codInstructions', v)}
                placeholder="Instructions for cash on delivery..."
                rows={2}
              />
            )}
          </SettingsCard>

          <SettingsCard variant="muted">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-500">Direct bank transfer payment</p>
                </div>
              </div>
              <Toggle
                checked={payments.bankTransfer}
                onChange={(v) => updatePayment('bankTransfer', v)}
              />
            </div>
            {payments.bankTransfer && (
              <TextArea
                value={payments.bankTransferInstructions}
                onChange={(v) => updatePayment('bankTransferInstructions', v)}
                placeholder="Bank transfer instructions and details..."
                rows={2}
              />
            )}
          </SettingsCard>

          <SettingsCard variant="muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-pink-600 font-bold text-xs">bKash</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">bKash</p>
                  <p className="text-xs text-gray-500">Mobile payment via bKash</p>
                </div>
              </div>
              <Toggle checked={payments.bkash} onChange={(v) => updatePayment('bkash', v)} />
            </div>
            {payments.bkash && (
              <div className="mt-3">
                <TextInput
                  value={payments.bkashMerchantNumber}
                  onChange={(v) => updatePayment('bkashMerchantNumber', v)}
                  placeholder="Merchant number"
                />
              </div>
            )}
          </SettingsCard>

          <SettingsCard variant="muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">Nagad</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nagad</p>
                  <p className="text-xs text-gray-500">Mobile payment via Nagad</p>
                </div>
              </div>
              <Toggle checked={payments.nagad} onChange={(v) => updatePayment('nagad', v)} />
            </div>
            {payments.nagad && (
              <div className="mt-3">
                <TextInput
                  value={payments.nagadMerchantNumber}
                  onChange={(v) => updatePayment('nagadMerchantNumber', v)}
                  placeholder="Merchant number"
                />
              </div>
            )}
          </SettingsCard>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection
        title="Payment Gateways"
        description="Configure payment gateway integrations"
        badge="Pro"
        badgeVariant="beta"
      >
        <div className="space-y-4">
          <SettingsCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-[10px]">SSL</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">SSLCommerz</p>
                  <p className="text-xs text-gray-500">Bangladesh's leading payment gateway</p>
                </div>
              </div>
              <Toggle
                checked={gateways.sslcommerz.enabled}
                onChange={(v) =>
                  setGateways((prev) => ({
                    ...prev,
                    sslcommerz: { ...prev.sslcommerz, enabled: v },
                  }))
                }
              />
            </div>
            {gateways.sslcommerz.enabled && (
              <div className="grid gap-3 pt-3 border-t border-gray-100">
                <SettingsField label="Store ID" horizontal={false}>
                  <TextInput
                    value={gateways.sslcommerz.storeId}
                    onChange={(v) =>
                      setGateways((prev) => ({
                        ...prev,
                        sslcommerz: { ...prev.sslcommerz, storeId: v },
                      }))
                    }
                    placeholder="Your store ID"
                  />
                </SettingsField>
                <SettingsField label="Store Password" horizontal={false}>
                  <TextInput
                    type="password"
                    value={gateways.sslcommerz.storePassword}
                    onChange={(v) =>
                      setGateways((prev) => ({
                        ...prev,
                        sslcommerz: { ...prev.sslcommerz, storePassword: v },
                      }))
                    }
                    placeholder="Your store password"
                  />
                </SettingsField>
                <SettingsToggle
                  label="Sandbox Mode"
                  description="Use test environment"
                  checked={gateways.sslcommerz.sandbox}
                  onChange={(v) =>
                    setGateways((prev) => ({
                      ...prev,
                      sslcommerz: { ...prev.sslcommerz, sandbox: v },
                    }))
                  }
                />
              </div>
            )}
          </SettingsCard>

          <SettingsCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Stripe</p>
                  <p className="text-xs text-gray-500">Accept cards worldwide</p>
                </div>
              </div>
              <Toggle
                checked={gateways.stripe.enabled}
                onChange={(v) =>
                  setGateways((prev) => ({
                    ...prev,
                    stripe: { ...prev.stripe, enabled: v },
                  }))
                }
              />
            </div>
            {gateways.stripe.enabled && (
              <div className="grid gap-3 pt-3 border-t border-gray-100">
                <SettingsField label="Publishable Key" horizontal={false}>
                  <TextInput
                    value={gateways.stripe.publishableKey}
                    onChange={(v) =>
                      setGateways((prev) => ({
                        ...prev,
                        stripe: { ...prev.stripe, publishableKey: v },
                      }))
                    }
                    placeholder="pk_..."
                  />
                </SettingsField>
                <SettingsField label="Secret Key" horizontal={false}>
                  <TextInput
                    type="password"
                    value={gateways.stripe.secretKey}
                    onChange={(v) =>
                      setGateways((prev) => ({
                        ...prev,
                        stripe: { ...prev.stripe, secretKey: v },
                      }))
                    }
                    placeholder="sk_..."
                  />
                </SettingsField>
              </div>
            )}
          </SettingsCard>
        </div>
      </SettingsSection>

      <div className="pt-4">
        <SettingsSaveButton isLoading={isSaving} />
      </div>
    </form>
  );
}
