import type { ReactNode } from 'react';

export interface BaseInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface TextInputProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  prefix?: string;
  suffix?: string;
  maxLength?: number;
}

export interface NumberInputProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export interface MultiSelectProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
}

export interface TextAreaProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  resize?: boolean;
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface FileUploadProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  preview?: boolean;
  disabled?: boolean;
}

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

export interface FormFieldState {
  value: unknown;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface UseFormReturn<T> extends FormState<T> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setTouched: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e?: React.FormEvent) => void;
  reset: (values?: T) => void;
  resetField: (field: keyof T) => void;
}
