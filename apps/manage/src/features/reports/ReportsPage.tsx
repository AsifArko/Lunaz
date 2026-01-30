import { useState, useEffect } from 'react';
import type { Order, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export function ReportsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setIsLoading(true);

      try {
        // Fetch all orders for the selected period
        const res = await api<PaginatedResponse<Order>>('/orders?limit=1000', { token });
        const orders = res.data;

        // Calculate period start
        const now = new Date();
        let periodStart: Date;
        switch (period) {
          case 'week':
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            periodStart = new Date(now.getFullYear(), 0, 1);
            break;
        }

        // Filter orders by period
        const periodOrders = orders.filter((o) => new Date(o.createdAt) >= periodStart);

        // Calculate totals
        const revenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
        setTotalRevenue(revenue);
        setTotalOrders(periodOrders.length);
        setAverageOrderValue(periodOrders.length > 0 ? revenue / periodOrders.length : 0);

        // Calculate status counts
        const counts: Record<string, number> = {};
        periodOrders.forEach((o) => {
          counts[o.status] = (counts[o.status] || 0) + 1;
        });
        setStatusCounts(counts);

        // Group by date for chart
        const dataByDate: Record<string, { revenue: number; orders: number }> = {};
        periodOrders.forEach((o) => {
          const date = new Date(o.createdAt).toISOString().split('T')[0];
          if (!dataByDate[date]) {
            dataByDate[date] = { revenue: 0, orders: 0 };
          }
          dataByDate[date].revenue += o.total;
          dataByDate[date].orders += 1;
        });

        const chartData = Object.entries(dataByDate)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setSalesData(chartData);
      } catch {
        addToast('Failed to load reports', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token, period]);

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '—' : <Price amount={totalRevenue} />}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '—' : totalOrders}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '—' : <Price amount={averageOrderValue} />}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Period</p>
          <p className="text-2xl font-semibold text-gray-900">
            This {period}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : salesData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data for this period
              </div>
            ) : (
              <div className="h-64 flex items-end gap-1">
                {salesData.map((data) => (
                  <div key={data.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-indigo-500 rounded-t"
                      style={{ height: `${(data.revenue / maxRevenue) * 200}px` }}
                      title={`${data.date}: $${data.revenue.toFixed(2)}`}
                    />
                    <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Orders by Status */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded" />
              ))}
            </div>
          ) : Object.keys(statusCounts).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{status}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Export */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-500">Download report data as CSV</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // Simple CSV export
                const headers = ['Date', 'Revenue', 'Orders'];
                const rows = salesData.map((d) => [d.date, d.revenue.toFixed(2), d.orders]);
                const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sales-report-${period}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Report exported', 'success');
              }}
            >
              Export CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
