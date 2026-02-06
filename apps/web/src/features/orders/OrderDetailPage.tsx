import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import type { Order } from '@lunaz/types';
import { Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 17a2 2 0 002 2h2a2 2 0 002-2m-6 0V5a2 2 0 012-2h6a2 2 0 012 2v12m-6 0h6m6 0a2 2 0 002-2v-5a2 2 0 00-2-2h-2l-3-5H9"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const ReceiptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
    />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Status configuration
const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  confirmed: { label: 'Confirmed', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
  processing: { label: 'Processing', classes: 'bg-gray-200 text-gray-700 border-gray-300' },
  shipped: { label: 'Shipped', classes: 'bg-gray-800 text-white border-gray-800' },
  delivered: { label: 'Delivered', classes: 'bg-gray-900 text-white border-gray-900' },
  cancelled: { label: 'Cancelled', classes: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const statusTimeline = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusLabels: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-20 bg-gray-50 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-32 bg-gray-50 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon />
          Back to Orders
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400">
              <XCircleIcon />
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {error || 'The order you are looking for does not exist.'}
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusTimeline.indexOf(order.status);
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Confirmation Banner */}
      {isConfirmed && (
        <div className="p-4 bg-gray-900 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white">
                <CheckIcon />
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-white">Order Confirmed</h2>
              <p className="text-sm text-gray-300 mt-0.5">
                Thank you for your order. We'll send you tracking details via email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeftIcon />
            Back to Orders
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Order #{order.orderNumber}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <ClockIcon />
            <span>
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${status.classes}`}
        >
          {status.label}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="text-gray-400">
              <TruckIcon />
            </span>
            <h2 className="text-base font-semibold text-gray-900">Order Progress</h2>
          </div>
          <div className="p-6">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-gray-900 transition-all duration-500"
                  style={{
                    width: `${(currentStatusIndex / (statusTimeline.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusTimeline.map((statusKey, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={statusKey} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }`}
                      >
                        {isCompleted && index < currentStatusIndex ? (
                          <CheckIcon />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center max-w-[60px] ${
                          isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {statusLabels[statusKey]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Notice */}
      {order.status === 'cancelled' && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <span className="text-gray-500">
                <XCircleIcon />
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Order Cancelled</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                This order has been cancelled. If you have any questions, please contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-gray-400">
            <PackageIcon />
          </span>
          <h2 className="text-base font-semibold text-gray-900">Items ({order.items.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="p-5 flex gap-4">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PackageIcon />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{item.productName}</h3>
                {item.variantName && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.variantName}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="text-gray-600">Qty: {item.quantity}</span>
                  <span className="text-gray-300">·</span>
                  <Price
                    amount={item.unitPrice}
                    currency={order.currency}
                    className="text-gray-600"
                  />
                  <span className="text-gray-300">each</span>
                </div>
              </div>

              {/* Total */}
              <div className="text-right shrink-0">
                <Price
                  amount={item.total}
                  currency={order.currency}
                  className="font-semibold text-gray-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary & Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="text-gray-400">
              <ReceiptIcon />
            </span>
            <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <Price
                  amount={order.subtotal}
                  currency={order.currency}
                  className="text-gray-900"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                {order.shippingAmount === 0 ? (
                  <span className="text-gray-900 font-medium">Free</span>
                ) : (
                  <Price
                    amount={order.shippingAmount}
                    currency={order.currency}
                    className="text-gray-900"
                  />
                )}
              </div>
              {order.taxAmount != null && order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <Price
                    amount={order.taxAmount}
                    currency={order.currency}
                    className="text-gray-900"
                  />
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <Price
                    amount={order.total}
                    currency={order.currency}
                    className="text-base font-semibold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="text-gray-400">
              <MapPinIcon />
            </span>
            <h2 className="text-base font-semibold text-gray-900">Shipping Address</h2>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Need Help?</h3>
            <p className="text-sm text-gray-500 mt-1">
              If you have any questions about your order, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
