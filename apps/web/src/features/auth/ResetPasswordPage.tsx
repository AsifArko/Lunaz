import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Input } from '@lunaz/ui';
import { api } from '../../api/client';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false);
        setError('Invalid or missing reset token');
        return;
      }

      try {
        const res = await api<{ valid: boolean }>('/auth/validate-reset-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setTokenValid(res.valid);
        if (!res.valid) {
          setError('This reset link has expired or is invalid');
        }
      } catch (err) {
        setError('This reset link has expired or is invalid');
      } finally {
        setIsValidating(false);
      }
    }
    validateToken();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="py-8">
        <Container maxWidth="sm">
          <Card className="mt-8 text-center">
            <div className="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full" />
            <p className="text-gray-600">Validating reset link...</p>
          </Card>
        </Container>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid && !success) {
    return (
      <div className="py-8">
        <Container maxWidth="sm">
          <Card className="mt-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid reset link</h1>
            <p className="text-gray-600 mb-6">
              {error || 'This password reset link has expired or is invalid.'}
            </p>
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
              Request a new reset link →
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="py-8">
        <Container maxWidth="sm">
          <Card className="mt-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link to="/login">
              <Button>Go to login</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  // Reset form
  return (
    <div className="py-8">
      <Container maxWidth="sm">
        <Card className="mt-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
          <p className="text-gray-600 mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
            />
            <Button type="submit" fullWidth loading={isLoading}>
              Reset password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
