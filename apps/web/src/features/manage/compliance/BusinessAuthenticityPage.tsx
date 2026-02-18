import { useState, useEffect } from 'react';
import { API_URL } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useComplianceUpload } from './hooks/useComplianceUpload';
import { DocumentUploadZone } from './components/DocumentUploadZone';
import { Select } from './components/Select';

interface Director {
  _id: string;
  name: string;
  role: string;
  ownershipPercentage?: number;
  identityType: string;
  identityNumber: string;
  email?: string;
  phone?: string;
  appointmentDate?: string;
  isActive: boolean;
}

interface TaxIdentifier {
  _id: string;
  type: string;
  number: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  status: string;
}

interface BusinessAuthenticity {
  _id: string;
  registrationType: string;
  legalName: string;
  tradingName?: string;
  registrationNumber: string;
  registrationDate: string;
  registrationAuthority: string;
  registeredAddress: {
    street?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  status: string;
  expiryDate?: string;
  taxIdentifiers: TaxIdentifier[];
  directors: Director[];
  authorizedCapital?: number;
  paidUpCapital?: number;
  registrationCertificate?: string;
  memorandumOfAssociation?: string;
  articlesOfAssociation?: string;
}

export function BusinessAuthenticityPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<BusinessAuthenticity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddIdentifier, setShowAddIdentifier] = useState(false);
  const [showAddDirector, setShowAddDirector] = useState(false);

  useEffect(() => {
    fetchAuthenticity();
    // fetchAuthenticity depends on token which is stable from useAdminAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAuthenticity() {
    try {
      const res = await fetch(`${API_URL}/compliance/authenticity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json._id) {
          setData(json);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch authenticity:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRegistrationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sole_proprietorship: 'Sole Proprietorship',
      partnership: 'Partnership',
      llc: 'Limited Liability Company (LLC)',
      corporation: 'Corporation',
      cooperative: 'Cooperative',
      ngo: 'Non-Governmental Organization (NGO)',
    };
    return labels[type] || type;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Owner',
      director: 'Director',
      partner: 'Partner',
      shareholder: 'Shareholder',
      authorized_signatory: 'Authorized Signatory',
    };
    return labels[role] || role;
  };

  const getTaxIdLabel = (type: string) => {
    const labels: Record<string, string> = {
      tin: 'TIN (Tax Identification Number)',
      bin: 'BIN (Business Identification Number)',
      vat: 'VAT Registration',
      iec: 'Import/Export Code',
      gst: 'GST/HST Number',
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

  if (!data) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Business Authenticity</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your business registration and authenticity documents
          </p>
        </div>

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
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No Business Record Found</h2>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            You haven't set up your business authenticity information yet. Add your business
            registration details to get started.
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
            Add Business Information
          </button>
        </div>

        {showForm && token && (
          <BusinessAuthenticityFormModal
            existing={null}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchAuthenticity();
            }}
            token={token}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Business Authenticity</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your business registration and authenticity documents
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
            />
          </svg>
          Edit
        </button>
      </div>

      {/* Business Registration Card */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-sm font-medium text-slate-900">Business Registration</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Legal Name</label>
              <p className="text-sm text-slate-900 font-medium">{data.legalName}</p>
            </div>
            {data.tradingName && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Trading Name</label>
                <p className="text-sm text-slate-900">{data.tradingName}</p>
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Registration Type</label>
              <p className="text-sm text-slate-900">
                {getRegistrationTypeLabel(data.registrationType)}
              </p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Registration Number</label>
              <p className="text-sm text-slate-900 font-mono">{data.registrationNumber}</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Registration Date</label>
              <p className="text-sm text-slate-900">{formatDate(data.registrationDate)}</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Registration Authority</label>
              <p className="text-sm text-slate-900">{data.registrationAuthority}</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  data.status === 'active'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {data.status}
              </span>
            </div>
            {data.authorizedCapital && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Authorized Capital</label>
                <p className="text-sm text-slate-900">{formatCurrency(data.authorizedCapital)}</p>
              </div>
            )}
            {data.paidUpCapital && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Paid-up Capital</label>
                <p className="text-sm text-slate-900">{formatCurrency(data.paidUpCapital)}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <label className="block text-xs text-slate-400 mb-1">Registered Address</label>
            <p className="text-sm text-slate-900">
              {data.registeredAddress.street && `${data.registeredAddress.street}, `}
              {data.registeredAddress.city}
              {data.registeredAddress.state && `, ${data.registeredAddress.state}`}
              {data.registeredAddress.postalCode && ` ${data.registeredAddress.postalCode}`}
              {`, ${data.registeredAddress.country}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tax Identifiers */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-slate-500"
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
            <h2 className="text-sm font-medium text-slate-900">Tax Identifiers</h2>
          </div>
          <button
            onClick={() => setShowAddIdentifier(true)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            + Add Identifier
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {data.taxIdentifiers.length > 0 ? (
            data.taxIdentifiers.map((identifier) => (
              <div key={identifier._id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {getTaxIdLabel(identifier.type)}
                  </p>
                  <p className="text-sm text-slate-500 font-mono">{identifier.number}</p>
                  {identifier.issuingAuthority && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Issued by: {identifier.issuingAuthority}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    identifier.status === 'active'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {identifier.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No tax identifiers added yet
            </div>
          )}
        </div>
      </div>

      {/* Directors & Owners */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-medium text-slate-900">Directors & Owners</h2>
          </div>
          <button
            onClick={() => setShowAddDirector(true)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            + Add Director
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {data.directors.length > 0 ? (
            data.directors.map((director) => (
              <div key={director._id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{director.name}</p>
                    <p className="text-xs text-slate-500">{getRoleLabel(director.role)}</p>
                    {director.ownershipPercentage !== undefined && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ownership: {director.ownershipPercentage}%
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      director.isActive
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {director.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>
                    {director.identityType.toUpperCase()}: {director.identityNumber}
                  </span>
                  {director.email && <span>{director.email}</span>}
                  {director.phone && <span>{director.phone}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No directors added yet
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && token && (
        <BusinessAuthenticityFormModal
          existing={data}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchAuthenticity();
          }}
          token={token}
        />
      )}

      {/* Add Tax Identifier Modal */}
      {showAddIdentifier && token && data && (
        <AddTaxIdentifierModal
          onClose={() => setShowAddIdentifier(false)}
          onSuccess={() => {
            setShowAddIdentifier(false);
            fetchAuthenticity();
          }}
          token={token}
          entityId={data._id}
        />
      )}

      {/* Add Director Modal */}
      {showAddDirector && token && data && (
        <AddDirectorModal
          onClose={() => setShowAddDirector(false)}
          onSuccess={() => {
            setShowAddDirector(false);
            fetchAuthenticity();
          }}
          token={token}
          entityId={data._id}
        />
      )}
    </div>
  );
}

function BusinessAuthenticityFormModal({
  existing,
  onClose,
  onSuccess,
  token,
}: {
  existing: BusinessAuthenticity | null;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const entityId = existing?._id || 'new';
  const { uploadFile, uploading, error } = useComplianceUpload('authenticity', entityId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    registrationType: existing?.registrationType || 'llc',
    legalName: existing?.legalName || '',
    tradingName: existing?.tradingName || '',
    registrationNumber: existing?.registrationNumber || '',
    registrationDate: existing?.registrationDate
      ? new Date(existing.registrationDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    registrationAuthority: existing?.registrationAuthority || '',
    city: existing?.registeredAddress?.city || '',
    country: existing?.registeredAddress?.country || 'Bangladesh',
    street: existing?.registeredAddress?.street || '',
    state: existing?.registeredAddress?.state || '',
    postalCode: existing?.registeredAddress?.postalCode || '',
    notes: '',
  });
  const [registrationCertificate, setRegistrationCertificate] = useState(
    existing?.registrationCertificate || ''
  );
  const [memorandumOfAssociation, setMemorandumOfAssociation] = useState(
    existing?.memorandumOfAssociation || ''
  );
  const [articlesOfAssociation, setArticlesOfAssociation] = useState(
    existing?.articlesOfAssociation || ''
  );

  const handleFileUpload = async (file: File, setter: (url: string) => void) => {
    const url = await uploadFile(file);
    if (url) setter(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const registeredAddress = {
        street: form.street || undefined,
        city: form.city,
        state: form.state || undefined,
        postalCode: form.postalCode || undefined,
        country: form.country,
      };
      const body = {
        registrationType: form.registrationType,
        legalName: form.legalName,
        tradingName: form.tradingName || undefined,
        registrationNumber: form.registrationNumber,
        registrationDate: new Date(form.registrationDate).toISOString(),
        registrationAuthority: form.registrationAuthority,
        registeredAddress,
        registrationCertificate: registrationCertificate || undefined,
        memorandumOfAssociation: memorandumOfAssociation || undefined,
        articlesOfAssociation: articlesOfAssociation || undefined,
        notes: form.notes || undefined,
      };
      const method = existing ? 'PATCH' : 'POST';
      const res = await fetch(`${API_URL}/compliance/authenticity`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to save');
      }
      onSuccess();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {existing ? 'Edit Business Information' : 'Add Business Information'}
          </h2>
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
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Registration Type
            </label>
            <Select
              value={form.registrationType}
              onChange={(v) => setForm({ ...form, registrationType: v })}
              options={[
                { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                { value: 'partnership', label: 'Partnership' },
                { value: 'llc', label: 'LLC' },
                { value: 'corporation', label: 'Corporation' },
                { value: 'cooperative', label: 'Cooperative' },
                { value: 'ngo', label: 'NGO' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Legal Name *</label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Trading Name</label>
              <input
                type="text"
                value={form.tradingName}
                onChange={(e) => setForm({ ...form, tradingName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                required
                disabled={!!existing}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Registration Date *
              </label>
              <input
                type="date"
                value={form.registrationDate}
                onChange={(e) => setForm({ ...form, registrationDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Registration Authority *
            </label>
            <input
              type="text"
              value={form.registrationAuthority}
              onChange={(e) => setForm({ ...form, registrationAuthority: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Country *</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Street</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Documents</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Registration Certificate</label>
              <DocumentUploadZone
                onFileSelect={(f) => handleFileUpload(f, setRegistrationCertificate)}
                uploading={uploading}
                error={error}
                label="Upload registration certificate"
              />
              {registrationCertificate && (
                <a
                  href={registrationCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 mt-1 block truncate"
                >
                  Uploaded ✓
                </a>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Memorandum of Association</label>
              <DocumentUploadZone
                onFileSelect={(f) => handleFileUpload(f, setMemorandumOfAssociation)}
                uploading={uploading}
                error={error}
                label="Upload MoA"
              />
              {memorandumOfAssociation && (
                <a
                  href={memorandumOfAssociation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 mt-1 block truncate"
                >
                  Uploaded ✓
                </a>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Articles of Association</label>
              <DocumentUploadZone
                onFileSelect={(f) => handleFileUpload(f, setArticlesOfAssociation)}
                uploading={uploading}
                error={error}
                label="Upload AoA"
              />
              {articlesOfAssociation && (
                <a
                  href={articlesOfAssociation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 mt-1 block truncate"
                >
                  Uploaded ✓
                </a>
              )}
            </div>
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

function AddTaxIdentifierModal({
  onClose,
  onSuccess,
  token,
  entityId,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  entityId: string;
}) {
  const { uploadFile, uploading, error } = useComplianceUpload('authenticity', entityId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'tin' as const,
    number: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
  });
  const [certificate, setCertificate] = useState('');

  const handleFileUpload = async (file: File) => {
    const url = await uploadFile(file);
    if (url) setCertificate(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const body = {
        type: form.type,
        number: form.number.trim(),
        issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        issuingAuthority: form.issuingAuthority.trim() || undefined,
        certificate: certificate || undefined,
      };
      const res = await fetch(`${API_URL}/compliance/authenticity/tax-identifiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to add identifier');
      }
      onSuccess();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add identifier');
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
          <h2 className="text-base font-semibold text-slate-900">Add Tax Identifier</h2>
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
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
            <Select
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v as typeof form.type })}
              options={[
                { value: 'tin', label: 'TIN (Tax Identification Number)' },
                { value: 'bin', label: 'BIN (Business Identification Number)' },
                { value: 'vat', label: 'VAT Registration' },
                { value: 'iec', label: 'Import/Export Code' },
                { value: 'gst', label: 'GST/HST Number' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Number *</label>
            <input
              type="text"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              required
              placeholder="e.g. 123-456-7890"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Issue Date</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Issuing Authority
            </label>
            <input
              type="text"
              value={form.issuingAuthority}
              onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
              placeholder="e.g. NBR, City Corporation"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Certificate (optional)
            </label>
            <DocumentUploadZone
              onFileSelect={handleFileUpload}
              uploading={uploading}
              error={error}
              label="Upload certificate document"
            />
            {certificate && (
              <a
                href={certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 mt-1 block truncate"
              >
                Uploaded ✓
              </a>
            )}
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
              {submitting ? 'Adding...' : 'Add Identifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddDirectorModal({
  onClose,
  onSuccess,
  token,
  entityId,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  entityId: string;
}) {
  const { uploadFile, uploading, error } = useComplianceUpload('authenticity', entityId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'director' as const,
    ownershipPercentage: '' as number | '',
    identityType: 'nid' as const,
    identityNumber: '',
    email: '',
    phone: '',
    appointmentDate: '',
  });
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);

  const handleFileUpload = async (file: File) => {
    const url = await uploadFile(file);
    if (url) setDocuments((d) => [...d, { name: file.name, url }]);
  };

  const removeDocument = (idx: number) => {
    setDocuments((d) => d.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        role: form.role,
        ownershipPercentage:
          form.ownershipPercentage === '' ? undefined : Number(form.ownershipPercentage),
        identityType: form.identityType,
        identityNumber: form.identityNumber.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        appointmentDate: form.appointmentDate
          ? new Date(form.appointmentDate).toISOString()
          : undefined,
        documents: documents.length > 0 ? documents : undefined,
      };
      const res = await fetch(`${API_URL}/compliance/authenticity/directors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to add director');
      }
      onSuccess();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add director');
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
          <h2 className="text-base font-semibold text-slate-900">Add Director / Owner</h2>
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
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Full name"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role *</label>
              <Select
                value={form.role}
                onChange={(v) => setForm({ ...form, role: v as typeof form.role })}
                options={[
                  { value: 'owner', label: 'Owner' },
                  { value: 'director', label: 'Director' },
                  { value: 'partner', label: 'Partner' },
                  { value: 'shareholder', label: 'Shareholder' },
                  { value: 'authorized_signatory', label: 'Authorized Signatory' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ownership %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={form.ownershipPercentage === '' ? '' : form.ownershipPercentage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ownershipPercentage: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="0-100"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ID Type *</label>
              <Select
                value={form.identityType}
                onChange={(v) => setForm({ ...form, identityType: v as typeof form.identityType })}
                options={[
                  { value: 'nid', label: 'NID' },
                  { value: 'passport', label: 'Passport' },
                  { value: 'driving_license', label: 'Driving License' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ID Number *</label>
              <input
                type="text"
                value={form.identityNumber}
                onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
                required
                placeholder="Identity number"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+880..."
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Documents (optional)
            </label>
            <DocumentUploadZone
              onFileSelect={handleFileUpload}
              uploading={uploading}
              error={error}
              label="Add supporting document"
            />
            {documents.length > 0 && (
              <ul className="mt-2 space-y-1">
                {documents.map((d, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 truncate max-w-[200px]"
                    >
                      {d.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(i)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              {submitting ? 'Adding...' : 'Add Director'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
