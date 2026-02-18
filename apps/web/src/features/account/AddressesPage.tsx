import { useState, useEffect, type FormEvent } from 'react';
import type { Address, User } from 'types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="w-4 h-4"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Input Field Component
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, id, className = '', ...props }: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
}

interface AddressFormData {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyForm: AddressFormData = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

function getLabelIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes('home') || lower.includes('house')) return <HomeIcon />;
  if (lower.includes('office') || lower.includes('work') || lower.includes('business'))
    return <BuildingIcon />;
  return <MapPinIcon />;
}

export function AddressesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
    // fetchAddresses is defined in component scope and doesn't need to be a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchAddresses() {
    if (!token) return;
    try {
      const user = await api<User>('/users/me', { token });
      setAddresses(user.addresses || []);
    } catch {
      addToast('Failed to load addresses', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      const body = {
        label: formData.label || undefined,
        line1: formData.line1,
        line2: formData.line2 || undefined,
        city: formData.city,
        state: formData.state || undefined,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      if (editingId) {
        await api(`/users/me/addresses/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
          token,
        });
        addToast('Address updated', 'success');
      } else {
        await api('/users/me/addresses', {
          method: 'POST',
          body: JSON.stringify(body),
          token,
        });
        addToast('Address added', 'success');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchAddresses();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save address', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state || '',
      postalCode: address.postalCode,
      country: address.country,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this address?')) return;

    setDeletingId(id);
    try {
      await api(`/users/me/addresses/${id}`, {
        method: 'DELETE',
        token,
      });
      addToast('Address deleted', 'success');
      fetchAddresses();
    } catch {
      addToast('Failed to delete address', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!token) return;

    try {
      await api(`/users/me/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isDefault: true }),
        token,
      });
      addToast('Default address updated', 'success');
      fetchAddresses();
    } catch {
      addToast('Failed to update default address', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {addresses.length === 0
              ? 'Add your shipping and billing addresses'
              : `${addresses.length} address${addresses.length === 1 ? '' : 'es'} saved`}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <PlusIcon />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="text-gray-400">
              <MapPinIcon />
            </span>
            <h3 className="text-base font-semibold text-gray-900">
              {editingId ? 'Edit Address' : 'New Address'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              <InputField
                label="Label"
                placeholder="Home, Office, etc."
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />

              <InputField
                label="Street Address"
                placeholder="House number and street name"
                value={formData.line1}
                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                required
              />

              <InputField
                label="Apartment, Suite, etc. (Optional)"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.line2}
                onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="City"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <InputField
                  label="State / Province"
                  placeholder="Enter state or province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Postal Code"
                  placeholder="Enter postal code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
                <InputField
                  label="Country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSaving ? <LoadingSpinner /> : <CheckIcon />}
                {isSaving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
              >
                <XIcon />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400">
              <MapPinIcon />
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Add your first address to make checkout faster and easier.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <PlusIcon />
            Add Your First Address
          </button>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length > 0 && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-sm ${
                address.isDefault ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      address.isDefault ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {address.label ? getLabelIcon(address.label) : <MapPinIcon />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {address.label && (
                        <span className="text-sm font-medium text-gray-900">{address.label}</span>
                      )}
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          <StarIcon filled />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}
                        {address.state ? `, ${address.state}` : ''} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-1">
                <button
                  onClick={() => handleEdit(address)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PencilIcon />
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <StarIcon />
                    Set Default
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === address.id ? <LoadingSpinner /> : <TrashIcon />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
