import type { TextAreaProps } from '../../types';

export function TextArea({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  rows = 3,
  maxLength,
  resize = false,
  className = '',
}: TextAreaProps) {
  return (
    <div className={className}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none transition-colors ${
          error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${
          resize ? 'resize-y' : 'resize-none'
        }`}
      />
      {maxLength && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
