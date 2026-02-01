import { useState, useCallback } from 'react';
import type { UseFormReturn } from '../types';

export function useSettingsForm<T extends Record<string, unknown>>(
  initialValues: T
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isValid = Object.keys(errors).length === 0;

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when value changes
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest as Partial<Record<keyof T, string>>;
    });
  }, []);

  const setValuesAll = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest as Partial<Record<keyof T, string>>;
    });
  }, []);

  const setTouched = useCallback((field: keyof T) => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void>) => {
      return async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsSubmitting(true);

        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values]
  );

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouchedState({});
    },
    [initialValues]
  );

  const resetField = useCallback(
    (field: keyof T) => {
      setValues((prev) => ({ ...prev, [field]: initialValues[field] }));
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest as Partial<Record<keyof T, string>>;
      });
      setTouchedState((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest as Partial<Record<keyof T, boolean>>;
      });
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    setValue,
    setValues: setValuesAll,
    setError,
    clearError,
    setTouched,
    handleSubmit,
    reset,
    resetField,
  };
}
