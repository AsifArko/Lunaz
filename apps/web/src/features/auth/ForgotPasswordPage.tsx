import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Input } from '@lunaz/ui';
import { api } from '../../api/client';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err) {
      // Show success anyway to prevent email enumeration
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8">
        <Container maxWidth="sm">
          <Card className="mt-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 mb-6">
              If an account exists for {email}, we've sent instructions to reset your password.
            </p>
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              ← Back to login
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container maxWidth="sm">
        <Card className="mt-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password</h1>
          <p className="text-gray-600 mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" fullWidth loading={isLoading}>
              Send reset link
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
