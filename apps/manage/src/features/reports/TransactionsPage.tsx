import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Transaction, PaginatedResponse } from '@lunaz/types';
import { Card, Button, Price, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const typeColors: Record<string, string> = {
  sale: 'bg-green-100 text-green-800',
  refund: 'bg-red-100 text-red-800',
  payout: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function TransactionsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  useEffect(() => {
    async function fetchTransactions() {
      if (!token) return;
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '15');
        params.set('sort', 'createdAt');
        params.set('order', 'desc');
        if (type) params.set('type', type);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const res = await api<PaginatedResponse<Transaction>>(`/transactions?${params.toString()}`, { token });
        setTransactions(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        addToast('Failed to load transactions', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, [token, page, type, dateFrom, dateTo]);

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

  const totalAmount = transactions.reduce((sum, t) => {
    if (t.type === 'refund') return sum - t.amount;
    return sum + t.amount;
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={type}
            onChange={(e) => updateParams({ type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="refund">Refunds</option>
            <option value="payout">Payouts</option>
          </select>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParams({ dateFrom: e.target.value })}
              size="sm"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => updateParams({ dateTo: e.target.value })}
              size="sm"
            />
          </div>
          {(type || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Summary */}
      {!isLoading && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-semibold text-gray-900">{total}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Net Amount</p>
            <p className="text-2xl font-semibold text-gray-900">
              <Price amount={totalAmount} />
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Period</p>
            <p className="text-lg text-gray-900">
              {dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : 'All time'}
            </p>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[txn.type]}`}>
                          {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {txn.orderId || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <Price
                          amount={txn.amount}
                          currency={txn.currency}
                          className={`font-medium ${txn.type === 'refund' ? 'text-red-600' : 'text-gray-900'}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[txn.status]}`}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
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
                  Showing {transactions.length} of {total} transactions
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
