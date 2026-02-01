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
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchAuthenticity();
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Authenticity</h1>
          <p className="text-slate-500 mt-1">
            Manage your business registration and authenticity documents
          </p>
        </div>

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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No Business Record Found</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            You haven't set up your business authenticity information yet. Add your business
            registration details to get started.
          </p>
          <button
            onClick={() => setEditMode(true)}
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
            Add Business Information
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Authenticity</h1>
          <p className="text-slate-500 mt-1">
            Manage your business registration and authenticity documents
          </p>
        </div>
        <button
          onClick={() => setEditMode(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>

      {/* Business Registration Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Business Registration</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Legal Name</label>
              <p className="text-slate-900 font-medium">{data.legalName}</p>
            </div>
            {data.tradingName && (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Trading Name</label>
                <p className="text-slate-900">{data.tradingName}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Registration Type
              </label>
              <p className="text-slate-900">{getRegistrationTypeLabel(data.registrationType)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Registration Number
              </label>
              <p className="text-slate-900 font-mono">{data.registrationNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Registration Date
              </label>
              <p className="text-slate-900">{formatDate(data.registrationDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Registration Authority
              </label>
              <p className="text-slate-900">{data.registrationAuthority}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  data.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {data.status}
              </span>
            </div>
            {data.authorizedCapital && (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Authorized Capital
                </label>
                <p className="text-slate-900">{formatCurrency(data.authorizedCapital)}</p>
              </div>
            )}
            {data.paidUpCapital && (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Paid-up Capital
                </label>
                <p className="text-slate-900">{formatCurrency(data.paidUpCapital)}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Registered Address
            </label>
            <p className="text-slate-900">
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Tax Identifiers</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Identifier
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {data.taxIdentifiers.length > 0 ? (
            data.taxIdentifiers.map((identifier) => (
              <div key={identifier._id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{getTaxIdLabel(identifier.type)}</p>
                  <p className="text-slate-600 font-mono">{identifier.number}</p>
                  {identifier.issuingAuthority && (
                    <p className="text-sm text-slate-500 mt-1">
                      Issued by: {identifier.issuingAuthority}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    identifier.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {identifier.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">No tax identifiers added yet</div>
          )}
        </div>
      </div>

      {/* Directors & Owners */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Directors & Owners</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Director
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {data.directors.length > 0 ? (
            data.directors.map((director) => (
              <div key={director._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{director.name}</p>
                    <p className="text-sm text-slate-600">{getRoleLabel(director.role)}</p>
                    {director.ownershipPercentage !== undefined && (
                      <p className="text-sm text-slate-500 mt-1">
                        Ownership: {director.ownershipPercentage}%
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      director.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {director.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>
                    {director.identityType.toUpperCase()}: {director.identityNumber}
                  </span>
                  {director.email && <span>Email: {director.email}</span>}
                  {director.phone && <span>Phone: {director.phone}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">No directors added yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
