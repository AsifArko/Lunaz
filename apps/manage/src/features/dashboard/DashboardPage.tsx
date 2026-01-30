import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order, Product, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  revenue: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  products: number;
  customers: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function DashboardPage() {
  const { token } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token) return;

      try {
        // Fetch recent orders
        const ordersRes = await api<PaginatedResponse<Order>>('/orders?limit=5&sort=createdAt&order=desc', { token });
        setRecentOrders(ordersRes.data);

        // Fetch products for top products
        const productsRes = await api<PaginatedResponse<Product>>('/products?limit=5&status=published', { token });
        setTopProducts(productsRes.data);

        // Calculate stats from orders (simplified - real impl would have dedicated endpoint)
        const allOrders = await api<PaginatedResponse<Order>>('/orders?limit=1000', { token });
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersToday = allOrders.data.filter((o) => new Date(o.createdAt) >= todayStart);
        const ordersWeek = allOrders.data.filter((o) => new Date(o.createdAt) >= weekStart);
        const ordersMonth = allOrders.data.filter((o) => new Date(o.createdAt) >= monthStart);

        setStats({
          revenue: {
            today: ordersToday.reduce((sum, o) => sum + o.total, 0),
            week: ordersWeek.reduce((sum, o) => sum + o.total, 0),
            month: ordersMonth.reduce((sum, o) => sum + o.total, 0),
          },
          orders: {
            today: ordersToday.length,
            week: ordersWeek.length,
            month: ordersMonth.length,
          },
          products: productsRes.total,
          customers: 0, // Would need customer endpoint
        });
      } catch {
        // Silent fail - show empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/products/new">
            <Button size="sm">Add Product</Button>
          </Link>
          <Link to="/orders">
            <Button size="sm" variant="outline">View Orders</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue (Month)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? '—' : <Price amount={stats?.revenue.month ?? 0} />}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Orders (Month)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? '—' : stats?.orders.month ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? '—' : stats?.products ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue (Today)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? '—' : <Price amount={stats?.revenue.today ?? 0} />}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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

        {/* Top Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Link to="/products/new">
                <Button size="sm">Add First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                    {product.images[0] ? (
                      <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.variants.length} variants</p>
                  </div>
                  <Price amount={product.basePrice} currency={product.currency} className="font-medium" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/products/new" className="group">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Add Product</p>
          </Card>
        </Link>
        <Link to="/categories/new" className="group">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Add Category</p>
          </Card>
        </Link>
        <Link to="/orders" className="group">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">View Orders</p>
          </Card>
        </Link>
        <Link to="/reports" className="group">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">View Reports</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
