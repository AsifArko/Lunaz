import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthBackground, PRESET_SUBTLE } from '../../components/AuthBackground';

// Icons
const GoogleIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Facebook OAuth — commented out for now; re-enable when ready
// const FacebookIcon = () => (
//   <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="#1877F2">
//     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//   </svg>
// );

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    login,
    loginWithGoogle,
    // loginWithFacebook, — used when Facebook OAuth button is enabled
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get('redirect') || '/';

  if (isAuthenticated) {
    navigate(redirect, { replace: true });
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });
      addToast('Welcome back!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await loginWithGoogle();
      addToast('Welcome back!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  // Facebook OAuth — commented out for now; re-enable when ready
  // const handleFacebookLogin = async () => {
  //   setOauthLoading('facebook');
  //   setError(null);
  //   try {
  //     await loginWithFacebook();
  //     addToast('Welcome back!', 'success');
  //     navigate(redirect, { replace: true });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Facebook sign-in failed');
  //   } finally {
  //     setOauthLoading(null);
  //   }
  // };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Canvas Animation Background */}
      <AuthBackground config={PRESET_SUBTLE} />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-[22px] font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">Sign in to continue to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          {/* OAuth */}
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || oauthLoading !== null}
              className="flex items-center justify-center gap-2 h-[42px] text-[13px] font-medium text-gray-700 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
            >
              {oauthLoading === 'google' ? <Spinner size="sm" /> : <GoogleIcon />}
              <span>Google</span>
            </button>
            {/* Facebook OAuth — commented out for now; re-enable when ready */}
            {/* <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isLoading || oauthLoading !== null}
              className="flex items-center justify-center gap-2 h-[42px] text-[13px] font-medium text-gray-700 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
            >
              {oauthLoading === 'facebook' ? <Spinner size="sm" /> : <FacebookIcon />}
              <span>Facebook</span>
            </button> */}
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] text-gray-400 bg-white uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Error */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@company.com"
                className="w-full h-[42px] px-3.5 text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50/50 border-0 rounded-xl outline-none transition-all hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-gray-500 hover:text-gray-700 transition-colors outline-none"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-[42px] px-3.5 pr-10 text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50/50 border-0 rounded-xl outline-none transition-all hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200"
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
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-[13px] text-gray-600 cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || oauthLoading !== null}
              className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
            >
              {isLoading ? <Spinner size="sm" color="white" /> : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-gray-500">
          Don't have an account?{' '}
          <Link
            to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-gray-900 hover:underline font-medium outline-none"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
