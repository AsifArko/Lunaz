import type { TextAreaProps } from 'manage-settings/types';

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
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400 text-gray-700 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
            : 'border-gray-200 hover:border-gray-300 focus:border-gray-400'
        } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${
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
