import { useRef, useState } from 'react';

interface FileUploadProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  preview?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 2 * 1024 * 1024, // 2MB default
  preview = true,
  disabled = false,
  label = 'Choose file',
  description,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (typeof value === 'string') return value;
    return '';
  });

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      onChange(null);
      setPreviewUrl('');
      return;
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview URL
    if (preview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      {previewUrl && preview ? (
        <div className="flex items-center gap-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
          />
          <div className="flex-1">
            {typeof value === 'object' && value && (
              <p className="text-sm text-gray-900">{value.name}</p>
            )}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors ${
            disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            <p className="text-xs text-gray-400 mt-1">Max size: {formatSize(maxSize)}</p>
          </div>
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
