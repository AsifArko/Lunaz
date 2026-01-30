import { Link } from 'react-router-dom';
import { Container, Card, Button, Price } from '@lunaz/ui';
import { useCart, type LocalCartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function CartItemRow({ item }: { item: LocalCartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const price = item.variant.priceOverride ?? item.product.basePrice;
  const lineTotal = price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-0">
      {/* Image */}
      <Link
        to={`/products/${item.product.slug}`}
        className="shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
      >
        {item.product.images[0]?.url ? (
          <img
            src={item.product.images[0].url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.product.slug}`}
          className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">{item.variant.name}</p>
        <p className="text-sm text-gray-600 mt-1">
          <Price amount={price} currency={item.product.currency} />
        </p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Line Total */}
      <div className="w-24 text-right">
        <Price
          amount={lineTotal}
          currency={item.product.currency}
          className="font-semibold text-gray-900"
        />
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-600 hover:text-red-700 mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, itemCount, subtotal, currency, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg" />
            <div className="h-24 bg-gray-200 rounded-lg" />
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8">
        <Container>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <Price amount={subtotal} currency={currency} />
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <Price amount={subtotal} currency={currency} />
                </div>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout">
                  <Button fullWidth size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link to="/login?redirect=/checkout">
                    <Button fullWidth size="lg">
                      Login to Checkout
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    or{' '}
                    <Link to="/register?redirect=/checkout" className="text-indigo-600 hover:text-indigo-700">
                      create an account
                    </Link>
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700">
                  ← Continue Shopping
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
