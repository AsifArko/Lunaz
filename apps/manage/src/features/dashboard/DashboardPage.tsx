import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order, Product, PaginatedResponse } from '@lunaz/types';
import { Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  revenue: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  products: number;
  customers: number;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  shipped: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

// Stat Card Component
function StatCard({
  icon,
  iconBg,
  label,
  value,
  subValue,
  subLabel,
  isLoading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  subLabel?: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-light text-gray-900 tracking-tight">{value}</p>
            )}
            {subValue && subLabel && (
              <p className="text-xs text-gray-400">
                <span className="text-gray-600 font-medium">{subValue}</span> {subLabel}
              </p>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  title,
  linkTo,
  linkLabel = 'View all',
}: {
  title: string;
  linkTo: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-medium text-gray-900">{title}</h2>
      <Link
        to={linkTo}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        {linkLabel}
        <span className="ml-1">→</span>
      </Link>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  to,
  icon,
  iconBg,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
}) {
  return (
    <Link to={to} className="group">
      <div className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-gray-200 hover:shadow-sm transition-all duration-200">
        <div
          className={`w-10 h-10 mx-auto mb-3 ${iconBg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
        >
          {icon}
        </div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
      </div>
    </Link>
  );
}

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
        const ordersRes = await api<PaginatedResponse<Order>>(
          '/orders?limit=5&sort=createdAt&order=desc',
          { token }
        );
        setRecentOrders(ordersRes.data);

        const productsRes = await api<PaginatedResponse<Product>>(
          '/products?limit=5&status=published',
          { token }
        );
        setTopProducts(productsRes.data);

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
          customers: 0,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          iconBg="bg-emerald-50"
          label="Monthly Revenue"
          value={<Price amount={stats?.revenue.month ?? 0} />}
          subValue={<Price amount={stats?.revenue.week ?? 0} />}
          subLabel="this week"
          isLoading={isLoading}
        />

        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          }
          iconBg="bg-blue-50"
          label="Monthly Orders"
          value={stats?.orders.month ?? 0}
          subValue={stats?.orders.today ?? 0}
          subLabel="today"
          isLoading={isLoading}
        />

        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-violet-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          }
          iconBg="bg-violet-50"
          label="Total Products"
          value={stats?.products ?? 0}
          isLoading={isLoading}
        />

        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          }
          iconBg="bg-amber-50"
          label="Today's Revenue"
          value={<Price amount={stats?.revenue.today ?? 0} />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <SectionHeader title="Recent Orders" linkTo="/orders" />

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        <Price amount={order.total} currency={order.currency} />
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${status.dot}`} />
                        {order.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <SectionHeader title="Products" linkTo="/products" />

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-3">No products yet</p>
              <Link
                to="/products/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center gap-3 py-3 group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    <Price amount={product.basePrice} currency={product.currency} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            to="/products/new"
            icon={
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
            iconBg="bg-gray-100"
            label="Add Product"
          />
          <QuickActionCard
            to="/categories/new"
            icon={
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
            iconBg="bg-gray-100"
            label="Add Category"
          />
          <QuickActionCard
            to="/orders"
            icon={
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                />
              </svg>
            }
            iconBg="bg-gray-100"
            label="View Orders"
          />
          <QuickActionCard
            to="/reports"
            icon={
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            }
            iconBg="bg-gray-100"
            label="View Reports"
          />
        </div>
      </div>
    </div>
  );
}
