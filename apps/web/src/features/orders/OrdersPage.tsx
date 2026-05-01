import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order, PaginatedResponse } from 'types';
import { Price } from '@/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Icons
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

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
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

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

const XCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

// Status configuration with gray tones and icons
const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  pending: {
    label: 'Pending',
    icon: <ClockIcon />,
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  confirmed: {
    label: 'Confirmed',
    icon: <CheckCircleIcon />,
    classes: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  processing: {
    label: 'Processing',
    icon: <PackageIcon />,
    classes: 'bg-gray-200 text-gray-700 border-gray-300',
  },
  shipped: {
    label: 'Shipped',
    icon: <TruckIcon />,
    classes: 'bg-gray-800 text-white border-gray-800',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircleIcon />,
    classes: 'bg-gray-900 text-white border-gray-900',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircleIcon />,
    classes: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

const ORDERS_PER_PAGE = 4;

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      try {
        const res = await api<PaginatedResponse<Order>>('/orders', { token });
        setOrders(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  // Reset to page 1 if current page is out of bounds (e.g. after orders change)
  useEffect(() => {
    const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [orders.length, page]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-500 mt-0.5">View and track your orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400">
              <XCircleIcon />
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load orders</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-500 mt-0.5">View and track your orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400">
              <ShoppingBagIcon />
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            When you place your first order, it will appear here for you to track.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Start Shopping
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} order{orders.length === 1 ? '' : 's'} placed
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {paginatedOrders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const itemCount = order.items.length;
          const firstItem = order.items[0];

          return (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Order Icon/Image */}
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {firstItem?.imageUrl ? (
                      <img src={firstItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">
                        <PackageIcon />
                      </span>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.classes}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* Items Summary */}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        {itemCount > 1 && firstItem && (
                          <span className="text-gray-400">
                            {' '}
                            · {firstItem.productName}
                            {itemCount > 1 && ` + ${itemCount - 1} more`}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <Price
                          amount={order.total}
                          currency={order.currency}
                          className="text-sm font-semibold text-gray-900"
                        />
                        <span className="text-gray-300 group-hover:text-gray-500 transition-colors">
                          <ChevronRightIcon />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar for non-delivered/non-cancelled orders */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="px-5 pb-4">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full transition-all duration-500"
                      style={{
                        width:
                          order.status === 'pending'
                            ? '20%'
                            : order.status === 'confirmed'
                              ? '40%'
                              : order.status === 'processing'
                                ? '60%'
                                : order.status === 'shipped'
                                  ? '80%'
                                  : '100%',
                      }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                  page === p
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
