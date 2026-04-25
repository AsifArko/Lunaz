import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { StoreSettings } from 'manage-settings/types';
import { DEFAULT_STORE_SETTINGS } from 'manage-settings/utils/defaults';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface SettingsContextValue {
  settings: StoreSettings;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  saveSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  hasUnsavedChanges: boolean;
  discardChanges: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api<Partial<StoreSettings>>('/settings', { token });
      const mergedSettings = { ...DEFAULT_STORE_SETTINGS, ...data };
      setSettings(mergedSettings);
      setOriginalSettings(mergedSettings);
    } catch (err) {
      // Use defaults if fetch fails
      setSettings(DEFAULT_STORE_SETTINGS);
      setOriginalSettings(DEFAULT_STORE_SETTINGS);
      // eslint-disable-next-line no-console
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update settings locally
  const updateSettings = useCallback(
    (partial: Partial<StoreSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partial };
        setHasUnsavedChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings));
        return updated;
      });
    },
    [originalSettings]
  );

  // Save settings to backend
  const saveSettings = useCallback(async () => {
    if (!token) return;

    setError(null);

    try {
      await api('/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
        token,
      });
      setOriginalSettings(settings);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save settings'));
      throw err;
    }
  }, [token, settings]);

  // Discard unsaved changes
  const discardChanges = useCallback(() => {
    setSettings(originalSettings);
    setHasUnsavedChanges(false);
  }, [originalSettings]);

  // Refresh settings from server
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const value: SettingsContextValue = {
    settings,
    isLoading,
    error,
    updateSettings,
    saveSettings,
    refreshSettings,
    hasUnsavedChanges,
    discardChanges,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
