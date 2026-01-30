import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Address, User, OrderAddress, Order } from '@lunaz/types';
import { Container, Card, Button, Input, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface AddressFormData {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyAddress: AddressFormData = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

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

  // Fixed shipping for simplicity
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shippingAmount;

  useEffect(() => {
    async function fetchAddresses() {
      if (!token) return;
      try {
        const user = await api<User>('/users/me', { token });
        setSavedAddresses(user.addresses || []);

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

    setIsPlacingOrder(true);

    try {
      let shippingAddress: OrderAddress;

      if (useNewAddress) {
        // Validate new address
        if (!addressForm.line1 || !addressForm.city || !addressForm.postalCode || !addressForm.country) {
          addToast('Please fill in all required address fields', 'error');
          setIsPlacingOrder(false);
          return;
        }
        shippingAddress = {
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
          return;
        }
        shippingAddress = {
          line1: selected.line1,
          line2: selected.line2,
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country,
        };
      }

      // Place order
      const order = await api<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress }),
        token,
      });

      // Clear cart and redirect to order confirmation
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/account/orders/${order.id}?confirmed=1`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
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

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Address */}
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
                              <span className="text-sm font-medium text-gray-500">{address.label}</span>
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
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        required
                      />
                      <Input
                        label="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
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
