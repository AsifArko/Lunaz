import { useState, useEffect, useRef } from 'react';
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

interface DropdownOption {
  value: string;
  label: string;
}

function Dropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 min-w-[160px] bg-white border rounded-md text-sm transition-colors ${
          isOpen
            ? 'border-slate-400 ring-1 ring-slate-400'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
              !value ? 'text-slate-900 bg-slate-50' : 'text-slate-500'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                value === option.value ? 'text-slate-900 bg-slate-50' : 'text-slate-600'
              }`}
            >
              {option.label}
              {value === option.value && (
                <svg
                  className="w-4 h-4 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

  const fiscalYearOptions: DropdownOption[] = [
    { value: '2025-2026', label: '2025-2026' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
  ];

  const taxTypeOptions: DropdownOption[] = [
    { value: 'income_tax', label: 'Income Tax' },
    { value: 'corporate_tax', label: 'Corporate Tax' },
    { value: 'vat', label: 'VAT' },
    { value: 'sales_tax', label: 'Sales Tax' },
    { value: 'withholding_tax', label: 'Withholding Tax' },
  ];

  const statusOptions: DropdownOption[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/compliance/tax-records?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/compliance/tax-records/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      pending: 'bg-slate-100 text-slate-700',
      partial: 'bg-slate-100 text-slate-700',
      paid: 'bg-slate-100 text-slate-700',
      overdue: 'bg-slate-900 text-white',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
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

  const clearFilters = () => {
    setFilter({ fiscalYear: '', taxType: '', paymentStatus: '' });
  };

  const hasActiveFilters = filter.fiscalYear || filter.taxType || filter.paymentStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Income Tax Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage your business tax records
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Record
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4.5 h-4.5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Total Tax</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(summary.totalTax)}
              </p>
              <span className="text-xs text-slate-400">{summary.fiscalYear}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4.5 h-4.5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Total Paid</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4.5 h-4.5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Balance Due</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4.5 h-4.5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Overdue</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-slate-900">{summary.overdueCount}</p>
              <span className="text-xs text-slate-400">records</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear all
            </button>
          )}
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <Dropdown
            value={filter.fiscalYear}
            onChange={(value) => setFilter({ ...filter, fiscalYear: value })}
            options={fiscalYearOptions}
            placeholder="All Fiscal Years"
          />
          <Dropdown
            value={filter.taxType}
            onChange={(value) => setFilter({ ...filter, taxType: value })}
            options={taxTypeOptions}
            placeholder="All Tax Types"
          />
          <Dropdown
            value={filter.paymentStatus}
            onChange={(value) => setFilter({ ...filter, paymentStatus: value })}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">
                  Fiscal Year
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Tax Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Period</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">
                  Tax Amount
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">Paid</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Due Date</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-900">
                      {record.fiscalYear}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                      {getTaxTypeLabel(record.taxType)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 capitalize">
                      {record.period.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                      {formatCurrency(record.taxAmount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600 text-right">
                      {formatCurrency(record.totalPaid)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusBadge(
                          record.paymentStatus
                        )}`}
                      >
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(record.dueDate)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-5 h-5 text-slate-400"
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
                    </div>
                    <p className="text-sm text-slate-500 mb-2">No tax records found</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-sm text-slate-700 hover:text-slate-900 font-medium"
                    >
                      Add your first tax record
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Add Tax Record</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-5">
                Tax record form will be implemented here with all the necessary fields for fiscal
                year, tax type, income details, deductions, and payment information.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-2 text-sm bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
