import { useRef } from 'react';

interface DocumentUploadZoneProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  error?: string | null;
  label?: string;
  accept?: string;
  multiple?: boolean;
}

const DEFAULT_ACCEPT =
  'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif';

export function DocumentUploadZone({
  onFileSelect,
  uploading = false,
  error = null,
  label = 'Upload document',
  accept = DEFAULT_ACCEPT,
  multiple = false,
}: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-1">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          uploading
            ? 'cursor-not-allowed border-slate-200 bg-slate-50'
            : 'cursor-pointer border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Uploading...
          </div>
        ) : (
          <>
            <svg
              className="w-10 h-10 text-slate-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">PDF, Word, or images up to 25MB</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
