import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order, PaginatedResponse } from '@lunaz/types';
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

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
        <Card className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
        <Card className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to={`/account/orders/${order.id}`} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right">
                  <Price
                    amount={order.total}
                    currency={order.currency}
                    className="text-lg font-semibold text-gray-900"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
