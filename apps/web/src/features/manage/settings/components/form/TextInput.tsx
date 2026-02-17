import type { TextInputProps } from '../../types';

export function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  disabled = false,
  error,
  size = 'md',
  maxLength,
  className = '',
}: TextInputProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  const paddingClasses = {
    sm: prefix ? 'pl-6' : 'pl-2.5',
    md: prefix ? 'pl-7' : 'pl-3',
    lg: prefix ? 'pl-8' : 'pl-3.5',
  };

  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full ${sizeClasses[size]} ${paddingClasses[size]} ${
          suffix ? 'pr-8' : 'pr-3'
        } bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400 text-gray-700 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
            : 'border-gray-200 hover:border-gray-300 focus:border-gray-400'
        } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
