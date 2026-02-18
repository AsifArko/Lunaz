import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Order, PaginatedResponse, OrderStatus } from 'types';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { CreateManualOrderModal } from './CreateManualOrderModal';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusOptions: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// Filter Dropdown Component
function FilterDropdown({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 text-xs border rounded-md transition-all min-w-[120px] ${
          value
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            value ? 'text-white' : 'text-gray-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between ${
              !value
                ? 'text-gray-900 bg-gray-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <span>{placeholder}</span>
            {!value && (
              <svg
                className="w-3 h-3 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between ${
                value === option.value
                  ? 'text-gray-900 bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <svg
                  className="w-3 h-3 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `৳${formatted}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Date preset options
const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
];

function getDateRange(preset: string): { startDate: string; endDate: string } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
      };
    }
    case 'last7days': {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 6);
      return {
        startDate: last7.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    }
    case 'last30days': {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 29);
      return {
        startDate: last30.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    }
    case 'thisMonth': {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: firstOfMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    }
    case 'lastMonth': {
      const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: firstOfLastMonth.toISOString().split('T')[0],
        endDate: lastOfLastMonth.toISOString().split('T')[0],
      };
    }
    default:
      return null;
  }
}

export function OrdersPage() {
  const { token } = useAdminAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [manualOrderModalOpen, setManualOrderModalOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const datePreset = searchParams.get('date') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = 10;

  // Sync search input with URL param
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search - update URL params after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        const newParams = new URLSearchParams(searchParams);
        if (searchInput) {
          newParams.set('search', searchInput);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, search, searchParams, setSearchParams]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      params.set('sort', 'createdAt');
      params.set('order', 'desc');
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await api<PaginatedResponse<Order>>(`/orders?${params.toString()}`, { token });
      setOrders(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, status, search, startDate, endDate, addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const handleDatePresetChange = (preset: string) => {
    if (!preset) {
      updateParams({ date: '', startDate: '', endDate: '' });
    } else {
      const range = getDateRange(preset);
      if (range) {
        updateParams({ date: preset, startDate: range.startDate, endDate: range.endDate });
      }
    }
  };

  const hasFilters = search || status || datePreset || startDate || endDate;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  // Count orders by status
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) =>
    ['confirmed', 'processing'].includes(o.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track customer orders</p>
        </div>
        <button
          type="button"
          onClick={() => setManualOrderModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add order
        </button>
      </div>

      <CreateManualOrderModal
        open={manualOrderModalOpen}
        onClose={() => setManualOrderModalOpen(false)}
        onSuccess={() => {
          setManualOrderModalOpen(false);
          fetchOrders();
        }}
      />

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">Total Orders</span>
        </div>
        {pendingCount > 0 && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-gray-700">{pendingCount}</span>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
          </>
        )}
        {processingCount > 0 && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-medium text-gray-700">{processingCount}</span>
              <span className="text-xs text-gray-500">Processing</span>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-56"
          />
        </div>

        {/* Status Filter */}
        <FilterDropdown
          options={statusOptions.map((s) => ({
            value: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
          }))}
          value={status}
          onChange={(value) => updateParams({ status: value })}
          placeholder="All Status"
        />

        {/* Date Filter */}
        <FilterDropdown
          options={datePresets.map((d) => ({ value: d.value, label: d.label }))}
          value={datePreset}
          onChange={handleDatePresetChange}
          placeholder="All Time"
        />

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams({});
            }}
            className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear filters
          </button>
        )}

        {/* Active Date Range Indicator */}
        {(startDate || endDate) && (
          <span className="text-[10px] text-gray-400">
            {startDate && endDate && startDate === endDate
              ? formatDate(startDate)
              : `${startDate ? formatDate(startDate) : '...'} - ${endDate ? formatDate(endDate) : '...'}`}
          </span>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
              <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
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
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No orders found</p>
            <p className="text-xs text-gray-500">
              {hasFilters
                ? 'Try adjusting your filters'
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Shipping
                    </th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const statusStyle = statusColors[order.status] || statusColors.pending;
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Order Number */}
                        <td className="px-4 py-2.5">
                          <Link
                            to={`/manage/orders/${order.id}`}
                            className="text-xs font-medium text-gray-800 hover:text-gray-600 transition-colors"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-2.5">
                          <div>
                            <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                            <p className="text-[10px] text-gray-400">
                              {formatTime(order.createdAt)}
                            </p>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-2.5">
                          <div>
                            <p className="text-xs text-gray-700">
                              {order.customerName || 'Customer'}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                              #{order.userId.slice(-6)}
                            </p>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-600">{itemCount}</span>
                            <span className="text-[10px] text-gray-400">
                              {order.items.length === 1
                                ? 'product'
                                : `products (${order.items.length})`}
                            </span>
                          </div>
                        </td>

                        {/* Shipping Address */}
                        <td className="px-4 py-2.5">
                          <span className="inline-flex px-1.5 py-0.5 text-[9px] font-normal text-gray-500 bg-gray-100 rounded truncate max-w-[140px]">
                            {order.shippingAddress.city}, {order.shippingAddress.country}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs text-gray-600">
                            {formatCurrency(order.total)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end">
                            <Link
                              to={`/manage/orders/${order.id}`}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit Order"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <p className="text-[11px] text-gray-500">
                Showing <span className="font-medium text-gray-700">{startItem}</span> to{' '}
                <span className="font-medium text-gray-700">{endItem}</span> of{' '}
                <span className="font-medium text-gray-700">{total}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: String(pageNum) })}
                      className={`min-w-[28px] h-7 px-2 text-xs rounded transition-colors ${
                        page === pageNum
                          ? 'bg-gray-900 text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
