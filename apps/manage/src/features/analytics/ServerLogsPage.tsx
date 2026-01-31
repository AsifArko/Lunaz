import { useState, useEffect, useCallback, useRef } from 'react';
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
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}>
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

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${colors[level] || colors.info}`}>
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
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[method] || 'bg-gray-100 text-gray-600'}`}>
      {method}
    </span>
  );
}

function LogDetailModal({
  log,
  onClose,
}: {
  log: ServerLog;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Log Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Request ID: {log.requestId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
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
              <p className="text-sm text-gray-900">
                {new Date(log.timestamp).toLocaleString()}
              </p>
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
                  <p className="text-sm text-gray-700">{log.statusCode} {log.statusText}</p>
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

  const timeRanges = [
    { label: 'Last 30 minutes', value: '30m', minutes: 30 },
    { label: 'Last hour', value: '1h', minutes: 60 },
    { label: 'Last 6 hours', value: '6h', minutes: 360 },
    { label: 'Last 24 hours', value: '24h', minutes: 1440 },
    { label: 'Last 7 days', value: '7d', minutes: 10080 },
  ];

  const fetchLogs = useCallback(async (page: number = 1, isBackgroundRefresh: boolean = false) => {
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
  }, [token, filters]);

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
          <h1 className="text-xl font-medium text-gray-900">Server Logs</h1>
          <p className="mt-1 text-sm text-gray-500">API request and response logging</p>
        </div>
        <button
          onClick={() => fetchLogs(1, false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Requests</p>
          {isInitialLoad ? (
            <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-light text-gray-900 mt-1 transition-all duration-300">{stats?.totalRequests.toLocaleString() || 0}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Errors</p>
          {isInitialLoad ? (
            <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-light text-rose-600 mt-1 transition-all duration-300">{stats?.errorCount || 0}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Warnings</p>
          {isInitialLoad ? (
            <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-light text-amber-600 mt-1 transition-all duration-300">{stats?.warnCount || 0}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Response</p>
          {isInitialLoad ? (
            <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-light text-gray-900 mt-1 transition-all duration-300">{stats?.avgResponseTime || 0}ms</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="fatal">Fatal</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="2xx">2xx Success</option>
            <option value="3xx">3xx Redirect</option>
            <option value="4xx">4xx Client Error</option>
            <option value="5xx">5xx Server Error</option>
          </select>

          <select
            value={filters.method}
            onChange={(e) => handleFilterChange('method', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Host</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge code={log.statusCode} />
                      </td>
                      <td className="px-4 py-3">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 truncate block max-w-[200px]" title={log.path}>
                          {log.path}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500 font-mono">
                          {log.client?.ip || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {log.server?.host || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {log.duration}ms
                      </td>
                      <td className="px-4 py-3">
                        <LevelBadge level={log.level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {logs.length} of {pagination.total} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isRefreshing}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isRefreshing}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No logs found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or time range</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
