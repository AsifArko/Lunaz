interface SettingsSaveButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function SettingsSaveButton({
  isLoading = false,
  disabled = false,
  label = 'Save changes',
  loadingLabel = 'Saving...',
  onClick,
  type = 'submit',
}: SettingsSaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className="h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {isLoading ? loadingLabel : label}
    </button>
  );
}
