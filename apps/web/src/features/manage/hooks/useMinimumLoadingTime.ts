import { useState, useEffect, useRef } from 'react';

/**
 * Ensures loading state is visible for at least minMs, even if data loads instantly.
 * Prevents imperceptible flash - users will actually see the skeleton/loader.
 */
export function useMinimumLoadingTime(isLoading: boolean, minMs = 450): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      loadingStartedRef.current = Date.now();
      setShowLoading(true);
    } else {
      const elapsed = loadingStartedRef.current ? Date.now() - loadingStartedRef.current : minMs;
      const remaining = Math.max(0, minMs - elapsed);
      const timer = setTimeout(() => {
        setShowLoading(false);
        loadingStartedRef.current = null;
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minMs]);

  return showLoading;
}
