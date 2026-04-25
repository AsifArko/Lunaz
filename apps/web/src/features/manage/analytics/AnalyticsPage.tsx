import { useState, useEffect, useCallback } from 'react';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

interface AnalyticsOverview {
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  visitorsChange?: number;
  pageViewsChange?: number;
  bounceRateChange?: number;
  avgSessionDurationChange?: number;
}

interface TimeSeries {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
}

interface TopPage {
  path: string;
  title?: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage?: number;
}

interface CountryStats {
  country: string;
  countryName: string;
  visitors: number;
  percentage: number;
}

interface DeviceStats {
  type: string;
  count: number;
  percentage: number;
}

interface OSStats {
  os: string;
  count: number;
  percentage: number;
}

interface BrowserStats {
  browser: string;
  count: number;
  percentage: number;
}

interface RealTimeData {
  activeVisitors: number;
  activePages: Array<{ path: string; visitors: number }>;
  recentEvents: Array<{ type: string; timestamp: string; page?: string }>;
}

interface EngagementData {
  avgScrollDepth: number;
  avgTimeOnSite: number;
  avgPagesPerSession: number;
  returningVisitorRate: number;
}

interface ConversionFunnel {
  step: string;
  visitors: number;
  conversionRate: number;
}

interface RecentSession {
  id: string;
  visitorId: string;
  startTime: string;
  duration: number;
  pageViews: number;
  device: string;
  country?: string;
  entryPage: string;
}

/* -------------------------------------------------------------------------- */
/*                              Date Range Options                            */
/* -------------------------------------------------------------------------- */

const dateRanges = [
  { label: 'Last 24 hours', value: '1d', days: 1 },
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
];

