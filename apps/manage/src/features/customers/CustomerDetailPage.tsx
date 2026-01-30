import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { User, Order, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Price } from '@lunaz/ui';
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

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token || !id) return;

      try {
        // Try to fetch customer
        let customerData: User;
        try {
          customerData = await api<User>(`/customers/${id}`, { token });
        } catch {
          customerData = await api<User>(`/users/${id}`, { token });
        }
        setCustomer(customerData);

        // Fetch customer's orders
        const ordersRes = await api<PaginatedResponse<Order>>(`/orders?userId=${id}`, { token });
        setOrders(ordersRes.data);
      } catch {
        addToast('Failed to load customer', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Customer not found</p>
        <Link to="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="mb-6">
        <Link to="/customers" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to Customers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{customer.name}</h1>
        <p className="text-gray-500">{customer.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order History ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-4 px-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <Price amount={order.total} currency={order.currency} className="font-medium" />
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="p-4 bg-gray-50 rounded-lg">
                    {address.label && (
                      <p className="text-sm font-medium text-gray-500 mb-1">{address.label}</p>
                    )}
                    <p className="text-gray-900">{address.line1}</p>
                    {address.line2 && <p className="text-gray-900">{address.line2}</p>}
                    <p className="text-gray-900">
                      {address.city}
                      {address.state ? `, ${address.state}` : ''} {address.postalCode}
                    </p>
                    <p className="text-gray-900">{address.country}</p>
                    {address.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Orders</span>
                <span className="font-medium text-gray-900">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Spent</span>
                <Price amount={totalSpent} className="font-medium text-gray-900" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg. Order Value</span>
                <Price
                  amount={orders.length > 0 ? totalSpent / orders.length : 0}
                  className="font-medium text-gray-900"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
