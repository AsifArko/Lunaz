import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from '@/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

function isValidPhone(p: string): boolean {
  return PHONE_REGEX.test(p.replace(/\s/g, ''));
}

interface SetPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetPhoneModal({ isOpen, onClose }: SetPhoneModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, clearRequiresPhone } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/[^\d+]/g, ''));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = phone.trim();
    if (!trimmed) {
      setError('Please enter your phone number');
      return;
    }
    if (!isValidPhone(trimmed)) {
      setError(
        'Please enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)'
      );
      return;
    }

    if (!token) return;

    setIsSubmitting(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ phone: trimmed }),
        token,
      });
      clearRequiresPhone();
      addToast('Phone number added successfully', 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save phone number');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    clearRequiresPhone();
    onClose();
    navigate('/account?setPhone=1', { replace: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add your phone number"
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
          <Button type="submit" form="set-phone-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600 text-sm mb-4 text-left">
        Please add your phone number to complete your profile to place orders.
      </p>
      <form id="set-phone-form" onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX or +8801XXXXXXXXX"
            autoFocus
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
      </form>
    </Modal>
  );
}
