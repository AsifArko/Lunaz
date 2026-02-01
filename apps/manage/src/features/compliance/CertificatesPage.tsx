import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Certificate {
  _id: string;
  certificateType: string;
  certificateNumber: string;
  name: string;
  description?: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  renewalRequired: boolean;
  renewalFee?: number;
  certificateFile: string;
  tags?: string[];
  daysUntilExpiry?: number;
  expiryStatus?: string;
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

export function CertificatesPage() {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    expiringSoon: false,
  });
  const [showForm, setShowForm] = useState(false);

  const typeOptions: DropdownOption[] = [
    { value: 'trade_license', label: 'Trade License' },
    { value: 'fire_safety', label: 'Fire Safety' },
    { value: 'health_safety', label: 'Health & Safety' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'import_license', label: 'Import License' },
    { value: 'export_license', label: 'Export License' },
    { value: 'quality_certification', label: 'Quality Certification' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'professional_license', label: 'Professional License' },
    { value: 'tax_clearance', label: 'Tax Clearance' },
  ];

  const statusOptions: DropdownOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending_renewal', label: 'Pending Renewal' },
  ];

  useEffect(() => {
    fetchCertificates();
  }, [filter]);

  async function fetchCertificates() {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.expiringSoon) params.append('expiringSoon', 'true');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/compliance/certificates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCertificates(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trade_license: 'Trade License',
      fire_safety: 'Fire Safety',
      health_safety: 'Health & Safety',
      environmental: 'Environmental',
      import_license: 'Import License',
      export_license: 'Export License',
      quality_certification: 'Quality Certification',
      insurance: 'Insurance',
      professional_license: 'Professional License',
      tax_clearance: 'Tax Clearance',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string, expiryStatus?: string) => {
    if (status === 'expired' || expiryStatus === 'expired' || expiryStatus === 'critical') {
      return 'bg-slate-900 text-white';
    }
    return 'bg-slate-100 text-slate-700';
  };

  const getExpiryLabel = (daysUntilExpiry?: number) => {
    if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
      return 'No expiry';
    }
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)}d ago`;
    }
    if (daysUntilExpiry === 0) {
      return 'Expires today';
    }
    if (daysUntilExpiry === 1) {
      return 'Expires tomorrow';
    }
    return `${daysUntilExpiry} days`;
  };

  const clearFilters = () => {
    setFilter({ type: '', status: '', expiringSoon: false });
  };

  const hasActiveFilters = filter.type || filter.status || filter.expiringSoon;

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
          <h1 className="text-xl font-semibold text-slate-900">Certificates & Licenses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your business certificates and licenses
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
          Add Certificate
        </button>
      </div>

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
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <Dropdown
            value={filter.type}
            onChange={(value) => setFilter({ ...filter, type: value })}
            options={typeOptions}
            placeholder="All Types"
          />
          <Dropdown
            value={filter.status}
            onChange={(value) => setFilter({ ...filter, status: value })}
            options={statusOptions}
            placeholder="All Status"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={filter.expiringSoon}
              onChange={(e) => setFilter({ ...filter, expiringSoon: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span className="text-slate-600">Expiring within 30 days</span>
          </label>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4.5 h-4.5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 text-sm">{cert.name}</h3>
                      <p className="text-xs text-slate-500">
                        {getCertTypeLabel(cert.certificateType)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusBadge(
                      cert.status,
                      cert.expiryStatus
                    )}`}
                  >
                    {cert.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate #</span>
                  <span className="text-slate-700 font-mono text-xs">{cert.certificateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issued</span>
                  <span className="text-slate-700">{formatDate(cert.issueDate)}</span>
                </div>
                {cert.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expires</span>
                    <span className="text-slate-700">{formatDate(cert.expiryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Authority</span>
                  <span className="text-slate-700 truncate max-w-[140px] text-right">
                    {cert.issuingAuthority}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                {cert.daysUntilExpiry !== null && cert.daysUntilExpiry !== undefined ? (
                  <span
                    className={`text-xs ${
                      cert.daysUntilExpiry <= 7 ? 'text-slate-900 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {getExpiryLabel(cert.daysUntilExpiry)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">No expiry</span>
                )}
                <div className="flex gap-3">
                  <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                    View
                  </button>
                  {cert.renewalRequired && cert.expiryDate && (
                    <button className="text-xs text-slate-700 hover:text-slate-900 font-medium">
                      Renew
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No Certificates Found</h2>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No certificates match your current filters.'
              : 'Start adding your business certificates and licenses.'}
          </p>
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
            Add First Certificate
          </button>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Add Certificate</h2>
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
                Certificate form will be implemented here with fields for certificate type, number,
                issuing authority, dates, and document upload.
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
