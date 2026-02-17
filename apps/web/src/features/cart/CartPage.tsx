import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Price } from '@/ui';
import { useCart, type LocalCartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function CartItemRow({
  item,
  isRemoving,
  onRemove,
}: {
  item: LocalCartItem;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  const { updateQuantity } = useCart();
  const price = item.variant.priceOverride ?? item.product.basePrice;
  const lineTotal = price * item.quantity;

  return (
    <div
      className={`group flex gap-5 py-6 border-b border-gray-100 last:border-0 transition-all duration-300 ${
        isRemoving ? 'opacity-50 scale-[0.98]' : ''
      }`}
    >
      {/* Image */}
      <Link
        to={`/products/${item.product.slug}`}
        className="shrink-0 w-28 h-28 bg-gray-50 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
      >
        {item.product.images[0]?.url ? (
          <img
            src={item.product.images[0].url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-sm">No image</span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <Link
            to={`/products/${item.product.slug}`}
            className="text-base font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">{item.variant.name}</p>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <Price
            amount={price}
            currency={item.product.currency}
            className="text-sm text-gray-600"
          />
          <button
            onClick={onRemove}
            disabled={isRemoving}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex flex-col items-end justify-between py-0.5">
        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-lg"
            aria-label="Decrease quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-10 text-center text-sm font-medium text-gray-900">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-lg"
            aria-label="Increase quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        <Price
          amount={lineTotal}
          currency={item.product.currency}
          className="text-base font-semibold text-gray-900"
        />
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, itemCount, subtotal, currency, clearCart, removeItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (itemId: string) => {
    setRemovingId(itemId);
    setTimeout(() => {
      removeItem(itemId);
      setRemovingId(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <Container>
            <nav className="py-4">
              <ol className="flex items-center gap-2 text-sm text-gray-400">
                <li>
                  <span className="text-gray-300">Home</span>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li className="text-gray-600 font-medium">Shopping Cart</li>
              </ol>
            </nav>
          </Container>
        </div>

        <Container>
          <div className="py-10">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
            </div>
            <div className="animate-pulse space-y-6">
              <div className="flex gap-5">
                <div className="w-28 h-28 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-gray-100 rounded w-48" />
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-20 mt-4" />
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-28 h-28 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-gray-100 rounded w-56" />
                  <div className="h-4 bg-gray-100 rounded w-28" />
                  <div className="h-4 bg-gray-100 rounded w-20 mt-4" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <Container>
            <nav className="py-4">
              <ol className="flex items-center gap-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-gray-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li className="text-gray-600 font-medium">Shopping Cart</li>
              </ol>
            </nav>
          </Container>
        </div>

        <Container>
          <div className="py-16 lg:py-24">
            <div className="max-w-md mx-auto text-center">
              {/* Empty cart icon */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-semibold text-gray-900 mb-3">Your cart is empty</h1>
              <p className="text-gray-500 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>

              <Link to="/products">
                <Button size="lg">Start Shopping</Button>
              </Link>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <Container>
          <nav className="py-4">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-gray-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-gray-600 font-medium">Shopping Cart</li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container>
        <div className="py-10 lg:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Shopping Cart
                <span className="ml-2 text-lg text-gray-500 font-normal">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="bg-white">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isRemoving={removingId === item.id}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-xl p-6 lg:p-8 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Line Items Summary */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                    <Price
                      amount={subtotal}
                      currency={currency}
                      className="text-gray-900 font-medium"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-semibold text-gray-900">Estimated Total</span>
                  <Price
                    amount={subtotal}
                    currency={currency}
                    className="text-xl font-semibold text-gray-900"
                  />
                </div>

                {/* CTA */}
                {isAuthenticated ? (
                  <Link to="/checkout" className="block">
                    <Button
                      fullWidth
                      size="lg"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login?redirect=/checkout" className="block">
                      <Button
                        fullWidth
                        size="lg"
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        Sign In to Checkout
                      </Button>
                    </Link>
                    <p className="text-center text-sm text-gray-500">
                      New customer?{' '}
                      <Link
                        to="/register?redirect=/checkout"
                        className="text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">Free Shipping $100+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">30-Day Returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-500"
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
                      <span className="text-xs text-gray-600">Quality Guarantee</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center mb-3">We Accept</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-medium text-gray-400 border border-gray-200">
                      Visa
                    </div>
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-medium text-gray-400 border border-gray-200">
                      MC
                    </div>
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-medium text-gray-400 border border-gray-200">
                      Amex
                    </div>
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-medium text-gray-400 border border-gray-200">
                      PP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
