import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { User, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Input } from '@lunaz/ui';
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

  useEffect(() => {
    async function fetchCustomers() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '10');
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
  }, [token, page, search]);

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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="w-64">
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Customers Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <Link
                            to={`/customers/${customer.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {customer.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link to={`/customers/${customer.id}`}>
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
                  Showing {customers.length} of {total} customers
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