/* -------------------------------------------------------------------------- */
/*                              Components                                    */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  change,
  suffix,
  isLoading,
}: {
  label: string;
  value: number | string;
  change?: number;
  suffix?: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="flex items-end gap-2">
          <p className="text-2xl font-light text-gray-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg">{suffix}</span>}
          </p>
          {change !== undefined && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Smooth curve path using cubic bezier (same as Reports page)
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

function VisitorsChart({
  data,
  height = 220,
  showPageViews: _showPageViews = false,
}: {
  data: TimeSeries[];
  height?: number;
  showPageViews?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [metric, setMetric] = useState<'visitors' | 'pageViews' | 'sessions'>('visitors');

  if (!data.length) return null;

  const values = data.map((d) => d[metric]);
  const maxValue = Math.max(...values, 1);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  const width = 1000;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) =>
    padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / range) * chartHeight;

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d[metric]), data: d }));
  const linePath = createSmoothPath(points);
  const areaPath =
    linePath +
    ` L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: minValue + range * pct,
    y: getY(minValue + range * pct),
  }));

  const xLabelInterval = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % xLabelInterval === 0 || i === data.length - 1);

  const colors = {
    visitors: { stroke: '#3b82f6', fill: '#3b82f6', bg: 'bg-blue-500' },
    pageViews: { stroke: '#8b5cf6', fill: '#8b5cf6', bg: 'bg-purple-500' },
    sessions: { stroke: '#10b981', fill: '#10b981', bg: 'bg-emerald-500' },
  };

  const currentColor = colors[metric];

  return (
    <div>
      {/* Metric Toggle */}
      <div className="flex items-center gap-2 mb-4">
        {(['visitors', 'pageViews', 'sessions'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              metric === m
                ? `${colors[m].bg} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m === 'visitors' ? 'Visitors' : m === 'pageViews' ? 'Page Views' : 'Sessions'}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-400"
              >
                {tick.value.toLocaleString()}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id={`chartGradient-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentColor.fill} stopOpacity="0.2" />
              <stop offset="100%" stopColor={currentColor.fill} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill={`url(#chartGradient-${metric})`} />

          {/* Line - smooth curve with visible stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={currentColor.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - visible dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 5 : 3}
                fill="#fff"
                stroke={currentColor.stroke}
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
              <rect
                x={p.x - chartWidth / data.length / 2}
                y={padding.top}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-crosshair"
              />
            </g>
          ))}

          {/* Hover line */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={padding.top}
              x2={points[hoveredIndex].x}
              y2={padding.top + chartHeight}
              stroke={currentColor.stroke}
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
          )}

          {/* X-axis labels */}
          {xLabels.map((d, i) => {
            const index = data.findIndex((ad) => ad.date === d.date);
            return (
              <text
                key={i}
                x={getX(index)}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-gray-400"
              >
                {new Date(d.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg pointer-events-none z-10"
            style={{
              left: `calc(${(points[hoveredIndex].x / width) * 100}%)`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-gray-400 mb-1">
              {new Date(data[hoveredIndex].date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="font-semibold">
              {data[hoveredIndex][metric].toLocaleString()}{' '}
              {metric === 'visitors'
                ? 'Visitors'
                : metric === 'pageViews'
                  ? 'Page Views'
                  : 'Sessions'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EngagementCard({
  icon,
  label,
  value,
  suffix,
  subtext,
  color,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  subtext?: string;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-right">
            <p className="text-xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
            </p>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700 mt-3">{label}</p>
      {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
    </div>
  );
}

function ConversionFunnelChart({
  data,
  isLoading,
}: {
  data: ConversionFunnel[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <div className="py-8 text-center text-sm text-gray-400">No funnel data available</div>;
  }

  const maxVisitors = data[0]?.visitors || 1;

  return (
    <div className="space-y-3">
      {data.map((step, i) => {
        const width = (step.visitors / maxVisitors) * 100;
        const dropOff = i > 0 ? data[i - 1].visitors - step.visitors : 0;

        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">{step.step}</span>
              <div className="flex items-center gap-3">
                {i > 0 && dropOff > 0 && (
                  <span className="text-xs text-rose-500">-{dropOff.toLocaleString()}</span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {step.visitors.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-500"
                style={{ width: `${width}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-end pr-3">
                <span className="text-xs font-medium text-gray-600">{step.conversionRate}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentSessionsTable({
  sessions,
  isLoading,
}: {
  sessions: RecentSession[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sessions.length) {
    return <div className="py-8 text-center text-sm text-gray-400">No recent sessions</div>;
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return 'PC';
      case 'mobile':
        return 'MB';
      case 'tablet':
        return 'TB';
      default:
        return 'PC';
    }
  };

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg">{getDeviceIcon(session.device)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{session.entryPage}</p>
            <p className="text-xs text-gray-500">
              {new Date(session.startTime).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {session.country && ` · ${session.country}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{session.pageViews} pages</p>
            <p className="text-xs text-gray-500">{formatDuration(session.duration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CountryFlag({ code }: { code: string }) {
  // Convert country code to flag emoji
  const flag = code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');
  return <span className="mr-2">{flag}</span>;
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function AnalyticsPage() {
  const { token } = useAdminAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeries[]>([]);
  const [pages, setPages] = useState<TopPage[]>([]);
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [devices, setDevices] = useState<DeviceStats[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStats[]>([]);
  const [osStats, setOsStats] = useState<OSStats[]>([]);
  const [realtime, setRealtime] = useState<RealTimeData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);

    const range = dateRanges.find((r) => r.value === dateRange) || dateRanges[1];
    const to = new Date().toISOString();
    const from = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString();
    const period = range.days <= 1 ? 'hour' : range.days <= 7 ? 'day' : 'day';

    try {
      const [
        overviewRes,
        timeseriesRes,
        pagesRes,
        countriesRes,
        devicesRes,
        browsersRes,
        osRes,
        realtimeRes,
        engagementRes,
        funnelRes,
        sessionsRes,
      ] = await Promise.all([
        api<AnalyticsOverview>(`/analytics/overview?from=${from}&to=${to}`, { token }),
        api<TimeSeries[]>(`/analytics/timeseries?from=${from}&to=${to}&period=${period}`, {
          token,
        }),
        api<TopPage[]>(`/analytics/pages?from=${from}&to=${to}&limit=10`, { token }),
        api<CountryStats[]>(`/analytics/countries?from=${from}&to=${to}&limit=10`, { token }),
        api<DeviceStats[]>(`/analytics/devices?from=${from}&to=${to}`, { token }),
        api<BrowserStats[]>(`/analytics/browsers?from=${from}&to=${to}&limit=5`, { token }),
        api<OSStats[]>(`/analytics/os?from=${from}&to=${to}&limit=5`, { token }),
        api<RealTimeData>('/analytics/realtime', { token }),
        api<EngagementData>(`/analytics/engagement?from=${from}&to=${to}`, { token }).catch(
          () => null
        ),
        api<ConversionFunnel[]>(`/analytics/funnel?from=${from}&to=${to}`, { token }).catch(
          () => []
        ),
        api<RecentSession[]>(`/analytics/sessions/recent?limit=8`, { token }).catch(() => []),
      ]);

      setOverview(overviewRes);
      setTimeseries(timeseriesRes);
      setPages(pagesRes);
      setCountries(countriesRes);
      setDevices(devicesRes);
      setBrowsers(browsersRes);
      setOsStats(osRes);
      setRealtime(realtimeRes);
      setEngagement(engagementRes);
      setFunnel(funnelRes);
      setRecentSessions(sessionsRes);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (token) {
        try {
          const realtimeRes = await api<RealTimeData>('/analytics/realtime', { token });
          setRealtime(realtimeRes);
        } catch {
          // Silently fail
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Website traffic and visitor insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">
              {realtime?.activeVisitors || 0} online now
            </span>
          </div>

          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Visitors"
          value={overview?.visitors || 0}
          change={overview?.visitorsChange}
          isLoading={isLoading}
        />
        <StatCard
          label="Page Views"
          value={overview?.pageViews || 0}
          change={overview?.pageViewsChange}
          isLoading={isLoading}
        />
        <StatCard
          label="Bounce Rate"
          value={`${overview?.bounceRate || 0}`}
          suffix="%"
          change={overview?.bounceRateChange ? -overview.bounceRateChange : undefined}
          isLoading={isLoading}
        />
        <StatCard
          label="Avg. Session"
          value={formatDuration(overview?.avgSessionDuration || 0)}
          change={overview?.avgSessionDurationChange}
          isLoading={isLoading}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-900">Traffic Overview</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Visitors
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Page Views
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sessions
            </span>
          </div>
        </div>
        {isLoading ? (
          <div className="h-[240px] bg-gray-50 rounded animate-pulse" />
        ) : timeseries.length > 0 ? (
          <VisitorsChart data={timeseries} height={220} />
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
            No data available
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Engagement Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EngagementCard
            icon={
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                />
              </svg>
            }
            label="Avg. Scroll Depth"
            value={engagement?.avgScrollDepth || 0}
            suffix="%"
            subtext="How far visitors scroll"
            color="bg-blue-50"
            isLoading={isLoading}
          />
          <EngagementCard
            icon={
              <svg
                className="w-5 h-5 text-purple-600"
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
            label="Avg. Time on Site"
            value={formatDuration(engagement?.avgTimeOnSite || 0)}
            subtext="Per session"
            color="bg-purple-50"
            isLoading={isLoading}
          />
          <EngagementCard
            icon={
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            }
            label="Pages per Session"
            value={engagement?.avgPagesPerSession?.toFixed(1) || '0'}
            subtext="Avg. pages viewed"
            color="bg-emerald-50"
            isLoading={isLoading}
          />
          <EngagementCard
            icon={
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                />
              </svg>
            }
            label="Returning Visitors"
            value={engagement?.returningVisitorRate || 0}
            suffix="%"
            subtext="Come back again"
            color="bg-amber-50"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Two Column Layout - Funnel & Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Conversion Funnel</h2>
              <p className="text-xs text-gray-500 mt-0.5">Visitor journey to purchase</p>
            </div>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75"
                />
              </svg>
            </div>
          </div>
          <ConversionFunnelChart data={funnel} isLoading={isLoading} />
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Recent Sessions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest visitor activity</p>
            </div>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-600"
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
          </div>
          <RecentSessionsTable sessions={recentSessions} isLoading={isLoading} />
        </div>
      </div>

      {/* Two Column Layout - Pages & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Top Pages</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Views</span>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : pages.length > 0 ? (
            <div className="space-y-1">
              {pages.slice(0, 8).map((page, i) => {
                const maxViews = Math.max(...pages.map((p) => p.views));
                const width = (page.views / maxViews) * 100;
                return (
                  <div
                    key={i}
                    className="relative flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 group"
                  >
                    <div
                      className="absolute inset-y-1 left-0 bg-blue-50 rounded-lg transition-all group-hover:bg-blue-100"
                      style={{ width: `${width}%` }}
                    />
                    <span
                      className="relative text-sm text-gray-700 truncate max-w-[70%]"
                      title={page.path}
                    >
                      {page.path}
                    </span>
                    <span className="relative text-sm font-semibold text-gray-900">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">No page data available</div>
          )}
        </div>

        {/* Countries with Visual Bars */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Countries</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Visitors</span>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : countries.length > 0 ? (
            <div className="space-y-1">
              {countries.slice(0, 8).map((country, i) => {
                const maxPercentage = Math.max(...countries.map((c) => c.percentage));
                const width = (country.percentage / maxPercentage) * 100;
                return (
                  <div
                    key={i}
                    className="relative flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 group"
                  >
                    <div
                      className="absolute inset-y-1 left-0 bg-emerald-50 rounded-lg transition-all group-hover:bg-emerald-100"
                      style={{ width: `${width}%` }}
                    />
                    <span className="relative text-sm text-gray-700 flex items-center gap-2">
                      <CountryFlag code={country.country} />
                      {country.countryName}
                    </span>
                    <div className="relative flex items-center gap-2">
                      <span className="text-xs text-gray-500">{country.percentage}%</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {country.visitors.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">No country data available</div>
          )}
        </div>
      </div>

      {/* Tech Stats - Devices, OS, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Devices</h3>
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
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((device, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {device.type === 'desktop' && (
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                    )}
                    {device.type === 'mobile' && (
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                    )}
                    {device.type === 'tablet' && (
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 capitalize">{device.type}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {device.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-500"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">No device data</div>
          )}
        </div>

        {/* Operating Systems */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Operating Systems</h3>
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
                d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : osStats.length > 0 ? (
            <div className="space-y-3">
              {osStats.slice(0, 5).map((os, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{os.os}</span>
                      <span className="text-sm font-medium text-gray-900">{os.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-500"
                        style={{ width: `${os.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">No OS data</div>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Browsers</h3>
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
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : browsers.length > 0 ? (
            <div className="space-y-3">
              {browsers.slice(0, 5).map((browser, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{browser.browser}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {browser.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-500"
                        style={{ width: `${browser.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">No browser data</div>
          )}
        </div>
      </div>
    </div>
  );
}
