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
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    loginWithGoogle,
    // loginWithFacebook, — used when Facebook OAuth button is enabled
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const redirect = searchParams.get('redirect') || '/';
  const passwordStrength = getPasswordStrength(password);

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

  const handlePhoneChange = (value: string) => setPhone(value.replace(/[^\d+]/g, ''));

  const isValidPhone = (p: string) => {
    return /^(\+?88)?01[3-9]\d{8}$/.test(p) || /^\+?[1-9]\d{7,14}$/.test(p);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name: email.split('@')[0], email, phone, password });
      addToast('Account created successfully!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await loginWithGoogle();
      addToast('Account created!', 'success');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed');
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
  //     addToast('Account created!', 'success');
  //     navigate(redirect, { replace: true });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Facebook sign-up failed');
  //   } finally {
  //     setOauthLoading(null);
  //   }
  // };

  const inputClass =
    'w-full h-[42px] px-3.5 text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50/50 border-0 rounded-xl outline-none transition-all hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-200';

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Canvas Animation Background */}
      <AuthBackground config={PRESET_SUBTLE} />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-[22px] font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">Get started with your free account</p>
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-400 font-normal">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@company.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Phone <span className="text-red-400 font-normal">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                autoComplete="tel"
                placeholder="+8801XXXXXXXXX"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                Password <span className="text-red-400 font-normal">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

              {/* Password requirements */}
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
                Confirm password <span className="text-red-400 font-normal">*</span>
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

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-[12px] text-gray-500 leading-relaxed cursor-pointer select-none"
              >
                I agree to the{' '}
                <Link to="/terms" className="text-gray-700 hover:underline outline-none">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-gray-700 hover:underline outline-none">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || oauthLoading !== null || !agreedToTerms}
              className="w-full h-[42px] flex items-center justify-center text-[14px] font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none mt-5"
            >
              {isLoading ? <Spinner size="sm" color="white" /> : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-gray-500">
          Already have an account?{' '}
          <Link
            to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-gray-900 hover:underline font-medium outline-none"
          >
            Sign in
          </Link>
        </p>

        {/* Security */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
