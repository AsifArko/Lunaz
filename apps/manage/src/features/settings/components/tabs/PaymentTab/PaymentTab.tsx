import { useState, type FormEvent } from 'react';
import { SettingsSection } from '../../shared/SettingsSection';
import { SettingsToggle } from '../../shared/SettingsToggle';
import { SettingsSaveButton } from '../../shared/SettingsSaveButton';
import { TextInput } from '../../form/TextInput';
import { TextArea } from '../../form/TextArea';
import { Toggle } from '../../form/Toggle';
import type { PaymentSettings, PaymentGateways } from '../../../types';
import { DEFAULT_PAYMENT_SETTINGS, DEFAULT_PAYMENT_GATEWAYS } from '../../../utils/defaults';

// Section Icons
const PaymentMethodsIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const MobilePaymentIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const GatewayIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const CheckoutIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

export function PaymentTab() {
  const [payments, setPayments] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [gateways, setGateways] = useState<PaymentGateways>(DEFAULT_PAYMENT_GATEWAYS);
  const [isSaving, setIsSaving] = useState(false);
  const [requirePaymentOnOrder, setRequirePaymentOnOrder] = useState(false);
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const updatePayment = (key: keyof PaymentSettings, value: unknown) => {
    setPayments((prev) => ({ ...prev, [key]: value }));
  };

  // Count active payment methods
  const activeMethodsCount = [
    payments.cashOnDelivery,
    payments.bankTransfer,
    payments.bkash,
    payments.nagad,
    gateways.sslcommerz.enabled,
    gateways.stripe.enabled,
    gateways.paypal.enabled,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Payment Overview</h2>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
              activeMethodsCount > 0 ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${activeMethodsCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            {activeMethodsCount} active
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className={`w-4 h-4 ${payments.cashOnDelivery ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">COD</span>
            </div>
            <p className="text-xs text-gray-500">
              {payments.cashOnDelivery ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className={`w-4 h-4 ${payments.bankTransfer ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Bank</span>
            </div>
            <p className="text-xs text-gray-500">
              {payments.bankTransfer ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className={`w-4 h-4 ${payments.bkash || payments.nagad ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Mobile</span>
            </div>
            <p className="text-xs text-gray-500">
              {payments.bkash || payments.nagad ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className={`w-4 h-4 ${gateways.stripe.enabled || gateways.sslcommerz.enabled ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-gray-700">Cards</span>
            </div>
            <p className="text-xs text-gray-500">
              {gateways.stripe.enabled || gateways.sslcommerz.enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Payment Methods */}
      <SettingsSection
        title="Manual Payment Methods"
        description="Payment methods that require manual verification"
        icon={PaymentMethodsIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-4">
          {/* Cash on Delivery */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              payments.cashOnDelivery
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                    {payments.cashOnDelivery && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Collect payment when order is delivered</p>
                </div>
              </div>
              <Toggle
                checked={payments.cashOnDelivery}
                onChange={(v) => updatePayment('cashOnDelivery', v)}
              />
            </div>
            {payments.cashOnDelivery && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Instructions for customers
                </label>
                <TextArea
                  value={payments.codInstructions}
                  onChange={(v) => updatePayment('codInstructions', v)}
                  placeholder="Please have exact change ready for the delivery person..."
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Bank Transfer */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              payments.bankTransfer
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                    {payments.bankTransfer && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Direct bank transfer to your account</p>
                </div>
              </div>
              <Toggle
                checked={payments.bankTransfer}
                onChange={(v) => updatePayment('bankTransfer', v)}
              />
            </div>
            {payments.bankTransfer && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Bank account details
                </label>
                <TextArea
                  value={payments.bankTransferInstructions}
                  onChange={(v) => updatePayment('bankTransferInstructions', v)}
                  placeholder="Bank Name: ABC Bank&#10;Account Name: Your Store&#10;Account Number: 1234567890&#10;Routing Number: 123456789"
                  rows={4}
                />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Mobile Payments */}
      <SettingsSection
        title="Mobile Payment Methods"
        description="Accept payments via mobile financial services"
        icon={MobilePaymentIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* bKash */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              payments.bkash
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">bKash</p>
                  <p className="text-xs text-gray-500">Mobile wallet</p>
                </div>
              </div>
              <Toggle checked={payments.bkash} onChange={(v) => updatePayment('bkash', v)} />
            </div>
            {payments.bkash && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Merchant number
                </label>
                <TextInput
                  value={payments.bkashMerchantNumber}
                  onChange={(v) => updatePayment('bkashMerchantNumber', v)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            )}
          </div>

          {/* Nagad */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              payments.nagad
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nagad</p>
                  <p className="text-xs text-gray-500">Mobile wallet</p>
                </div>
              </div>
              <Toggle checked={payments.nagad} onChange={(v) => updatePayment('nagad', v)} />
            </div>
            {payments.nagad && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Merchant number
                </label>
                <TextInput
                  value={payments.nagadMerchantNumber}
                  onChange={(v) => updatePayment('nagadMerchantNumber', v)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Payment Gateways */}
      <SettingsSection
        title="Payment Gateways"
        description="Accept online card payments securely"
        icon={GatewayIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-4">
          {/* SSLCommerz */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              gateways.sslcommerz.enabled
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">SSLCommerz</p>
                    {gateways.sslcommerz.enabled && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Active
                      </span>
                    )}
                    {gateways.sslcommerz.sandbox && gateways.sslcommerz.enabled && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 bg-yellow-100 rounded">
                        Sandbox
                      </span>
                    )}
                  </div>
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
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Store ID
                    </label>
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
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Store Password
                    </label>
                    <TextInput
                      type="password"
                      value={gateways.sslcommerz.storePassword}
                      onChange={(v) =>
                        setGateways((prev) => ({
                          ...prev,
                          sslcommerz: { ...prev.sslcommerz, storePassword: v },
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <SettingsToggle
                  label="Sandbox mode"
                  description="Use test environment for development"
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
          </div>

          {/* Stripe */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              gateways.stripe.enabled
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">Stripe</p>
                    {gateways.stripe.enabled && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Accept cards from customers worldwide</p>
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
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Publishable Key
                    </label>
                    <TextInput
                      value={gateways.stripe.publishableKey}
                      onChange={(v) =>
                        setGateways((prev) => ({
                          ...prev,
                          stripe: { ...prev.stripe, publishableKey: v },
                        }))
                      }
                      placeholder="pk_live_..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Secret Key
                    </label>
                    <TextInput
                      type="password"
                      value={gateways.stripe.secretKey}
                      onChange={(v) =>
                        setGateways((prev) => ({
                          ...prev,
                          stripe: { ...prev.stripe, secretKey: v },
                        }))
                      }
                      placeholder="sk_live_..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              gateways.paypal.enabled
                ? 'border-gray-200 bg-white'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">PayPal</p>
                    {gateways.paypal.enabled && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                        Active
                      </span>
                    )}
                    {gateways.paypal.sandbox && gateways.paypal.enabled && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 bg-yellow-100 rounded">
                        Sandbox
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Accept PayPal payments globally</p>
                </div>
              </div>
              <Toggle
                checked={gateways.paypal.enabled}
                onChange={(v) =>
                  setGateways((prev) => ({
                    ...prev,
                    paypal: { ...prev.paypal, enabled: v },
                  }))
                }
              />
            </div>
            {gateways.paypal.enabled && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Client ID
                    </label>
                    <TextInput
                      value={gateways.paypal.clientId}
                      onChange={(v) =>
                        setGateways((prev) => ({
                          ...prev,
                          paypal: { ...prev.paypal, clientId: v },
                        }))
                      }
                      placeholder="Your client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Client Secret
                    </label>
                    <TextInput
                      type="password"
                      value={gateways.paypal.clientSecret}
                      onChange={(v) =>
                        setGateways((prev) => ({
                          ...prev,
                          paypal: { ...prev.paypal, clientSecret: v },
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <SettingsToggle
                  label="Sandbox mode"
                  description="Use PayPal sandbox for testing"
                  checked={gateways.paypal.sandbox}
                  onChange={(v) =>
                    setGateways((prev) => ({
                      ...prev,
                      paypal: { ...prev.paypal, sandbox: v },
                    }))
                  }
                />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Checkout Settings */}
      <SettingsSection
        title="Checkout Settings"
        description="Configure payment behavior at checkout"
        icon={CheckoutIcon}
        iconBg="gray"
        variant="card"
      >
        <div className="space-y-3">
          <SettingsToggle
            label="Require payment on order"
            description="Customers must pay before order is confirmed"
            checked={requirePaymentOnOrder}
            onChange={setRequirePaymentOnOrder}
          />
          <SettingsToggle
            label="Allow partial payments"
            description="Accept deposits or partial payments"
            checked={allowPartialPayment}
            onChange={setAllowPartialPayment}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Security tip:</span> Always use HTTPS for your store
                and keep your API keys secure. Never share your secret keys publicly.
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end pt-2">
        <SettingsSaveButton isLoading={isSaving} label="Save payment settings" />
      </div>
    </form>
  );
}
