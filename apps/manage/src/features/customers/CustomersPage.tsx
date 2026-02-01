import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { User, PaginatedResponse } from '@lunaz/types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CustomersPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customers, setCustomers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const limit = 10;

  useEffect(() => {
    async function fetchCustomers() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        params.set('role', 'customer');
        if (search) params.set('search', search);

        // Try customers endpoint, fallback to users endpoint
        let res: PaginatedResponse<User>;
        try {
          res = await api<PaginatedResponse<User>>(`/customers?${params.toString()}`, { token });
        } catch {
          res = await api<PaginatedResponse<User>>(`/users?${params.toString()}`, { token });
        }
        setCustomers(res.data.filter((u) => u.role === 'customer'));
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        addToast('Failed to load customers', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, [token, page, search, addToast]);

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

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  const hasFilters = Boolean(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your customer base</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">Total Customers</span>
        </div>
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
            className="w-56 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => setSearchParams({ page: '1' })}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Clear filters"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Results count */}
        <div className="ml-auto text-[11px] text-gray-400">
          {total} customer{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Loading customers...
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
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
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {hasFilters ? 'No customers match your search' : 'No customers yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Joined
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
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-medium text-gray-600">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <Link
                            to={`/customers/${customer.id}`}
                            className="text-xs text-gray-700 hover:text-gray-900 transition-colors truncate"
                          >
                            {customer.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-500">{customer.email}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{total}</span> customers
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
