import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import type { LoginResponse } from 'types';

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code received.');
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const params = new URLSearchParams({ code, redirectUri });
    const url = `/auth/oauth/google?${params.toString()}`;

    (async () => {
      try {
        const response = await api<LoginResponse & { requiresPhone?: boolean }>(url, {
          method: 'POST',
          body: JSON.stringify({ code, redirectUri }),
        });
        if (cancelledRef.current) return;
        completeOAuthLogin(response);
        setStatus('success');
        requestAnimationFrame(() => {
          navigate('/', { replace: true });
        });
      } catch (err) {
        if (cancelledRef.current) return;
        setStatus('error');
        let msg = 'Sign-in failed.';
        if (err instanceof Error) {
          const body = (
            err as Error & { responseBody?: { error?: { message?: string; details?: unknown } } }
          ).responseBody;
          msg = body?.error?.message ?? err.message;
        }
        setErrorMessage(msg);
      }
    })();
    return () => {
      cancelledRef.current = true;
    };
  }, [searchParams, completeOAuthLogin, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600">Signing you in with Google…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 text-center">{errorMessage}</p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="text-sm text-indigo-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return null;
}
