import { useEffect, useState } from 'react';
import type { PaymentMethod, PaymentMethodInfo } from '@lunaz/types';
import { api } from '../../../api/client';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

// Payment method icons/logos
const PaymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
  bkash: (
    <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
      bKash
    </div>
  ),
  nagad: (
    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
      Nagad
    </div>
  ),
  bank_transfer: (
    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  ),
  card: (
    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    </div>
  ),
  cod: (
    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
  ),
};

export function PaymentMethodSelector({
  selected,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const response = await api<{ methods: PaymentMethodInfo[] }>('/payments/methods');
        let list = response.methods || [];

        // In development: if backend didn't return SSLCommerz (e.g. backend not restarted after adding .env),
        // still show it so the option is visible. Place Order will work once backend has SSLCOMMERZ_* in env.
        if (import.meta.env.DEV && !list.some((m) => m.id === 'card')) {
          list = [
            ...list,
            {
              id: 'card' as PaymentMethod,
              name: 'Card / bKash / Nagad / Bank',
              description:
                'Pay with card, mobile banking (bKash, Nagad, Rocket, Tap, Upay), or internet banking via SSLCommerz',
              enabled: true,
            },
          ];
        }

        setMethods(list);

        // Auto-select first method if none selected
        if (!selected && list.length > 0) {
          onSelect(list[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    }
    fetchMethods();
    // onSelect and selected are intentionally excluded - we only want to fetch and auto-select once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-gray-200 rounded-lg" />
        <div className="h-16 bg-gray-200 rounded-lg" />
        <div className="h-16 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  if (methods.length === 0) {
    return (
      <div className="text-gray-600 text-sm p-4 bg-gray-50 rounded-lg">
        No payment methods available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <label
          key={method.id}
          className={`block p-4 border rounded-lg cursor-pointer transition-all ${
            selected === method.id
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-opacity-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={method.id}
            checked={selected === method.id}
            onChange={() => onSelect(method.id)}
            disabled={disabled}
            className="sr-only"
          />
          <div className="flex items-center gap-4">
            {PaymentMethodIcons[method.id]}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            {selected === method.id && (
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
