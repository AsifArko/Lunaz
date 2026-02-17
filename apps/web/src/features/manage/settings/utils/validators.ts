// Validation utilities for settings

export const validators = {
  required: (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return undefined;
  },

  email: (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email address';
    }
    return undefined;
  },

  url: (value: string): string | undefined => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return 'Invalid URL';
    }
  },

  phone: (value: string): string | undefined => {
    if (!value) return undefined;
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(value)) {
      return 'Invalid phone number';
    }
    return undefined;
  },

  minLength:
    (min: number) =>
    (value: string): string | undefined => {
      if (!value) return undefined;
      if (value.length < min) {
        return `Must be at least ${min} characters`;
      }
      return undefined;
    },

  maxLength:
    (max: number) =>
    (value: string): string | undefined => {
      if (!value) return undefined;
      if (value.length > max) {
        return `Must be at most ${max} characters`;
      }
      return undefined;
    },

  min:
    (minVal: number) =>
    (value: number): string | undefined => {
      if (value === undefined || value === null) return undefined;
      if (value < minVal) {
        return `Must be at least ${minVal}`;
      }
      return undefined;
    },

  max:
    (maxVal: number) =>
    (value: number): string | undefined => {
      if (value === undefined || value === null) return undefined;
      if (value > maxVal) {
        return `Must be at most ${maxVal}`;
      }
      return undefined;
    },

  percentage: (value: number): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (value < 0 || value > 100) {
      return 'Must be between 0 and 100';
    }
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain an uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain a lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain a number';
    }
    return undefined;
  },

  passwordsMatch: (password: string, confirmPassword: string): string | undefined => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  },
};

export type Validator<T> = (value: T) => string | undefined;

export function composeValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
}

// Password strength checker
export interface PasswordStrength {
  score: number; // 0-5
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const labels: PasswordStrength['label'][] = [
    'Very Weak',
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  const colors = [
    'bg-red-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-600',
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    checks,
  };
}
