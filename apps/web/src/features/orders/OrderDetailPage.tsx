import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import type { Order } from '@lunaz/types';
import { Card, Button, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusTimeline = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = searchParams.get('confirmed') === '1';

  useEffect(() => {
    async function fetchOrder() {
      if (!token || !id) return;
      try {
        const data = await api<Order>(`/orders/${id}`, { token });
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [token, id]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h1>
        <Card className="text-center py-8">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/account/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = statusTimeline.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Confirmation Banner */}
      {isConfirmed && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-green-900">Order Confirmed!</h2>
              <p className="text-sm text-green-700">
                Thank you for your order. We'll send you an email with tracking details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/account/orders" className="text-sm text-indigo-600 hover:text-indigo-700">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-500">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusTimeline.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div key={status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted && index < currentStatusIndex ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'font-medium text-indigo-600' : 'text-gray-500'}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  {index < statusTimeline.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${index < currentStatusIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Items */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="divide-y divide-gray-200">
          {order.items.map((item, index) => (
            <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{item.productName}</h3>
                <p className="text-sm text-gray-500">{item.variantName}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × <Price amount={item.unitPrice} currency={order.currency} />
                </p>
              </div>
              <div className="text-right">
                <Price amount={item.total} currency={order.currency} className="font-medium" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <Price amount={order.subtotal} currency={order.currency} />
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              {order.shippingAmount === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <Price amount={order.shippingAmount} currency={order.currency} />
              )}
            </div>
            {order.taxAmount != null && order.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <Price amount={order.taxAmount} currency={order.currency} />
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <Price amount={order.total} currency={order.currency} />
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="text-gray-600">
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
