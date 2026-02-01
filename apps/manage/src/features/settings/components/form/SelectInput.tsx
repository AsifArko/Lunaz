import type { SelectInputProps } from '../../types';

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  size = 'md',
  className = '',
}: SelectInputProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full ${sizeClasses[size]} px-3 bg-white border rounded-md focus:outline-none transition-colors appearance-none cursor-pointer ${
        error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
      } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 8px center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '16px',
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
