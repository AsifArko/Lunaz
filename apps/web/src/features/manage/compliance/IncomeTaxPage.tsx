import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useComplianceUpload } from './hooks/useComplianceUpload';
import { DocumentUploadZone } from './components/DocumentUploadZone';
import { Select } from './components/Select';

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

function AddTaxRecordModal({
  onClose,
  onSuccess,
  token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const { uploadFile, uploading, error } = useComplianceUpload('income-tax');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fiscalYear: '2024-2025',
    taxType: 'income_tax',
    period: 'annual',
    grossIncome: 0,
    taxableIncome: 0,
    taxRate: 25,
    taxAmount: 0,
    dueDate: new Date().toISOString().slice(0, 16),
    notes: '',
  });
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);

  const handleFileUpload = async (file: File) => {
    const url = await uploadFile(file);
    if (url) setAttachments((a) => [...a, { name: file.name, url }]);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((a) => a.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const dueDate = new Date(form.dueDate).toISOString();
      const res = await fetch(`${API_URL}/compliance/tax-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          dueDate,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to create');
      }
      onSuccess();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Add Tax Record</h2>
          <button
            onClick={onClose}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fiscal Year</label>
              <Select
                value={form.fiscalYear}
                onChange={(v) => setForm({ ...form, fiscalYear: v })}
                options={[
                  { value: '2025-2026', label: '2025-2026' },
                  { value: '2024-2025', label: '2024-2025' },
                  { value: '2023-2024', label: '2023-2024' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tax Type</label>
              <Select
                value={form.taxType}
                onChange={(v) => setForm({ ...form, taxType: v })}
                options={[
                  { value: 'income_tax', label: 'Income Tax' },
                  { value: 'corporate_tax', label: 'Corporate Tax' },
                  { value: 'vat', label: 'VAT' },
                  { value: 'sales_tax', label: 'Sales Tax' },
                  { value: 'withholding_tax', label: 'Withholding Tax' },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Period</label>
            <Select
              value={form.period}
              onChange={(v) => setForm({ ...form, period: v })}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'half_yearly', label: 'Half Yearly' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Gross Income (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={form.grossIncome || ''}
                onChange={(e) => setForm({ ...form, grossIncome: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Taxable Income (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={form.taxableIncome || ''}
                onChange={(e) => setForm({ ...form, taxableIncome: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tax Amount (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={form.taxAmount || ''}
                onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Attachments</label>
            <DocumentUploadZone
              onFileSelect={handleFileUpload}
              uploading={uploading}
              error={error}
              label="Add supporting document"
            />
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {attachments.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 truncate max-w-[200px]"
                    >
                      {a.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-2 text-sm bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function IncomeTaxPage() {
  const { token } = useAdminAuth();
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    fiscalYear: '',
    taxType: '',
    paymentStatus: '',
  });

  const fiscalYearOptions = [
    { value: '2025-2026', label: '2025-2026' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
  ];

  const taxTypeOptions = [
    { value: 'income_tax', label: 'Income Tax' },
    { value: 'corporate_tax', label: 'Corporate Tax' },
    { value: 'vat', label: 'VAT' },
    { value: 'sales_tax', label: 'Sales Tax' },
    { value: 'withholding_tax', label: 'Withholding Tax' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  useEffect(() => {
    fetchRecords();
    fetchSummary();
    // fetchRecords and fetchSummary depend on token which is stable from useAdminAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchRecords() {
    try {
      const params = new URLSearchParams();
      if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);
      if (filter.taxType) params.append('taxType', filter.taxType);
      if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus);

      const res = await fetch(`${API_URL}/compliance/tax-records?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const res = await fetch(`${API_URL}/compliance/tax-records/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSummary(json);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
          <Select
            value={filter.fiscalYear}
            onChange={(v) => setFilter({ ...filter, fiscalYear: v })}
            options={fiscalYearOptions}
            placeholder="All Fiscal Years"
            allowClear
            className="min-w-[160px]"
          />
          <Select
            value={filter.taxType}
            onChange={(v) => setFilter({ ...filter, taxType: v })}
            options={taxTypeOptions}
            placeholder="All Tax Types"
            allowClear
            className="min-w-[160px]"
          />
          <Select
            value={filter.paymentStatus}
            onChange={(v) => setFilter({ ...filter, paymentStatus: v })}
            options={statusOptions}
            placeholder="All Status"
            allowClear
            className="min-w-[160px]"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Fiscal Year
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Tax Type
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Period
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Tax Amount
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Paid
                </th>
                <th className="px-5 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Due Date
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-2.5 whitespace-nowrap text-xs text-slate-500">
                      {record.fiscalYear}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-xs text-slate-500">
                      {getTaxTypeLabel(record.taxType)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-xs text-slate-500 capitalize">
                      {record.period.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-xs text-slate-500 text-right">
                      {formatCurrency(record.taxAmount)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-xs text-slate-500 text-right">
                      {formatCurrency(record.totalPaid)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium capitalize ${getStatusBadge(
                          record.paymentStatus
                        )}`}
                      >
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-[11px] text-slate-400">
                      {formatDate(record.dueDate)}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <Link
                        to={`/manage/compliance/income-tax/${record._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
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
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                          />
                        </svg>
                      </Link>
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
      {showForm && token && (
        <AddTaxRecordModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchRecords();
            fetchSummary();
          }}
          token={token}
        />
      )}
    </div>
  );
}
