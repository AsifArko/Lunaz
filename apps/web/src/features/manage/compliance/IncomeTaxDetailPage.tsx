import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useComplianceUpload } from './hooks/useComplianceUpload';
import { DocumentUploadZone } from './components/DocumentUploadZone';
import { DetailPageSkeleton } from '@/features/manage/components/loaders';
import { useMinimumLoadingTime } from '@/features/manage/hooks/useMinimumLoadingTime';
import { Select } from './components/Select';

interface TaxRecordDetail {
  _id: string;
  fiscalYear: string;
  taxType: string;
  period: string;
  periodMonth?: number;
  periodQuarter?: number;
  grossIncome: number;
  deductions: Array<{
    _id?: string;
    category: string;
    description: string;
    amount: number;
    supportingDocument?: string;
  }>;
  totalDeductions: number;
  taxableIncome: number;
  taxRate: number;
  taxAmount: number;
  dueDate: string;
  payments: Array<{
    _id?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber: string;
    receipt?: string;
    notes?: string;
  }>;
  totalPaid: number;
  paymentStatus: string;
  filingStatus: string;
  filingDate?: string;
  acknowledgmentNumber?: string;
  filedBy?: { name: string; email: string };
  attachments: Array<{ name: string; url: string; uploadedAt?: string }>;
  notes?: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: 'Income Tax',
  corporate_tax: 'Corporate Tax',
  vat: 'VAT',
  sales_tax: 'Sales Tax',
  withholding_tax: 'Withholding Tax',
  other: 'Other',
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  annual: 'Annual',
};

const DEDUCTION_CATEGORY_LABELS: Record<string, string> = {
  operating_expenses: 'Operating Expenses',
  depreciation: 'Depreciation',
  business_development: 'Business Development',
  professional_services: 'Professional Services',
  insurance: 'Insurance',
  interest: 'Interest',
  donations: 'Donations',
  other: 'Other',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  online: 'Online',
  cheque: 'Cheque',
  cash: 'Cash',
};

