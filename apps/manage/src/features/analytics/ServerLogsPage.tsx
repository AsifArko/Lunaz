import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

interface ServerLog {
  id: string;
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  route?: string;
  statusCode: number;
  statusText?: string;
  duration: number;
  request?: {
    headers?: Record<string, string>;
    query?: Record<string, string>;
    body?: unknown;
    contentType?: string;
    contentLength?: number;
  };
  response?: {
    contentType?: string;
    contentLength?: number;
  };
  client?: {
    ip?: string;
    country?: string;
    userAgent?: string;
    device?: string;
    os?: string;
    browser?: string;
  };
  server?: {
    host?: string;
    environment?: string;
    nodeVersion?: string;
    memory?: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
  };
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  level: 'info' | 'warn' | 'error' | 'fatal';
  message?: string;
}

interface LogsResponse {
  data: ServerLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LogStats {
  totalRequests: number;
  errorCount: number;
  warnCount: number;
  avgResponseTime: number;
  statusCodes: Record<string, number>;
  topPaths: Array<{ path: string; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
}

interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Custom Hook: useDebounce                       */
/* -------------------------------------------------------------------------- */

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/* -------------------------------------------------------------------------- */
/*                              Components                                    */
/* -------------------------------------------------------------------------- */

function StatusBadge({ code }: { code: number }) {
  let colorClass = 'bg-emerald-50 text-emerald-700';
  if (code >= 400 && code < 500) {
    colorClass = 'bg-amber-50 text-amber-700';
  } else if (code >= 500) {
    colorClass = 'bg-rose-50 text-rose-700';
  }

  return (
    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${colorClass}`}>
      {code}
    </span>
  );
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    info: 'bg-gray-100 text-gray-600',
    warn: 'bg-amber-50 text-amber-600',
    error: 'bg-rose-50 text-rose-600',
    fatal: 'bg-rose-100 text-rose-700',
  };

  const dots: Record<string, string> = {
    info: 'bg-gray-400',
    warn: 'bg-amber-400',
    error: 'bg-rose-400',
    fatal: 'bg-rose-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded capitalize ${colors[level] || colors.info}`}
    >
      <span className={`w-1 h-1 rounded-full ${dots[level] || dots.info}`} />
      {level}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-600',
    POST: 'bg-emerald-50 text-emerald-600',
    PUT: 'bg-amber-50 text-amber-600',
    PATCH: 'bg-orange-50 text-orange-600',
    DELETE: 'bg-rose-50 text-rose-600',
  };

  return (
    <span
      className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[method] || 'bg-gray-100 text-gray-600'}`}
    >
      {method}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Custom Select Dropdown                         */
/* -------------------------------------------------------------------------- */

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;
  const hasValue = value !== '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white transition-all duration-200 min-w-[140px] ${
          hasValue
            ? 'border-blue-300 bg-blue-50/50 text-blue-700'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
        } ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className={`flex-1 text-left truncate ${!hasValue ? 'text-gray-500' : ''}`}>
          {displayLabel}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {option.color && <span className={`w-2 h-2 rounded-full ${option.color}`} />}
                <span>{option.label}</span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Search Input                                   */
/* -------------------------------------------------------------------------- */

function SearchInput({
  value,
  onChange,
  placeholder,
  isSearching,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isSearching?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
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
        ) : (
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-10 py-2 text-sm border rounded-lg transition-all duration-200 ${
          value
            ? 'border-blue-300 bg-blue-50/30 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        } focus:outline-none`}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Active Filter Chip                             */
/* -------------------------------------------------------------------------- */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function LogDetailModal({ log, onClose }: { log: ServerLog; onClose: () => void }) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Log Details</h2>
              <LevelBadge level={log.level} />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">Request ID: {log.requestId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Close (Esc)"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
              <p className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-sm text-gray-900">{log.duration}ms</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <StatusBadge code={log.statusCode} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Level</p>
              <LevelBadge level={log.level} />
            </div>
          </div>

