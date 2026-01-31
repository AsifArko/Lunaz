import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Transaction, Order, PaginatedResponse } from '@lunaz/types';
import { Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Type configuration
const typeConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  sale: { label: 'Sale', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  refund: { label: 'Refund', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  payout: { label: 'Payout', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
};

// Status configuration
const statusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  pending: { label: 'Pending', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  completed: { label: 'Completed', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  failed: { label: 'Failed', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
};

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
              !value ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <span>{placeholder}</span>
            {!value && (
              <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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

// Shorten ID for display
function shortenId(id: string, length: number = 8): string {
  if (!id) return '—';
  if (id.length <= length) return id;
  return `${id.slice(0, length)}...`;
}

export function TransactionsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const limit = 10;

  useEffect(() => {
    async function fetchTransactions() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        params.set('sort', 'createdAt');
        params.set('order', 'desc');
        if (type) params.set('type', type);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const res = await api<PaginatedResponse<Transaction>>(`/transactions?${params.toString()}`, { token });
        setTransactions(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);

        // Fetch order details for transactions
        const orderIds = [...new Set(res.data.map(t => t.orderId).filter(Boolean))];
        if (orderIds.length > 0) {
          const ordersMap: Record<string, Order> = {};
          await Promise.all(
            orderIds.map(async (orderId) => {
              try {
                const order = await api<Order>(`/orders/${orderId}`, { token });
                ordersMap[orderId] = order;
              } catch {
                // Order might not exist or be accessible
              }
            })
          );
          setOrders(ordersMap);
        }
      } catch {
        addToast('Failed to load transactions', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, [token, page, type, dateFrom, dateTo, addToast]);

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

  // Filter by status on frontend
  const filteredTransactions = status
    ? transactions.filter(t => t.status === status)
    : transactions;

  // Calculate stats
  const salesCount = transactions.filter(t => t.type === 'sale').length;
  const refundsCount = transactions.filter(t => t.type === 'refund').length;
  const totalSales = transactions.filter(t => t.type === 'sale' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = transactions.filter(t => t.type === 'refund' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalSales - totalRefunds;

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  const hasFilters = Boolean(type || status || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">View all payment transactions and financial records</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-lg font-semibold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Sales</p>
              <p className="text-lg font-semibold text-emerald-600">{salesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Refunds</p>
              <p className="text-lg font-semibold text-red-600">{refundsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Net Amount</p>
              <Price amount={netAmount} className="text-lg font-semibold text-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <FilterDropdown
          options={[
            { value: 'sale', label: 'Sales' },
            { value: 'refund', label: 'Refunds' },
            { value: 'payout', label: 'Payouts' },
          ]}
          value={type}
          onChange={(val) => updateParams({ type: val })}
          placeholder="All Types"
        />

        {/* Status Filter */}
        <FilterDropdown
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={status}
          onChange={(val) => updateParams({ status: val })}
          placeholder="All Status"
        />

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParams({ dateFrom: e.target.value })}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors"
            />
          </div>
          <span className="text-xs text-gray-400">to</span>
          <div className="relative">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParams({ dateTo: e.target.value })}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => setSearchParams({ page: '1' })}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Clear filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Results count */}
        <div className="ml-auto text-[11px] text-gray-400">
          {total} transaction{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading transactions...
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {hasFilters ? 'No transactions match your filters' : 'No transactions yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      TRX ID
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.map((txn) => {
                    const typeStyle = typeConfig[txn.type] || typeConfig.sale;
                    const statusStyle = statusConfig[txn.status] || statusConfig.pending;
                    const order = orders[txn.orderId];

                    return (
                      <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-100 rounded" title={txn.id}>
                            ...{txn.id.slice(-6)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-[10px] text-gray-600">
                            {new Date(txn.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {new Date(txn.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {order ? (
                            <Link to={`/orders/${txn.orderId}`}>
                              <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                                #{order.orderNumber}
                              </span>
                            </Link>
                          ) : txn.orderId ? (
                            <Link to={`/orders/${txn.orderId}`}>
                              <span className="inline-flex px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                View
                              </span>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {order ? (
                            <span className="text-[10px] text-gray-600 truncate max-w-[100px] block">
                              {order.shippingAddress?.city || 'Customer'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {txn.externalId ? (
                            <span className="inline-flex px-1.5 py-0.5 text-[9px] font-mono text-gray-500 bg-gray-100 rounded" title={txn.externalId}>
                              {shortenId(txn.externalId, 10)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${typeStyle.bgColor} ${typeStyle.textColor}`}>
                            <span className={`w-1 h-1 rounded-full ${typeStyle.color}`} />
                            {typeStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {txn.paymentMethod ? (
                            <span className="inline-flex px-1.5 py-0.5 text-[9px] text-gray-500 bg-gray-100 rounded capitalize">
                              {txn.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Price
                            amount={txn.amount}
                            currency={txn.currency}
                            className={`text-[10px] ${txn.type === 'refund' ? 'text-red-600' : 'text-gray-700'}`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                            <span className={`w-1 h-1 rounded-full ${statusStyle.color}`} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end">
                            {txn.orderId && (
                              <Link
                                to={`/orders/${txn.orderId}`}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="View Order"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{total}</span> transactions
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
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
                          className={`min-w-[28px] h-7 text-xs font-medium rounded-md transition-colors ${
                            page === pageNum
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
