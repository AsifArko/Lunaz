import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Order, PaginatedResponse, OrderStatus } from '@lunaz/types';
import { Card, Button, Price, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function OrdersPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '10');
        params.set('sort', 'createdAt');
        params.set('order', 'desc');
        if (status) params.set('status', status);
        if (search) params.set('search', search);

        const res = await api<PaginatedResponse<Order>>(`/orders?${params.toString()}`, { token });
        setOrders(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        addToast('Failed to load orders', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [token, page, status, search]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!updates.page) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <Input
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
            />
          </div>
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {(search || status) && (
            <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {order.shippingAddress.line1}, {order.shippingAddress.city}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {order.items.length} items
                      </td>
                      <td className="px-4 py-4">
                        <Price amount={order.total} currency={order.currency} className="font-medium" />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {orders.length} of {total} orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
