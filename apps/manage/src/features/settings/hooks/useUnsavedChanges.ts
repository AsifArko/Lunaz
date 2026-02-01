import { useEffect, useCallback } from 'react';

export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const warningMessage = message || 'You have unsaved changes. Are you sure you want to leave?';

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, warningMessage]);

  // Function to confirm navigation
  const confirmNavigation = useCallback(
    (callback: () => void) => {
      if (isDirty) {
        const confirmed = window.confirm(warningMessage);
        if (confirmed) {
          callback();
        }
      } else {
        callback();
      }
    },
    [isDirty, warningMessage]
  );

  return { confirmNavigation };
}
