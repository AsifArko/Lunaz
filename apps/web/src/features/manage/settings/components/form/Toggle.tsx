import type { ToggleProps } from 'manage-settings/types';

export function Toggle({ checked, onChange, disabled = false, size = 'md' }: ToggleProps) {
  const sizeClasses = {
    sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', translate: 'translate-x-3' },
    md: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    lg: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };

  const sizes = sizeClasses[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative ${sizes.track} rounded-full transition-colors ${
        checked ? 'bg-gray-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 ${sizes.thumb} bg-white rounded-full shadow-sm transition-transform ${
          checked ? sizes.translate : 'translate-x-0'
        }`}
      />
    </button>
  );
}
