import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface TaxRecord {
  _id: string;
  fiscalYear: string;
  taxType: string;
  period: string;
  grossIncome: number;
  taxableIncome: number;
  taxAmount: number;
  totalPaid: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  filingStatus: string;
  dueDate: string;
  createdAt: string;
}

interface TaxSummary {
  fiscalYear: string;
  totalTax: number;
  totalPaid: number;
  balance: number;
  pendingCount: number;
  overdueCount: number;
}

export function IncomeTaxPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    fiscalYear: '',
    taxType: '',
    paymentStatus: '',
  });

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [filter]);

  async function fetchRecords() {
    try {
      const params = new URLSearchParams();
      if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);
      if (filter.taxType) params.append('taxType', filter.taxType);
      if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/compliance/tax-records?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/compliance/tax-records/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const json = await res.json();
        setSummary(json);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      paid: 'bg-emerald-100 text-emerald-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-800';
  };

  const getTaxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      income_tax: 'Income Tax',
      corporate_tax: 'Corporate Tax',
      vat: 'VAT',
      sales_tax: 'Sales Tax',
      withholding_tax: 'Withholding Tax',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Income Tax Management</h1>
          <p className="text-slate-500 mt-1">Track and manage your business tax records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Tax Record
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Total Tax ({summary.fiscalYear})</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(summary.totalTax)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Balance Due</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary.overdueCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.fiscalYear}
            onChange={(e) => setFilter({ ...filter, fiscalYear: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Fiscal Years</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
          <select
            value={filter.taxType}
            onChange={(e) => setFilter({ ...filter, taxType: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tax Types</option>
            <option value="income_tax">Income Tax</option>
            <option value="corporate_tax">Corporate Tax</option>
            <option value="vat">VAT</option>
            <option value="sales_tax">Sales Tax</option>
            <option value="withholding_tax">Withholding Tax</option>
          </select>
          <select
            value={filter.paymentStatus}
            onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fiscal Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tax Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tax Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {record.fiscalYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {getTaxTypeLabel(record.taxType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                    {record.period.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                    {formatCurrency(record.taxAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 text-right">
                    {formatCurrency(record.totalPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        record.paymentStatus
                      )}`}
                    >
                      {record.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(record.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  <svg
                    className="w-12 h-12 mx-auto text-slate-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z"
                    />
                  </svg>
                  <p>No tax records found</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your first tax record
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Form Modal Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Tax Record</h2>
            <p className="text-slate-500 mb-4">
              Tax record form will be implemented here with all the necessary fields for fiscal year,
              tax type, income details, deductions, and payment information.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
