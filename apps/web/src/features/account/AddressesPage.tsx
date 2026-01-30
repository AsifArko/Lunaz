import { useState, useEffect, type FormEvent } from 'react';
import type { Address, User } from '@lunaz/types';
import { Card, Button, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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

export function AddressesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
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
    if (!token || !window.confirm('Delete this address?')) return;

    try {
      await api(`/users/me/addresses/${id}`, {
        method: 'DELETE',
        token,
      });
      addToast('Address deleted', 'success');
      fetchAddresses();
    } catch {
      addToast('Failed to delete address', 'error');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Addresses</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Label (optional)"
              placeholder="Home, Office, etc."
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
            <Input
              label="Address Line 1"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              required
            />
            <Input
              label="Address Line 2 (optional)"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State/Province"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={isSaving}>
                {editingId ? 'Update' : 'Add'} Address
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {addresses.length === 0 && !showForm ? (
        <Card className="text-center py-8">
          <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
          <Button onClick={() => setShowForm(true)}>Add Your First Address</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  Default
                </span>
              )}
              <div className="pr-20">
                {address.label && (
                  <span className="text-sm font-medium text-gray-500">{address.label}</span>
                )}
                <p className="text-gray-900">{address.line1}</p>
                {address.line2 && <p className="text-gray-900">{address.line2}</p>}
                <p className="text-gray-900">
                  {address.city}
                  {address.state ? `, ${address.state}` : ''} {address.postalCode}
                </p>
                <p className="text-gray-900">{address.country}</p>
              </div>
              <div className="mt-4 flex gap-3 text-sm">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
