import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/ui';
import { api } from '../../api/client';

const CheckIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 ${active ? 'text-emerald-500' : 'text-gray-300'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const getPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  return { score: Object.values(checks).filter(Boolean).length, checks };
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false);
        return;
      }
      try {
        const res = await api<{ valid: boolean }>('/auth/validate-reset-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setTokenValid(res.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    }
    validateToken();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password');
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
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full h-[42px] px-3.5 text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50/50 border-0 rounded-xl outline-none transition-all hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200';

  // Loading
  if (isValidating) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-[13px] text-gray-500">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid && !success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[380px] text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">Link expired</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">
            This reset link has expired or is invalid.
          </p>
          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 h-[42px] px-5 text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors outline-none"
            >
              Request new link
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[380px] text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">Password updated</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">
            Your password has been reset successfully.
          </p>
          <p className="mt-1 text-[12px] text-gray-400">Redirecting to sign in...</p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 h-[42px] px-5 text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors outline-none"
            >
              Sign in now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">Set new password</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">Create a strong, secure password.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 rounded-xl">
              <svg
                className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[13px] text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none"
                >
                  {showPassword ? (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckIcon active={passwordStrength.checks.length} />
                    <span
                      className={`text-[11px] ${passwordStrength.checks.length ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      8+ chars
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckIcon active={passwordStrength.checks.mixed} />
                    <span
                      className={`text-[11px] ${passwordStrength.checks.mixed ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      Aa
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckIcon active={passwordStrength.checks.number} />
                    <span
                      className={`text-[11px] ${passwordStrength.checks.number ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      123
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className={`${inputClass} ${confirmPassword && password !== confirmPassword ? '!ring-1 !ring-red-200 !bg-red-50/30' : ''}`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">Passwords don't match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                  <CheckIcon active={true} /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
            >
              {isLoading ? <Spinner size="sm" color="white" /> : 'Reset password'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors outline-none"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
