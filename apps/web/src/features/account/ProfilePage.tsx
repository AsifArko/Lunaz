import { useState, useEffect, type FormEvent } from 'react';
import type { User } from '@lunaz/types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Icons
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

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

// Elegant Input Component
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function InputField({ label, error, id, className = '', ...props }: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function Section({ title, description, icon, children, action }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-400">{icon}</span>}
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function ProfilePage() {
  const { user, token, logout } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original values for comparison
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const userData = await api<User>('/users/me', { token });
        setName(userData.name);
        setEmail(userData.email);
        setOriginalName(userData.name);
        setOriginalEmail(userData.email);
      } catch {
        addToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
    // addToast is stable from context, fetchProfile is defined locally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Track changes
  useEffect(() => {
    setHasChanges(name !== originalName || email !== originalEmail);
  }, [name, email, originalName, originalEmail]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, email }),
        token,
      });
      setOriginalName(name);
      setOriginalEmail(email);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
        token,
      });
      addToast('Password changed successfully', 'success');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const passwordValid = newPassword.length >= 8;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </div>
            <div className="p-6 space-y-4">
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
            <div className="p-6">
              <div className="h-10 w-36 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Section
        title="Personal Information"
        description="Update your name and email address"
        icon={<PencilIcon />}
        action={
          hasChanges && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Unsaved changes
            </span>
          )
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? <LoadingSpinner /> : <CheckIcon />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={() => {
                  setName(originalName);
                  setEmail(originalEmail);
                }}
                className="px-4 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
              >
                Discard
              </button>
            )}
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section
        title="Password & Security"
        description="Manage your account password"
        icon={<KeyIcon />}
      >
        {!showPasswordForm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Your password was last changed on your account creation.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Use a strong password with at least 8 characters
              </p>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <InputField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                error={newPassword && !passwordValid ? 'Minimum 8 characters required' : undefined}
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
              <div className="space-y-1">
                <div
                  className={`flex items-center gap-2 text-xs ${passwordValid ? 'text-gray-700' : 'text-gray-400'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordValid ? 'bg-gray-700' : 'bg-gray-300'}`}
                  />
                  At least 8 characters
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${passwordsMatch && confirmPassword ? 'text-gray-700' : 'text-gray-400'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${passwordsMatch && confirmPassword ? 'bg-gray-700' : 'bg-gray-300'}`}
                  />
                  Passwords match
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  isChangingPassword || !passwordValid || !passwordsMatch || !currentPassword
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isChangingPassword ? <LoadingSpinner /> : <KeyIcon />}
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
              >
                <XIcon />
                Cancel
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* Account Actions */}
      <Section title="Account" description="Manage your session" icon={<LogOutIcon />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Currently signed in as{' '}
              <span className="font-medium text-gray-900">{user?.email}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              You will need to sign in again after logging out
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <LogOutIcon />
            Sign Out
          </button>
        </div>
      </Section>
    </div>
  );
}
