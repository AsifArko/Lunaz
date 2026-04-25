import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@/ui';
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
    } catch {
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[380px]">
        {success ? (
          <>
            {/* Success State */}
            <div className="text-center mb-7">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-[22px] font-semibold text-gray-900">Check your email</h1>
              <p className="mt-1.5 text-[14px] text-gray-500">
                We sent a reset link to <span className="text-gray-700">{email}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-2.5">
              <Link
                to="/login"
                className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors outline-none"
              >
                Back to sign in
              </Link>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors outline-none"
              >
                Didn't receive it? Try again
              </button>
            </div>

            <p className="mt-5 text-center text-[12px] text-gray-400">
              Check your spam folder if you don't see it
            </p>
          </>
        ) : (
          <>
            {/* Form State */}
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className="text-[22px] font-semibold text-gray-900">Forgot password?</h1>
              <p className="mt-1.5 text-[14px] text-gray-500">
                No worries, we'll send you reset instructions.
              </p>
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
                    htmlFor="email"
                    className="block text-[13px] font-medium text-gray-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="w-full h-[42px] px-3.5 text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50/50 border-0 rounded-xl outline-none transition-all hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Send reset link'}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
