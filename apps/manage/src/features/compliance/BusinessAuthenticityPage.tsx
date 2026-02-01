import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
}

export function BusinessAuthenticityPage() {
  const { token } = useAuth();
  const [data, setData] = useState<BusinessAuthenticity | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setEditMode] = useState(false);

  useEffect(() => {
    fetchAuthenticity();
    // fetchAuthenticity depends on token which is stable from useAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAuthenticity() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/compliance/authenticity`, {
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
            onClick={() => setEditMode(true)}
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
          onClick={() => setEditMode(true)}
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
          <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
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
          <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
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
    </div>
  );
}
