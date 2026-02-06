import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                              Custom Dropdown                               */
/* -------------------------------------------------------------------------- */

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg
          transition-all duration-200 min-w-[160px]
          ${
            isOpen
              ? 'border-blue-500 ring-2 ring-blue-100'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="flex-1 text-left text-gray-700 font-medium truncate">
          {selectedOption.label}
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
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="py-1.5 max-h-[280px] overflow-y-auto">
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {label}
              </p>
            </div>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${
                    option.value === value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {option.icon && (
                  <span
                    className={`flex-shrink-0 ${option.value === value ? 'text-blue-500' : 'text-gray-400'}`}
                  >
                    {option.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${option.value === value ? 'text-blue-700' : 'text-gray-900'}`}
                  >
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-gray-500 truncate">{option.description}</p>
                  )}
                </div>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 text-blue-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

interface TrafficLog {
  id: string;
  timestamp: string;
  visitorId: string;
  sessionId: string;
  userId?: string;
  type: string;
  page: {
    url: string;
    path: string;
    hostname: string;
    title?: string;
  };
  referrer?: {
    url?: string;
    domain?: string;
    type?: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  geo?: {
    country?: string;
    countryName?: string;
    city?: string;
  };
  device?: {
    type?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
  };
  event?: {
    name: string;
    properties?: Record<string, unknown>;
  };
  ip?: string;
}

interface TrafficLogsResponse {
  data: TrafficLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* -------------------------------------------------------------------------- */
/*                              Components                                    */
/* -------------------------------------------------------------------------- */

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    pageview: 'bg-blue-50 text-blue-600',
    session_start: 'bg-emerald-50 text-emerald-600',
    session_end: 'bg-gray-100 text-gray-600',
    click: 'bg-purple-50 text-purple-600',
    scroll: 'bg-indigo-50 text-indigo-600',
    product_view: 'bg-amber-50 text-amber-600',
    add_to_cart: 'bg-orange-50 text-orange-600',
    remove_from_cart: 'bg-rose-50 text-rose-600',
    checkout_start: 'bg-cyan-50 text-cyan-600',
    purchase: 'bg-emerald-50 text-emerald-700',
    search: 'bg-violet-50 text-violet-600',
    error: 'bg-rose-50 text-rose-600',
    custom: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[type] || colors.custom}`}
    >
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function DeviceBadge({ type }: { type?: string }) {
  if (!type)
    return (
      <span className="inline-flex px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-50 rounded">
        -
      </span>
    );

  const config: Record<string, { icon: string; bg: string; text: string }> = {
    desktop: { icon: '🖥️', bg: 'bg-blue-50', text: 'text-blue-600' },
    mobile: { icon: '📱', bg: 'bg-purple-50', text: 'text-purple-600' },
    tablet: { icon: '📱', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    bot: { icon: '🤖', bg: 'bg-gray-100', text: 'text-gray-600' },
  };

  const style = config[type] || { icon: '', bg: 'bg-gray-50', text: 'text-gray-600' };

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded capitalize ${style.bg} ${style.text}`}
    >
      <span className="text-[8px]">{style.icon}</span>
      {type}
    </span>
  );
}

function TrafficDetailModal({ log, onClose }: { log: TrafficLog; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Traffic Log Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Visitor: {log.visitorId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
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
              <p className="text-xs text-gray-500 mb-1">Event Type</p>
              <EventTypeBadge type={log.type} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Session ID</p>
              <p className="text-sm text-gray-700 font-mono truncate" title={log.sessionId}>
                {log.sessionId.slice(0, 12)}...
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">IP Address</p>
              <p className="text-sm text-gray-700 font-mono">{log.ip || '-'}</p>
            </div>
          </div>

          {/* Page */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Page</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Path</p>
                <p className="text-sm text-gray-900">{log.page.path}</p>
              </div>
              {log.page.title && (
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm text-gray-700">{log.page.title}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Full URL</p>
                <p className="text-sm text-gray-700 break-all">{log.page.url}</p>
              </div>
            </div>
          </div>

          {/* Referrer */}
          {log.referrer && log.referrer.type !== 'direct' && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Referrer</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                {log.referrer.domain && (
                  <div>
                    <p className="text-xs text-gray-500">Domain</p>
                    <p className="text-sm text-gray-700">{log.referrer.domain}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm text-gray-700 capitalize">{log.referrer.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* UTM Parameters */}
          {log.utm && (log.utm.source || log.utm.medium || log.utm.campaign) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">UTM Parameters</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                {log.utm.source && (
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-sm text-gray-700">{log.utm.source}</p>
                  </div>
                )}
                {log.utm.medium && (
                  <div>
                    <p className="text-xs text-gray-500">Medium</p>
                    <p className="text-sm text-gray-700">{log.utm.medium}</p>
                  </div>
                )}
                {log.utm.campaign && (
                  <div>
                    <p className="text-xs text-gray-500">Campaign</p>
                    <p className="text-sm text-gray-700">{log.utm.campaign}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Device */}
          {log.device && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Device</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {log.device.type && (
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm text-gray-700 capitalize">{log.device.type}</p>
                  </div>
                )}
                {log.device.browser && (
                  <div>
                    <p className="text-xs text-gray-500">Browser</p>
                    <p className="text-sm text-gray-700">
                      {log.device.browser} {log.device.browserVersion}
                    </p>
                  </div>
                )}
                {log.device.os && (
                  <div>
                    <p className="text-xs text-gray-500">OS</p>
                    <p className="text-sm text-gray-700">
                      {log.device.os} {log.device.osVersion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Geo */}
          {log.geo && (log.geo.country || log.geo.city) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                {log.geo.countryName && (
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm text-gray-700">{log.geo.countryName}</p>
                  </div>
                )}
                {log.geo.city && (
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm text-gray-700">{log.geo.city}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Data */}
          {log.event && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Event Data</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Event Name</p>
                  <p className="text-sm text-gray-700">{log.event.name}</p>
                </div>
                {log.event.properties && Object.keys(log.event.properties).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Properties</p>
                    <pre className="text-xs text-gray-700 bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                      {JSON.stringify(log.event.properties, null, 2)}
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

export function TrafficLogsPage() {
  const { token } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);
  const hasLoadedRef = useRef(false);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    device: '',
    search: '',
    timeRange: '24h',
  });

  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const timeRangesData = [
    { label: 'Last hour', value: '1h', minutes: 60 },
    { label: 'Last 6 hours', value: '6h', minutes: 360 },
    { label: 'Last 24 hours', value: '24h', minutes: 1440 },
    { label: 'Last 7 days', value: '7d', minutes: 10080 },
    { label: 'Last 30 days', value: '30d', minutes: 43200 },
  ];

  const timeRangeOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: 'Last hour',
        value: '1h',
        icon: (
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
        ),
        description: '60 minutes',
      },
      {
        label: 'Last 6 hours',
        value: '6h',
        icon: (
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
        ),
        description: '6 hours ago',
      },
      {
        label: 'Last 24 hours',
        value: '24h',
        icon: (
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
        ),
        description: '1 day ago',
      },
      {
        label: 'Last 7 days',
        value: '7d',
        icon: (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        ),
        description: '1 week ago',
      },
      {
        label: 'Last 30 days',
        value: '30d',
        icon: (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        ),
        description: '1 month ago',
      },
    ],
    []
  );

  const eventTypeOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: 'All Events',
        value: '',
        icon: (
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
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        ),
      },
      {
        label: 'Page View',
        value: 'pageview',
        icon: (
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
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Session Start',
        value: 'session_start',
        icon: (
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
              d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
            />
          </svg>
        ),
      },
      {
        label: 'Session End',
        value: 'session_end',
        icon: (
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
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Product View',
        value: 'product_view',
        icon: (
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
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        ),
      },
      {
        label: 'Add to Cart',
        value: 'add_to_cart',
        icon: (
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
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        ),
      },
      {
        label: 'Purchase',
        value: 'purchase',
        icon: (
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
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        ),
      },
      {
        label: 'Search',
        value: 'search',
        icon: (
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
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        ),
      },
      {
        label: 'Click',
        value: 'click',
        icon: (
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
              d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
            />
          </svg>
        ),
      },
      {
        label: 'Error',
        value: 'error',
        icon: (
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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        ),
      },
    ],
    []
  );

  const deviceTypeOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: 'All Devices',
        value: '',
        icon: (
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
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
            />
          </svg>
        ),
      },
      {
        label: 'Desktop',
        value: 'desktop',
        icon: (
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
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
            />
          </svg>
        ),
        description: 'Windows, Mac, Linux',
      },
      {
        label: 'Mobile',
        value: 'mobile',
        icon: (
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
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
            />
          </svg>
        ),
        description: 'iPhone, Android',
      },
      {
        label: 'Tablet',
        value: 'tablet',
        icon: (
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
              d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        ),
        description: 'iPad, Android tablets',
      },
    ],
    []
  );

  const fetchLogs = useCallback(
    async (page: number = 1, isBackgroundRefresh: boolean = false) => {
      if (!token) return;

      if (!isBackgroundRefresh && !hasLoadedRef.current) {
        setIsInitialLoad(true);
      } else if (!isBackgroundRefresh) {
        setIsRefreshing(true);
      }

      const range = timeRangesData.find((r) => r.value === filters.timeRange) || timeRangesData[2];
      const to = new Date().toISOString();
      const from = new Date(Date.now() - range.minutes * 60 * 1000).toISOString();

      const params = new URLSearchParams({
        from,
        to,
        page: page.toString(),
        limit: '10',
      });

      if (filters.type) params.set('type', filters.type);
      if (filters.device) params.set('device', filters.device);
      if (filters.search) params.set('search', filters.search);

      try {
        const res = await api<TrafficLogsResponse>(`/analytics/traffic?${params}`, { token });

        setLogs(res.data);
        setPagination({
          page: res.page,
          totalPages: res.totalPages,
          total: res.total,
        });
        hasLoadedRef.current = true;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch traffic logs:', err);
      } finally {
        setIsInitialLoad(false);
        setIsRefreshing(false);
      }
    },
    // timeRangesData is a stable constant defined outside the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, filters]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (pagination.page === 1) {
        fetchLogs(1, true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLogs, pagination.page]);

  const handleFilterChange = (key: string, value: string) => {
    hasLoadedRef.current = false;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search - wait 400ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      hasLoadedRef.current = false;
      setFilters((prev) => ({ ...prev, search: value }));
    }, 400);
  };

  const clearSearch = () => {
    setSearchInput('');
    hasLoadedRef.current = false;
    setFilters((prev) => ({ ...prev, search: '' }));
  };

  const handlePageChange = (page: number) => {
    fetchLogs(page, false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Traffic Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Visitor activity and event tracking</p>
        </div>
        <button
          onClick={() => fetchLogs(1, false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
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

      {/* Compact Stats Bar */}
      <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Total Events */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              {isInitialLoad ? (
                <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />
              ) : (
                <span className="text-sm font-semibold text-gray-900">
                  {pagination.total.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] text-gray-400 uppercase">events</span>
            </div>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Page Views */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              {isInitialLoad ? (
                <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
              ) : (
                <span className="text-sm font-semibold text-blue-600">
                  {logs.filter((l) => l.type === 'pageview').length}
                </span>
              )}
              <span className="text-[10px] text-gray-400 uppercase">views</span>
            </div>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Unique Visitors */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              {isInitialLoad ? (
                <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
              ) : (
                <span className="text-sm font-semibold text-emerald-600">
                  {new Set(logs.map((l) => l.visitorId)).size}
                </span>
              )}
              <span className="text-[10px] text-gray-400 uppercase">visitors</span>
            </div>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Sessions */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              {isInitialLoad ? (
                <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
              ) : (
                <span className="text-sm font-semibold text-gray-900">
                  {new Set(logs.map((l) => l.sessionId)).size}
                </span>
              )}
              <span className="text-[10px] text-gray-400 uppercase">sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Dropdown */}
          <FilterDropdown
            label="Time Range"
            options={timeRangeOptions}
            value={filters.timeRange}
            onChange={(value) => handleFilterChange('timeRange', value)}
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

          {/* Event Type Dropdown */}
          <FilterDropdown
            label="Event Type"
            options={eventTypeOptions}
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
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
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                />
              </svg>
            }
          />

          {/* Device Type Dropdown */}
          <FilterDropdown
            label="Device Type"
            options={deviceTypeOptions}
            value={filters.device}
            onChange={(value) => handleFilterChange('device', value)}
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
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                />
              </svg>
            }
          />

          {/* Search Input */}
          <div className="flex-1 min-w-[240px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by path, visitor ID, IP address..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
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
        </div>

        {/* Active Filters Display */}
        {(filters.type || filters.device || filters.search) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.type && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {eventTypeOptions.find((e) => e.value === filters.type)?.label}
                <button
                  type="button"
                  onClick={() => handleFilterChange('type', '')}
                  className="hover:text-blue-900 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.device && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                {deviceTypeOptions.find((d) => d.value === filters.device)?.label}
                <button
                  type="button"
                  onClick={() => handleFilterChange('device', '')}
                  className="hover:text-purple-900 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                "{filters.search}"
                <button
                  type="button"
                  onClick={clearSearch}
                  className="hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                hasLoadedRef.current = false;
                setFilters({ type: '', device: '', search: '', timeRange: filters.timeRange });
              }}
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors ml-1"
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
                      Event
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Visitor ID
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      Browser
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      OS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
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
                        <EventTypeBadge type={log.type} />
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-700 bg-slate-100 rounded truncate max-w-[150px]"
                          title={log.page.path}
                        >
                          {log.page.path}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-violet-600 bg-violet-50 rounded truncate max-w-[90px]"
                          title={log.visitorId}
                        >
                          {log.visitorId.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-50 rounded">
                          {log.ip || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <DeviceBadge type={log.device?.type} />
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium text-cyan-600 bg-cyan-50 rounded">
                          {log.device?.browser || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium text-amber-600 bg-amber-50 rounded">
                          {log.device?.os || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                {logs.length} of {pagination.total.toLocaleString()} events
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
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No traffic logs found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or time range</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && <TrafficDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
