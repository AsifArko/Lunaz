import { useState, useEffect, type FormEvent } from 'react';
import type { User } from '@lunaz/types';
import { Card, Button, Input } from '@lunaz/ui';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function ProfilePage() {
  const { user, token, logout } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      } catch {
        addToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

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

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-12 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={isSaving}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Password Change */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Password</h2>
        {!showPasswordForm ? (
          <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
            />
            <div className="flex gap-3">
              <Button type="submit" loading={isChangingPassword}>
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <p className="text-gray-600 mb-4">
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