const FILING_STATUS_LABELS: Record<string, string> = {
  not_filed: 'Not Filed',
  draft: 'Draft',
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

function InfoCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
        <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function EditTaxRecordModal({
  record,
  onClose,
  onSuccess,
  token,
}: {
  record: TaxRecordDetail;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const { uploadFile, uploading, error } = useComplianceUpload('income-tax', record._id);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fiscalYear: record.fiscalYear,
    taxType: record.taxType,
    period: record.period,
    grossIncome: record.grossIncome,
    taxableIncome: record.taxableIncome,
    taxRate: record.taxRate,
    taxAmount: record.taxAmount,
    dueDate: record.dueDate ? new Date(record.dueDate).toISOString().slice(0, 16) : '',
    notes: record.notes || '',
  });
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>(
    record.attachments || []
  );

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
      const res = await fetch(`${API_URL}/compliance/tax-records/${record._id}`, {
        method: 'PATCH',
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
        throw new Error(data?.error || 'Failed to update');
      }
      onSuccess();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to update');
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
          <h2 className="text-base font-semibold text-slate-900">Edit Tax Record</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
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

export function IncomeTaxDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const [record, setRecord] = useState<TaxRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchRecord() {
    if (!id) return;
    try {
      setError(null);
      const res = await fetch(`${API_URL}/compliance/tax-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecord(data);
      } else {
        setError('Record not found');
      }
    } catch {
      setError('Failed to load record');
    } finally {
      setLoading(false);
    }
  }

  const showLoading = useMinimumLoadingTime(loading, 450);
  if (showLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !record) {
    return (
      <div className="space-y-5">
        <Link
          to="/manage/compliance/income-tax"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Income Tax
        </Link>
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">{error || 'Record not found'}</p>
        </div>
      </div>
    );
  }

  const balanceDue = record.taxAmount - record.totalPaid;
  const statusBadge =
    record.paymentStatus === 'paid'
      ? 'bg-emerald-50 text-emerald-700'
      : record.paymentStatus === 'overdue'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/manage/compliance/income-tax"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Income Tax
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            {record.fiscalYear} — {TAX_TYPE_LABELS[record.taxType] || record.taxType}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">
            {PERIOD_LABELS[record.period] || record.period} period
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${statusBadge}`}
          >
            {record.paymentStatus}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 capitalize">
            {FILING_STATUS_LABELS[record.filingStatus] || record.filingStatus}
          </span>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && record && token && (
        <EditTaxRecordModal
          record={record}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchRecord();
          }}
          token={token}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Tax Record</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this tax record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!id || !token) return;
                  try {
                    const res = await fetch(`${API_URL}/compliance/tax-records/${id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      setShowDeleteConfirm(false);
                      navigate('/manage/compliance/income-tax');
                    } else {
                      const data = await res.json();
                      alert(data?.error || 'Failed to delete');
                    }
                  } catch {
                    alert('Failed to delete');
                  }
                }}
                className="px-3.5 py-2 text-sm bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Tax Amount
          </p>
          <p className="text-xl font-semibold text-slate-900">{formatCurrency(record.taxAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Total Paid
          </p>
          <p className="text-xl font-semibold text-emerald-600">
            {formatCurrency(record.totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Balance Due
          </p>
          <p
            className={`text-xl font-semibold ${balanceDue > 0 ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {formatCurrency(balanceDue)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Due Date
          </p>
          <p className="text-xl font-semibold text-slate-900">{formatDate(record.dueDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income & Tax Details */}
        <InfoCard
          title="Income & Tax Details"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Gross Income</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(record.grossIncome)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Total Deductions</dt>
              <dd className="font-medium text-slate-900">
                {formatCurrency(record.totalDeductions)}
              </dd>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
              <dt className="text-slate-500">Taxable Income</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(record.taxableIncome)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Tax Rate</dt>
              <dd className="font-medium text-slate-900">{record.taxRate}%</dd>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
              <dt className="text-slate-700 font-medium">Tax Amount</dt>
              <dd className="font-semibold text-slate-900">{formatCurrency(record.taxAmount)}</dd>
            </div>
          </dl>
        </InfoCard>

        {/* Filing Status */}
        <InfoCard
          title="Filing Status"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        >
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium capitalize">
                {FILING_STATUS_LABELS[record.filingStatus] || record.filingStatus}
              </dd>
            </div>
            {record.filingDate && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Filing Date</dt>
                <dd className="font-medium">{formatDate(record.filingDate)}</dd>
              </div>
            )}
            {record.acknowledgmentNumber && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Acknowledgment #</dt>
                <dd className="font-mono text-slate-900">{record.acknowledgmentNumber}</dd>
              </div>
            )}
            {record.filedBy && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Filed By</dt>
                <dd className="font-medium">{record.filedBy.name}</dd>
              </div>
            )}
          </dl>
        </InfoCard>

        {/* Deductions */}
        <InfoCard
          title="Deductions"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        >
          {record.deductions && record.deductions.length > 0 ? (
            <div className="space-y-3">
              {record.deductions.map((d, i) => (
                <div
                  key={d._id || i}
                  className="flex justify-between items-start text-sm py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {DEDUCTION_CATEGORY_LABELS[d.category] || d.category}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{d.description}</p>
                  </div>
                  <span className="font-medium text-slate-900 shrink-0">
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-medium">
                <span className="text-slate-700">Total</span>
                <span className="text-slate-900">{formatCurrency(record.totalDeductions)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No deductions recorded</p>
          )}
        </InfoCard>

        {/* Payments */}
        <InfoCard
          title="Payments"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        >
          {record.payments && record.payments.length > 0 ? (
            <div className="space-y-3">
              {record.payments.map((p, i) => (
                <div
                  key={p._id || i}
                  className="flex justify-between items-start text-sm py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-900">{formatCurrency(p.amount)}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {formatDate(p.paymentDate)} ·{' '}
                      {PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                    </p>
                    <p className="text-slate-400 text-xs font-mono">Ref: {p.referenceNumber}</p>
                  </div>
                  {p.receipt && (
                    <a
                      href={p.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
                    >
                      Receipt
                    </a>
                  )}
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-medium">
                <span className="text-slate-700">Total Paid</span>
                <span className="text-emerald-600">{formatCurrency(record.totalPaid)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No payments recorded</p>
          )}
        </InfoCard>
      </div>

      {/* Attachments */}
      {record.attachments && record.attachments.length > 0 && (
        <InfoCard
          title="Attachments"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          }
        >
          <ul className="space-y-2">
            {record.attachments.map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm text-slate-700 truncate">{a.name}</span>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium shrink-0 ml-2"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </InfoCard>
      )}

      {/* Notes */}
      {record.notes && (
        <InfoCard
          title="Notes"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          }
        >
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{record.notes}</p>
        </InfoCard>
      )}

      {/* Audit */}
      <div className="text-xs text-slate-400 pt-2">
        Created {formatDate(record.createdAt)}
        {record.createdBy && ` by ${record.createdBy.name}`}
      </div>
    </div>
  );
}
