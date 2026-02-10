import { useState, useEffect, useRef, useCallback } from 'react';
import type { Order, Product, User, OrderAddress } from '@lunaz/types';
import { PaymentMethod } from '@lunaz/types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const inputFieldClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-shadow placeholder:text-gray-400';

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.BKASH, label: 'bKash' },
  { value: PaymentMethod.NAGAD, label: 'Nagad' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentMethod.CARD, label: 'Card' },
  { value: PaymentMethod.CASH_ON_DELIVERY, label: 'Cash on Delivery' },
];

const emptyAddress: OrderAddress = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

interface ManualOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CreateManualOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

// Searchable combobox for customers
function CustomerCombobox({
  value,
  onChange,
  token,
  disabled,
}: {
  value: { id: string; name: string; email: string } | null;
  onChange: (customer: { id: string; name: string; email: string } | null) => void;
  token: string | null;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = useCallback(
    async (search: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '20' });
        if (search.trim()) params.set('search', search.trim());
        const res = await api<{ data: User[] }>(`/customers?${params.toString()}`, { token });
        setOptions(
          res.data.map((u) => ({ id: u.id, name: u.name || 'No name', email: u.email || '' }))
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Only fetch when dropdown is open; debounce to avoid constant requests
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchCustomers(query), 400);
    return () => clearTimeout(t);
  }, [open, query, fetchCustomers]);

  useEffect(() => {
    if (open && !value) setQuery('');
  }, [open, value]);

  const displayText = value ? `${value.name} (${value.email})` : '';

  return (
    <div className="relative">
      <div className="flex items-center gap-1 border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-400">
        <span className="pl-3 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={open ? query : displayText}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder="Search customer by name or email..."
          disabled={disabled}
          className="flex-1 py-2.5 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {open && (
        <div
          ref={listRef}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto"
        >
          {loading && options.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">Searching...</div>
          ) : options.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              {query ? 'No customers found' : 'Type to search customers'}
            </div>
          ) : (
            options.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(c);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex flex-col"
              >
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-500">{c.email}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Searchable product combobox (returns product so parent can show variants)
function ProductCombobox({
  value,
  onChange,
  token,
  disabled,
  excludeIds = [],
}: {
  value: Product | null;
  onChange: (product: Product | null) => void;
  token: string | null;
  disabled?: boolean;
  excludeIds?: string[];
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchProducts = useCallback(
    async (search: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '25', status: 'published' });
        if (search.trim()) params.set('search', search.trim());
        const res = await api<{ data: Product[] }>(`/products?${params.toString()}`, { token });
        setOptions(res.data.filter((p) => !excludeIds.includes(p.id)));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [token, excludeIds]
  );

  // Only fetch when dropdown is open; debounce to stop constant fetching/flickering
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchProducts(query), 400);
    return () => clearTimeout(t);
  }, [open, query, fetchProducts]);

  useEffect(() => {
    if (open && !value) setQuery('');
  }, [open, value]);

  const displayText = value ? value.name : '';

  return (
    <div className="relative w-full min-w-0">
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-400 w-full min-w-0">
        <span className="pl-3 text-gray-400 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={open ? query : displayText}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder="Search products..."
          disabled={disabled}
          title={value ? value.name : undefined}
          className="flex-1 min-w-0 py-2.5 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading && options.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">Searching...</div>
          ) : options.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              {query ? 'No products found' : 'Type to search products'}
            </div>
          ) : (
            options.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(p);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex justify-between items-center"
              >
                <span className="font-medium text-gray-900 truncate">{p.name}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  ৳{p.basePrice.toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CreateManualOrderModal({ open, onClose, onSuccess }: CreateManualOrderModalProps) {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState<{ id: string; name: string; email: string } | null>(
    null
  );
  const [shippingAddress, setShippingAddress] = useState<OrderAddress>(emptyAddress);
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [items, setItems] = useState<ManualOrderItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When customer is selected, optionally pre-fill address from their default
  useEffect(() => {
    if (!customer?.id || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const c = await api<
          User & {
            addresses?: {
              line1: string;
              line2?: string;
              city: string;
              state?: string;
              postalCode: string;
              country: string;
              isDefault?: boolean;
            }[];
          }
        >(`/customers/${customer.id}`, { token });
        if (cancelled) return;
        const defaultAddr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
        if (defaultAddr) {
          setShippingAddress((prev) => ({
            ...prev,
            name: customer.name,
            line1: defaultAddr.line1,
            line2: defaultAddr.line2 ?? '',
            city: defaultAddr.city,
            state: defaultAddr.state ?? '',
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country,
          }));
        } else {
          setShippingAddress((prev) => ({ ...prev, name: customer.name }));
        }
      } catch {
        setShippingAddress((prev) => ({ ...prev, name: customer.name }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customer?.id, customer?.name, token]);

  const resetForm = useCallback(() => {
    setCustomer(null);
    setShippingAddress(emptyAddress);
    setShippingAmount(0);
    setItems([]);
    setSelectedProducts([]);
    setPaymentMethod('');
    setTransactionId('');
    setNotes('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        variantId: '',
        productName: '',
        variantName: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
    setSelectedProducts((prev) => [...prev, null]);
  };

  const updateLineItem = (index: number, updates: Partial<ManualOrderItem>) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], ...updates };
      if (item.unitPrice && item.quantity) item.total = item.unitPrice * item.quantity;
      next[index] = item;
      return next;
    });
  };

  const removeLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const setLineItemProduct = (index: number, product: Product | null) => {
    setSelectedProducts((prev) => {
      const next = [...prev];
      next[index] = product;
      return next;
    });
    if (!product) {
      updateLineItem(index, {
        productId: '',
        variantId: '',
        productName: '',
        variantName: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
      return;
    }
    const variant = product.variants[0];
    const unitPrice = variant?.priceOverride ?? product.basePrice;
    updateLineItem(index, {
      productId: product.id,
      variantId: variant?.id ?? '',
      productName: product.name,
      variantName: variant?.name ?? 'Default',
      quantity: 1,
      unitPrice,
      total: unitPrice,
    });
  };

  const setLineItemVariant = (index: number, variantId: string, product: Product) => {
    const variant = product.variants.find((v) => v.id === variantId);
    const unitPrice = variant?.priceOverride ?? product.basePrice;
    updateLineItem(index, {
      variantId: variantId,
      variantName: variant?.name ?? 'Default',
      unitPrice,
      total: unitPrice * (items[index]?.quantity ?? 1),
    });
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const total = subtotal + shippingAmount;
  const validItems = items.filter((i) => i.productId && i.variantId && i.quantity >= 1);
  const canSubmit =
    customer?.id &&
    validItems.length > 0 &&
    shippingAddress.name &&
    shippingAddress.line1 &&
    shippingAddress.city &&
    shippingAddress.postalCode &&
    shippingAddress.country;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;
    setSubmitting(true);
    try {
      const order = await api<Order>('/orders/manual', {
        method: 'POST',
        token,
        body: JSON.stringify({
          userId: customer!.id,
          items: validItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          shippingAddress: {
            name: shippingAddress.name,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.state || undefined,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          shippingAmount: shippingAmount || undefined,
          transactionId: transactionId.trim() || undefined,
          paymentMethod: paymentMethod || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      addToast(`Order #${order.orderNumber} created`, 'success');
      handleClose();
      onSuccess(order.orderNumber as string);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div
        className="relative w-full max-w-5xl max-h-[88vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Create order</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Customer + Recipient + Shipping */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <CustomerCombobox value={customer} onChange={setCustomer} token={token} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient name
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Name for shipping"
                    className={inputFieldClass}
                  />
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={shippingAddress.line1}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, line1: e.target.value }))
                        }
                        placeholder="Address line 1"
                        className={inputFieldClass}
                      />
                    </div>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="City"
                      className={inputFieldClass}
                    />
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                      }
                      placeholder="Postal code"
                      className={inputFieldClass}
                    />
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, country: e.target.value }))
                        }
                        placeholder="Country"
                        className={inputFieldClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping cost (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={shippingAmount === 0 ? '' : shippingAmount}
                    onChange={(e) =>
                      setShippingAmount(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    placeholder="0"
                    className={`${inputFieldClass} w-32`}
                  />
                </div>
              </div>

              {/* Right: Items + Payment + Notes */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Order items</label>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add product
                    </button>
                  </div>
                  {items.length === 0 ? (
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                    >
                      + Add first product
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Header — fixed widths so Product and Variant never overlap */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                        <div className="w-[220px] shrink-0">Product</div>
                        <div className="w-36 shrink-0">Variant</div>
                        <div className="w-14 shrink-0 text-right">Qty</div>
                        <div className="w-20 shrink-0 text-right">Line total</div>
                        <div className="w-10 shrink-0" />
                      </div>
                      {items.map((item, index) => (
                        <LineItemRow
                          key={index}
                          item={item}
                          selectedProduct={selectedProducts[index] ?? null}
                          token={token}
                          onProductSelect={(product) => setLineItemProduct(index, product)}
                          onVariantChange={(variantId, product) =>
                            setLineItemVariant(index, variantId, product)
                          }
                          onQuantityChange={(q) =>
                            updateLineItem(index, { quantity: q, total: item.unitPrice * q })
                          }
                          onRemove={() => removeLineItem(index)}
                        />
                      ))}
                    </div>
                  )}
                  {items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="tabular-nums">৳{subtotal.toLocaleString()}</span>
                      </div>
                      {shippingAmount > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className="tabular-nums">৳{shippingAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-gray-900 pt-1">
                        <span>Total</span>
                        <span className="tabular-nums">৳{total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
                      className={`${inputFieldClass} w-full bg-white`}
                    >
                      <option value="">— Optional —</option>
                      {PAYMENT_METHOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Optional"
                      className={`${inputFieldClass} w-full`}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional notes..."
                    className={`${inputFieldClass} w-full resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating...' : 'Create order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Order item row: flex layout with fixed column widths so nothing overlaps
function LineItemRow({
  item,
  selectedProduct,
  token,
  onProductSelect,
  onVariantChange,
  onQuantityChange,
  onRemove,
}: {
  item: ManualOrderItem;
  selectedProduct: Product | null;
  token: string | null;
  onProductSelect: (product: Product | null) => void;
  onVariantChange: (variantId: string, product: Product) => void;
  onQuantityChange: (q: number) => void;
  onRemove: () => void;
}) {
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === item.variantId);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 bg-white min-h-[52px]">
      <div className="w-[220px] shrink-0 min-w-0">
        <ProductCombobox value={selectedProduct} onChange={onProductSelect} token={token} />
      </div>
      <div className="w-36 shrink-0">
        {selectedProduct ? (
          <select
            value={item.variantId}
            onChange={(e) => onVariantChange(e.target.value, selectedProduct)}
            title={selectedVariant?.name}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none"
          >
            {selectedProduct.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="block py-2 text-sm text-gray-400">—</span>
        )}
      </div>
      <div className="w-14 shrink-0">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 outline-none text-right tabular-nums"
        />
      </div>
      <div className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900 tabular-nums">
        ৳{(item.total || 0).toLocaleString()}
      </div>
      <div className="w-10 shrink-0 flex justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
