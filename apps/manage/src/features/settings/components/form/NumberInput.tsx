import type { NumberInputProps } from '../../types';

export function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  disabled = false,
  error,
  size = 'md',
  min,
  max,
  step = 1,
  className = '',
}: NumberInputProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full ${sizeClasses[size]} ${prefix ? 'pl-7' : 'pl-3'} ${
          suffix ? 'pr-8' : 'pr-3'
        } bg-white border rounded-md focus:outline-none transition-colors ${
          error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
