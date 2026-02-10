import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type {
  Address,
  User,
  OrderAddress,
  Order,
  PaymentMethod,
  BankAccount,
  InitiatePaymentResponse,
} from '@lunaz/types';
import { Container, Card, Button, Input, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { BankTransferDetails } from './components/BankTransferDetails';

interface AddressFormData {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyAddress: AddressFormData = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

// Bank transfer response type
interface BankTransferResponse extends InitiatePaymentResponse {
  bankDetails?: BankAccount[];
  orderReference?: string;
  amount?: number;
  currency?: string;
  expiresAt?: string;
  instructions?: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, subtotal, currency, clearCart } = useCart();
  const { addToast } = useToast();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [userName, setUserName] = useState<string>('Customer');

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    'details' | 'processing' | 'bank_transfer' | 'complete'
  >('details');
  const [bankTransferInfo, setBankTransferInfo] = useState<BankTransferResponse | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fixed shipping for simplicity
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shippingAmount;

  useEffect(() => {
    async function fetchAddresses() {
      if (!token) return;
      try {
        const user = await api<User>('/users/me', { token });
        setSavedAddresses(user.addresses || []);
        setUserName(user.name || 'Customer');

        // Select default address if available
        const defaultAddr = user.addresses?.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (user.addresses && user.addresses.length > 0) {
          setSelectedAddressId(user.addresses[0].id);
        } else {
          setUseNewAddress(true);
        }
      } catch {
        setUseNewAddress(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAddresses();
  }, [token]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [isLoading, items.length, navigate]);

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate payment method
    if (!selectedPaymentMethod) {
      addToast('Please select a payment method', 'error');
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutStep('processing');

    try {
      let shippingAddress: OrderAddress;

      if (useNewAddress) {
        // Validate new address
        if (
          !addressForm.name ||
          !addressForm.line1 ||
          !addressForm.city ||
          !addressForm.postalCode ||
          !addressForm.country
        ) {
          addToast('Please fill in all required address fields', 'error');
          setIsPlacingOrder(false);
          setCheckoutStep('details');
          return;
        }
        shippingAddress = {
          name: addressForm.name,
          line1: addressForm.line1,
          line2: addressForm.line2 || undefined,
          city: addressForm.city,
          state: addressForm.state || undefined,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
        };
      } else {
        // Use selected address
        const selected = savedAddresses.find((a) => a.id === selectedAddressId);
        if (!selected) {
          addToast('Please select a shipping address', 'error');
          setIsPlacingOrder(false);
          setCheckoutStep('details');
          return;
        }
        shippingAddress = {
          name: userName, // Use user's name for shipping
          line1: selected.line1,
          line2: selected.line2,
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country,
        };
      }

      // Sync cart to backend so order creation sees the same items (backend builds order from server cart)
      const cartPayload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await api('/cart', {
        method: 'PUT',
        body: JSON.stringify({ items: cartPayload }),
        token,
      });

      // Step 1: Create order (uses server-side cart we just synced)
      const order = await api<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress }),
        token,
      });

      setOrderId(order.id);

      // Step 2: Initiate payment
      const paymentResponse = await api<BankTransferResponse>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          method: selectedPaymentMethod,
        }),
        token,
      });

      // Handle payment response based on method
      if (paymentResponse.redirectUrl) {
        // Redirect to payment gateway (SSLCommerz: card, bKash, Nagad, bank)
        clearCart();
        addToast('Redirecting to payment page to enter card or bKash details...', 'info');
        window.location.href = paymentResponse.redirectUrl;
        return;
      }

      if (selectedPaymentMethod === 'bank_transfer' && paymentResponse.bankDetails) {
        clearCart();
        setBankTransferInfo(paymentResponse);
        setCheckoutStep('bank_transfer');
        return;
      }

      if (selectedPaymentMethod === 'cod') {
        clearCart();
        addToast('Order placed successfully! Pay on delivery.', 'success');
        navigate(`/account/orders/${order.id}?confirmed=1`);
        return;
      }

      // Card/bKash/Nagad was selected but no redirect URL – don't confirm order
      if (selectedPaymentMethod === 'card') {
        addToast(
          'Payment gateway did not respond. Please try again or choose another payment method.',
          'error'
        );
        setCheckoutStep('details');
        return;
      }

      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/account/orders/${order.id}?confirmed=1`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
      setCheckoutStep('details');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0 && checkoutStep === 'details') {
    return null; // Will redirect
  }

  // Bank transfer details page
  if (checkoutStep === 'bank_transfer' && bankTransferInfo) {
    return (
      <div className="py-8">
        <Container maxWidth="md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mt-2">
              Please complete your bank transfer to confirm your order.
            </p>
          </div>

          <BankTransferDetails
            bankDetails={bankTransferInfo.bankDetails || []}
            orderReference={bankTransferInfo.orderReference || orderId || ''}
            amount={bankTransferInfo.amount || total}
            currency={bankTransferInfo.currency || currency}
            expiresAt={bankTransferInfo.expiresAt}
            instructions={bankTransferInfo.instructions}
          />

          <div className="mt-6 text-center">
            <Link
              to={`/account/orders/${orderId}`}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              View Order Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Processing state
  if (checkoutStep === 'processing') {
    return (
      <div className="py-8">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Processing your order...</h2>
            <p className="text-gray-600 mt-2">Please wait while we set up your payment.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Address & Payment Method */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !useNewAddress && (
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <div>
                            {address.label && (
                              <span className="text-sm font-medium text-gray-500">
                                {address.label}
                              </span>
                            )}
                            <p className="text-gray-900">{address.line1}</p>
                            {address.line2 && <p className="text-gray-900">{address.line2}</p>}
                            <p className="text-gray-900">
                              {address.city}
                              {address.state ? `, ${address.state}` : ''} {address.postalCode}
                            </p>
                            <p className="text-gray-900">{address.country}</p>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))}

                    <button
                      type="button"
                      onClick={() => setUseNewAddress(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      + Use a different address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(false)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
                      >
                        ← Use a saved address
                      </button>
                    )}

                    <Input
                      label="Full Name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Address Line 1"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      required
                    />
                    <Input
                      label="Address Line 2 (optional)"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                      <Input
                        label="State/Province"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Postal Code"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, postalCode: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Country"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, country: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Method */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <PaymentMethodSelector
                  selected={selectedPaymentMethod}
                  onSelect={setSelectedPaymentMethod}
                  disabled={isPlacingOrder}
                />
                {selectedPaymentMethod === 'card' && (
                  <p className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
                    After you click <strong>Place Order</strong>, you&apos;ll be redirected to the
                    payment page to enter your card number, bKash/Nagad number, or choose your bank.
                  </p>
                )}
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const price = item.variant.priceOverride ?? item.product.basePrice;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} ({item.variant.name}) × {item.quantity}
                        </span>
                        <Price amount={price * item.quantity} currency={item.product.currency} />
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <Price amount={subtotal} currency={currency} />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shippingAmount === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <Price amount={shippingAmount} currency={currency} />
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <Price amount={total} currency={currency} />
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={isPlacingOrder}>
                  Place Order
                </Button>

                <div className="mt-4 text-center">
                  <Link to="/cart" className="text-sm text-indigo-600 hover:text-indigo-700">
                    ← Back to Cart
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
