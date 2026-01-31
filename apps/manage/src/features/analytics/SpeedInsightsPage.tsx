import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

interface VitalMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  p75: number;
}

interface SpeedOverview {
  lcp: VitalMetric;
  fid: VitalMetric;
  cls: VitalMetric;
  inp?: VitalMetric;
  ttfb: { value: number; p75: number };
  samples: number;
}

interface PagePerformance {
  path: string;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  samples: number;
}

/* -------------------------------------------------------------------------- */
/*                              Date Range Options                            */
/* -------------------------------------------------------------------------- */

const dateRanges = [
  { label: 'Last 24 hours', value: '1d', days: 1 },
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
];

/* -------------------------------------------------------------------------- */
/*                              Components                                    */
/* -------------------------------------------------------------------------- */

function VitalCard({
  name,
  description,
  value,
  unit,
  rating,
  p75,
  target,
  isLoading,
}: {
  name: string;
  description: string;
  value: number;
  unit: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  p75: number;
  target: string;
  isLoading: boolean;
}) {
  const ratingColors = {
    good: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Good' },
    'needs-improvement': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Needs Improvement' },
    poor: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', label: 'Poor' },
  };

  const colors = ratingColors[rating];

  return (
    <div className={`bg-white rounded-xl border ${colors.border} p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        {!isLoading && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
            {colors.label}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-50 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-1 mb-2">
            <span className={`text-3xl font-light ${colors.text}`}>
              {value.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 mb-1">{unit}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>P75: {p75.toLocaleString()}{unit}</span>
            <span>Target: {target}</span>
          </div>
        </>
      )}
    </div>
  );
}

function MetricBar({
  value,
  max,
  rating,
  label,
  unit = 'ms',
}: {
  value: number;
  max: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  label: string;
  unit?: string;
}) {
  const width = Math.min((value / max) * 100, 100);
  const colors = {
    good: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    'needs-improvement': { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
    poor: { bar: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
  };

  const c = colors[rating];

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-semibold ${c.text}`}>
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <div className={`h-2 ${c.bg} rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-500 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function PagePerformanceCard({
  page,
  maxLcp,
  maxTtfb,
  index,
}: {
  page: PagePerformance;
  maxLcp: number;
  maxTtfb: number;
  index: number;
}) {
  const lcpRating = getLcpRating(page.lcp);
  const fidRating = getFidRating(page.fid);
  const clsRating = getClsRating(page.cls);
  const ttfbRating = getTtfbRating(page.ttfb);

  // Calculate overall score (simplified)
  const getScore = () => {
    const ratings = [lcpRating, fidRating, clsRating, ttfbRating];
    const scores = ratings.map(r => r === 'good' ? 100 : r === 'needs-improvement' ? 60 : 20);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const score = getScore();
  const scoreColor = score >= 80 ? 'text-emerald-600 bg-emerald-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
  const ringColor = score >= 80 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-rose-500';

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate" title={page.path}>
                {page.path}
              </h3>
              <p className="text-xs text-gray-400">{page.samples} sample{page.samples !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              className="stroke-gray-100"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              className={ringColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${score * 0.94} 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${scoreColor.split(' ')[0]}`}>{score}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricBar
          value={page.lcp}
          max={maxLcp}
          rating={lcpRating}
          label="LCP"
        />
        <MetricBar
          value={page.fid}
          max={300}
          rating={fidRating}
          label="FID"
        />
        <MetricBar
          value={page.cls}
          max={0.25}
          rating={clsRating}
          label="CLS"
          unit=""
        />
        <MetricBar
          value={page.ttfb}
          max={maxTtfb}
          rating={ttfbRating}
          label="TTFB"
        />
      </div>
    </div>
  );
}

function getLcpRating(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 2500 ? 'good' : v <= 4000 ? 'needs-improvement' : 'poor';
}

function getFidRating(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 100 ? 'good' : v <= 300 ? 'needs-improvement' : 'poor';
}

function getClsRating(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 0.1 ? 'good' : v <= 0.25 ? 'needs-improvement' : 'poor';
}

function getTtfbRating(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 800 ? 'good' : v <= 1800 ? 'needs-improvement' : 'poor';
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function SpeedInsightsPage() {
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<SpeedOverview | null>(null);
  const [pages, setPages] = useState<PagePerformance[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);

    const range = dateRanges.find((r) => r.value === dateRange) || dateRanges[1];
    const to = new Date().toISOString();
    const from = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const [overviewRes, pagesRes] = await Promise.all([
        api<SpeedOverview>(`/analytics/speed/overview?from=${from}&to=${to}`, { token }),
        api<PagePerformance[]>(`/analytics/speed/pages?from=${from}&to=${to}&limit=10`, { token }),
      ]);

      setOverview(overviewRes);
      setPages(pagesRes);
    } catch (err) {
      console.error('Failed to fetch speed insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Speed Insights</h1>
          <p className="mt-1 text-sm text-gray-500">Core Web Vitals and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {overview?.samples || 0} samples collected
          </span>
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

      {/* Core Web Vitals */}
      <div>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Core Web Vitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VitalCard
            name="LCP"
            description="Largest Contentful Paint"
            value={overview?.lcp.value || 0}
            unit="ms"
            rating={overview?.lcp.rating || 'good'}
            p75={overview?.lcp.p75 || 0}
            target="< 2.5s"
            isLoading={isLoading}
          />
          <VitalCard
            name="FID"
            description="First Input Delay"
            value={overview?.fid.value || 0}
            unit="ms"
            rating={overview?.fid.rating || 'good'}
            p75={overview?.fid.p75 || 0}
            target="< 100ms"
            isLoading={isLoading}
          />
          <VitalCard
            name="CLS"
            description="Cumulative Layout Shift"
            value={overview?.cls.value || 0}
            unit=""
            rating={overview?.cls.rating || 'good'}
            p75={overview?.cls.p75 || 0}
            target="< 0.1"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Additional Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.inp && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">INP</h3>
                  <p className="text-xs text-gray-500">Interaction to Next Paint</p>
                </div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <div className="text-right">
                    <span className="text-2xl font-light text-gray-900">{overview.inp.value}</span>
                    <span className="text-sm text-gray-500 ml-1">ms</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">TTFB</h3>
                <p className="text-xs text-gray-500">Time to First Byte</p>
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-right">
                  <span className="text-2xl font-light text-gray-900">{overview?.ttfb.value || 0}</span>
                  <span className="text-sm text-gray-500 ml-1">ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Page */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Performance by Page</h2>
          {pages.length > 0 && (
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Good</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Needs Work</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Poor</span>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                    <div>
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-50 rounded animate-pulse mt-1" />
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="h-3 w-8 bg-gray-100 rounded animate-pulse mb-2" />
                      <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page, i) => {
              const maxLcp = Math.max(...pages.map(p => p.lcp), 4000);
              const maxTtfb = Math.max(...pages.map(p => p.ttfb), 1800);
              return (
                <PagePerformanceCard
                  key={i}
                  page={page}
                  maxLcp={maxLcp}
                  maxTtfb={maxTtfb}
                  index={i}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No performance data collected yet</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Performance metrics are collected automatically from visitors browsing your site.
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Core Web Vitals</h3>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Core Web Vitals are a set of metrics that measure real-world user experience for loading performance, 
              interactivity, and visual stability. These metrics are collected from actual visitors to your site.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-blue-700">
              <div>
                <span className="font-medium">LCP:</span> Loading performance
              </div>
              <div>
                <span className="font-medium">FID:</span> Interactivity
              </div>
              <div>
                <span className="font-medium">CLS:</span> Visual stability
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