          {/* Request */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Request</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MethodBadge method={log.method} />
                <code className="text-sm text-gray-700">{log.path}</code>
              </div>
              {log.route && (
                <div>
                  <p className="text-xs text-gray-500">Route Pattern</p>
                  <code className="text-sm text-gray-700">{log.route}</code>
                </div>
              )}
              {log.request?.contentType && (
                <div>
                  <p className="text-xs text-gray-500">Content-Type</p>
                  <p className="text-sm text-gray-700">{log.request.contentType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Response</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm text-gray-700">
                    {log.statusCode} {log.statusText}
                  </p>
                </div>
                {log.response?.contentLength && (
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm text-gray-700">{log.response.contentLength} bytes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client */}
          {log.client && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Client</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                {log.client.ip && (
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="text-sm text-gray-700">{log.client.ip}</p>
                  </div>
                )}
                {log.client.country && (
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm text-gray-700">{log.client.country}</p>
                  </div>
                )}
                {log.client.device && (
                  <div>
                    <p className="text-xs text-gray-500">Device</p>
                    <p className="text-sm text-gray-700 capitalize">{log.client.device}</p>
                  </div>
                )}
                {log.client.browser && (
                  <div>
                    <p className="text-xs text-gray-500">Browser</p>
                    <p className="text-sm text-gray-700">{log.client.browser}</p>
                  </div>
                )}
                {log.client.os && (
                  <div>
                    <p className="text-xs text-gray-500">Operating System</p>
                    <p className="text-sm text-gray-700">{log.client.os}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Server */}
          {log.server && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Server</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                {log.server.host && (
                  <div>
                    <p className="text-xs text-gray-500">Host</p>
                    <p className="text-sm text-gray-700">{log.server.host}</p>
                  </div>
                )}
                {log.server.environment && (
                  <div>
                    <p className="text-xs text-gray-500">Environment</p>
                    <p className="text-sm text-gray-700">{log.server.environment}</p>
                  </div>
                )}
                {log.server.nodeVersion && (
                  <div>
                    <p className="text-xs text-gray-500">Node Version</p>
                    <p className="text-sm text-gray-700">{log.server.nodeVersion}</p>
                  </div>
                )}
                {log.server.memory && (
                  <div>
                    <p className="text-xs text-gray-500">Memory Usage</p>
                    <p className="text-sm text-gray-700">
                      {Math.round(log.server.memory.heapUsed / 1024 / 1024)}MB /
                      {Math.round(log.server.memory.heapTotal / 1024 / 1024)}MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {log.error && (
            <div>
              <h3 className="text-sm font-medium text-rose-600 mb-3">Error</h3>
              <div className="bg-rose-50 rounded-lg p-4 space-y-3">
                {log.error.name && (
                  <div>
                    <p className="text-xs text-rose-500">Error Type</p>
                    <p className="text-sm text-rose-700 font-medium">{log.error.name}</p>
                  </div>
                )}
                {log.error.message && (
                  <div>
                    <p className="text-xs text-rose-500">Message</p>
                    <p className="text-sm text-rose-700">{log.error.message}</p>
                  </div>
                )}
                {log.error.stack && (
                  <div>
                    <p className="text-xs text-rose-500">Stack Trace</p>
                    <pre className="text-xs text-rose-700 overflow-x-auto whitespace-pre-wrap bg-rose-100/50 rounded p-2 mt-1">
                      {log.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function ServerLogsPage() {
  const { token } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedLog, setSelectedLog] = useState<ServerLog | null>(null);
  const hasLoadedRef = useRef(false);

  // Filters
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    method: '',
    search: '',
    timeRange: '30m',
  });

  // Debounce search to avoid excessive API calls
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [isSearching, setIsSearching] = useState(false);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setIsSearching(false);
    }
  }, [debouncedSearch, filters.search]);

  // Track when user is typing
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (value !== searchInput) {
      setIsSearching(true);
    }
  };

  // Filter options with colors
  const timeRangeOptions: SelectOption[] = [
    { value: '30m', label: 'Last 30 minutes' },
    { value: '1h', label: 'Last hour' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
  ];

  const levelOptions: SelectOption[] = [
    { value: '', label: 'All Levels' },
    { value: 'info', label: 'Info', color: 'bg-gray-400' },
    { value: 'warn', label: 'Warning', color: 'bg-amber-400' },
    { value: 'error', label: 'Error', color: 'bg-rose-400' },
    { value: 'fatal', label: 'Fatal', color: 'bg-rose-600' },
  ];

  const statusOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: '2xx', label: '2xx Success', color: 'bg-emerald-400' },
    { value: '3xx', label: '3xx Redirect', color: 'bg-blue-400' },
    { value: '4xx', label: '4xx Client Error', color: 'bg-amber-400' },
    { value: '5xx', label: '5xx Server Error', color: 'bg-rose-400' },
  ];

  const methodOptions: SelectOption[] = [
    { value: '', label: 'All Methods' },
    { value: 'GET', label: 'GET', color: 'bg-blue-400' },
    { value: 'POST', label: 'POST', color: 'bg-emerald-400' },
    { value: 'PUT', label: 'PUT', color: 'bg-amber-400' },
    { value: 'PATCH', label: 'PATCH', color: 'bg-orange-400' },
    { value: 'DELETE', label: 'DELETE', color: 'bg-rose-400' },
  ];

  const timeRanges = [
    { label: 'Last 30 minutes', value: '30m', minutes: 30 },
    { label: 'Last hour', value: '1h', minutes: 60 },
    { label: 'Last 6 hours', value: '6h', minutes: 360 },
    { label: 'Last 24 hours', value: '24h', minutes: 1440 },
    { label: 'Last 7 days', value: '7d', minutes: 10080 },
  ];

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.level) count++;
    if (filters.status) count++;
    if (filters.method) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // Get active filter labels for chips
  const getActiveFilters = useMemo(() => {
    const active: Array<{ key: string; label: string }> = [];
    if (filters.level) {
      const opt = levelOptions.find((o) => o.value === filters.level);
      active.push({ key: 'level', label: `Level: ${opt?.label}` });
    }
    if (filters.status) {
      const opt = statusOptions.find((o) => o.value === filters.status);
      active.push({ key: 'status', label: `Status: ${opt?.label}` });
    }
    if (filters.method) {
      active.push({ key: 'method', label: `Method: ${filters.method}` });
    }
    if (filters.search) {
      active.push({ key: 'search', label: `Search: "${filters.search}"` });
    }
    return active;
  }, [filters]);

  const clearAllFilters = () => {
    hasLoadedRef.current = false;
    setSearchInput('');
    setFilters({
      level: '',
      status: '',
      method: '',
      search: '',
      timeRange: filters.timeRange, // Keep time range
    });
  };

  const removeFilter = (key: string) => {
    hasLoadedRef.current = false;
    if (key === 'search') {
      setSearchInput('');
    }
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  const fetchLogs = useCallback(
    async (page: number = 1, isBackgroundRefresh: boolean = false) => {
      if (!token) return;

      // Only show loading on initial load or explicit page changes, not background refresh
      if (!isBackgroundRefresh && !hasLoadedRef.current) {
        setIsInitialLoad(true);
      } else if (!isBackgroundRefresh) {
        setIsRefreshing(true);
      }

      const range = timeRanges.find((r) => r.value === filters.timeRange) || timeRanges[0];
      const to = new Date().toISOString();
      const from = new Date(Date.now() - range.minutes * 60 * 1000).toISOString();

      const params = new URLSearchParams({
        from,
        to,
        page: page.toString(),
        limit: '10',
      });

      if (filters.level) params.set('level', filters.level);
      if (filters.status) params.set('status', filters.status);
      if (filters.method) params.set('method', filters.method);
      if (filters.search) params.set('search', filters.search);

      try {
        const [logsRes, statsRes] = await Promise.all([
          api<LogsResponse>(`/analytics/logs?${params}`, { token }),
          api<LogStats>(`/analytics/logs/stats?from=${from}&to=${to}`, { token }),
        ]);

        // Smooth update - batch state changes
        setLogs(logsRes.data);
        setPagination({
          page: logsRes.page,
          totalPages: logsRes.totalPages,
          total: logsRes.total,
        });
        setStats(statsRes);
        hasLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setIsInitialLoad(false);
        setIsRefreshing(false);
      }
    },
    [token, filters]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds - silent background refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (pagination.page === 1) {
        fetchLogs(1, true); // Background refresh - no loading indicator
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLogs, pagination.page]);

  const handleFilterChange = (key: string, value: string) => {
    hasLoadedRef.current = false; // Reset to show loading on filter change
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    fetchLogs(page, false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-gray-900">Server Logs</h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Real-time API request and response logging
            {!isInitialLoad && stats && (
              <span className="ml-2 text-gray-400">
                — {pagination.total.toLocaleString()} total requests in selected time range
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            disabled={isRefreshing || logs.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Export
          </button>
          {/* Refresh Button */}
          <button
            onClick={() => fetchLogs(1, false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Total Requests
            </p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            </div>
          </div>
          {isInitialLoad ? (
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-3" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900 mt-3 transition-all duration-300">
              {stats?.totalRequests.toLocaleString() || 0}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Errors</p>
            <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          {isInitialLoad ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-3" />
          ) : (
            <p
              className={`text-2xl font-semibold mt-3 transition-all duration-300 ${(stats?.errorCount || 0) > 0 ? 'text-rose-600' : 'text-gray-900'}`}
            >
              {stats?.errorCount || 0}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Warnings</p>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          {isInitialLoad ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-3" />
          ) : (
            <p
              className={`text-2xl font-semibold mt-3 transition-all duration-300 ${(stats?.warnCount || 0) > 0 ? 'text-amber-600' : 'text-gray-900'}`}
            >
              {stats?.warnCount || 0}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Avg Response
            </p>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          {isInitialLoad ? (
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse mt-3" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900 mt-3 transition-all duration-300">
              {stats?.avgResponseTime || 0}
              <span className="text-sm font-normal text-gray-500 ml-1">ms</span>
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <CustomSelect
            value={filters.timeRange}
            onChange={(value) => handleFilterChange('timeRange', value)}
            options={timeRangeOptions}
            placeholder="Time Range"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Level Filter */}
          <CustomSelect
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
            options={levelOptions}
            placeholder="All Levels"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18m-9 5h9" />
              </svg>
            }
          />

          {/* Status Filter */}
          <CustomSelect
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
            placeholder="All Status"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          {/* Method Filter */}
          <CustomSelect
            value={filters.method}
            onChange={(value) => handleFilterChange('method', value)}
            options={methodOptions}
            placeholder="All Methods"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            }
          />

          {/* Search Input */}
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by path, IP, request ID..."
            isSearching={isSearching}
          />
        </div>

        {/* Active Filters Row */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            <div className="flex flex-wrap items-center gap-2">
              {getActiveFilters.map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  onRemove={() => removeFilter(filter.key)}
                />
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isInitialLoad ? (
          <div className="p-4 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${
                        log.level === 'error' || log.level === 'fatal' ? 'bg-rose-50/30' : ''
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-normal text-gray-600 bg-gray-100 rounded">
                          <svg
                            className="w-2.5 h-2.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge code={log.statusCode} />
                      </td>
                      <td className="px-3 py-2">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-700 bg-slate-100 rounded truncate max-w-[180px]"
                          title={log.path}
                        >
                          {log.path}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-50 rounded">
                          {log.client?.ip || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            log.duration > 1000
                              ? 'bg-rose-50 text-rose-600'
                              : log.duration > 500
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {log.duration}ms
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <LevelBadge level={log.level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                {logs.length} of {pagination.total.toLocaleString()} logs
              </p>
              <div className="flex items-center gap-0.5">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page <= 1 || isRefreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                {/* Previous */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isRefreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-0.5 mx-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.page;

                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push('...');

                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) pages.push(i);

                      if (currentPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-[10px] text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          disabled={isRefreshing}
                          className={`min-w-[24px] h-6 text-[11px] font-medium rounded transition-colors ${
                            page === currentPage
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-500 hover:bg-gray-100'
                          } disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      )
                    );
                  })()}
                </div>

                {/* Next */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isRefreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page >= pagination.totalPages || isRefreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No logs found</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              {activeFilterCount > 0
                ? 'Try adjusting your filters or expanding the time range to see more results.'
                : 'No server logs have been recorded in the selected time range.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
