import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCertificates();
  }, [filter]);

  async function fetchCertificates() {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.expiringSoon) params.append('expiringSoon', 'true');

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/compliance/certificates?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const getCertTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      trade_license: '🏪',
      fire_safety: '🔥',
      health_safety: '⚕️',
      environmental: '🌿',
      import_license: '📥',
      export_license: '📤',
      quality_certification: '✅',
      insurance: '🛡️',
      professional_license: '📜',
      tax_clearance: '💰',
      other: '📄',
    };
    return icons[type] || '📄';
  };

  const getStatusBadge = (status: string, expiryStatus?: string) => {
    if (status === 'expired' || expiryStatus === 'expired') {
      return 'bg-red-100 text-red-800';
    }
    if (expiryStatus === 'critical') {
      return 'bg-red-100 text-red-800';
    }
    if (expiryStatus === 'warning') {
      return 'bg-orange-100 text-orange-800';
    }
    if (status === 'active') {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (status === 'suspended') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-slate-100 text-slate-800';
  };

  const getExpiryLabel = (daysUntilExpiry?: number, expiryStatus?: string) => {
    if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
      return 'No expiry';
    }
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    }
    if (daysUntilExpiry === 0) {
      return 'Expires today';
    }
    if (daysUntilExpiry === 1) {
      return 'Expires tomorrow';
    }
    return `${daysUntilExpiry} days left`;
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
          <h1 className="text-2xl font-bold text-slate-900">Certificates & Licenses</h1>
          <p className="text-slate-500 mt-1">Manage your business certificates and licenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Certificate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="trade_license">Trade License</option>
            <option value="fire_safety">Fire Safety</option>
            <option value="health_safety">Health & Safety</option>
            <option value="environmental">Environmental</option>
            <option value="import_license">Import License</option>
            <option value="export_license">Export License</option>
            <option value="quality_certification">Quality Certification</option>
            <option value="insurance">Insurance</option>
            <option value="professional_license">Professional License</option>
            <option value="tax_clearance">Tax Clearance</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="pending_renewal">Pending Renewal</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filter.expiringSoon}
              onChange={(e) => setFilter({ ...filter, expiringSoon: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCertTypeIcon(cert.certificateType)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                    <p className="text-sm text-slate-500">
                      {getCertTypeLabel(cert.certificateType)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate #</span>
                  <span className="text-slate-900 font-mono">{cert.certificateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued</span>
                  <span className="text-slate-900">{formatDate(cert.issueDate)}</span>
                </div>
                {cert.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expires</span>
                    <span className="text-slate-900">{formatDate(cert.expiryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Authority</span>
                  <span className="text-slate-900 truncate max-w-[150px]">
                    {cert.issuingAuthority}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                      cert.status,
                      cert.expiryStatus
                    )}`}
                  >
                    {cert.status}
                  </span>
                  {cert.daysUntilExpiry !== null && cert.daysUntilExpiry !== undefined && (
                    <span
                      className={`text-xs ${
                        cert.daysUntilExpiry <= 7
                          ? 'text-red-600'
                          : cert.daysUntilExpiry <= 30
                          ? 'text-orange-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {getExpiryLabel(cert.daysUntilExpiry, cert.expiryStatus)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View
                  </button>
                  {cert.renewalRequired && cert.expiryDate && (
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Renew
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
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
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No Certificates Found</h2>
          <p className="text-slate-500 mb-6">
            {filter.type || filter.status || filter.expiringSoon
              ? 'No certificates match your current filters.'
              : 'Start adding your business certificates and licenses.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add First Certificate
          </button>
        </div>
      )}

      {/* Add Form Modal Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Certificate</h2>
            <p className="text-slate-500 mb-4">
              Certificate form will be implemented here with fields for certificate type, number,
              issuing authority, dates, and document upload.
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
