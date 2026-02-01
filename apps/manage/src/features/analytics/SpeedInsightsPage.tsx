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
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

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
/*                              Components                                    */
/* -------------------------------------------------------------------------- */

function RatingDot({ rating }: { rating: 'good' | 'needs-improvement' | 'poor' }) {
  const colors = {
    good: 'bg-emerald-500',
    'needs-improvement': 'bg-amber-500',
    poor: 'bg-rose-500',
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[rating]}`} />;
}

function MetricValue({
  value,
  unit,
  rating,
  isLoading,
}: {
  value: number;
  unit: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
  isLoading: boolean;
}) {
  const colors = {
    good: 'text-emerald-600',
    'needs-improvement': 'text-amber-600',
    poor: 'text-rose-600',
  };

  if (isLoading) {
    return <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <span className={`text-sm font-semibold ${rating ? colors[rating] : 'text-gray-900'}`}>
      {value.toLocaleString()}
      {unit && <span className="text-[10px] text-gray-400 ml-0.5">{unit}</span>}
    </span>
  );
}

function CompactMetricBar({
  value,
  max,
  rating,
}: {
  value: number;
  max: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}) {
  const width = Math.min((value / max) * 100, 100);
  const colors = {
    good: 'bg-emerald-500',
    'needs-improvement': 'bg-amber-500',
    poor: 'bg-rose-500',
  };

  return (
    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colors[rating]} transition-all duration-300`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
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

  // Calculate overall health score
  const getOverallScore = () => {
    if (!overview) return 0;
    const ratings = [overview.lcp.rating, overview.fid.rating, overview.cls.rating];
    const scores = ratings.map((r) => (r === 'good' ? 100 : r === 'needs-improvement' ? 60 : 20));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const score = getOverallScore();
  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600';
  const scoreBg = score >= 80 ? 'bg-emerald-50' : score >= 50 ? 'bg-amber-50' : 'bg-rose-50';

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium text-gray-900">Speed Insights</h1>
          <span className="text-[10px] text-gray-400 uppercase">Core Web Vitals</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400">{overview?.samples || 0} samples</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compact Vitals Overview */}
      <div className="bg-white rounded-lg border border-gray-100">
        {/* Score + Vitals Row */}
        <div className="px-4 py-3 flex items-center gap-6 flex-wrap">
          {/* Overall Score */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${scoreBg} rounded-lg flex items-center justify-center`}>
              {isLoading ? (
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Score</span>
              <span className="text-[10px] text-gray-500">
                {score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor'}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100" />

          {/* LCP */}
          <div className="flex items-center gap-2">
            <RatingDot rating={overview?.lcp.rating || 'good'} />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">LCP</span>
              <MetricValue
                value={overview?.lcp.value || 0}
                unit="ms"
                rating={overview?.lcp.rating}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100" />

          {/* FID */}
          <div className="flex items-center gap-2">
            <RatingDot rating={overview?.fid.rating || 'good'} />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">FID</span>
              <MetricValue
                value={overview?.fid.value || 0}
                unit="ms"
                rating={overview?.fid.rating}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100" />

          {/* CLS */}
          <div className="flex items-center gap-2">
            <RatingDot rating={overview?.cls.rating || 'good'} />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">CLS</span>
              <MetricValue
                value={overview?.cls.value || 0}
                unit=""
                rating={overview?.cls.rating}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100" />

          {/* TTFB */}
          <div className="flex items-center gap-2">
            <RatingDot rating={getTtfbRating(overview?.ttfb.value || 0)} />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">TTFB</span>
              <MetricValue
                value={overview?.ttfb.value || 0}
                unit="ms"
                rating={getTtfbRating(overview?.ttfb.value || 0)}
                isLoading={isLoading}
              />
            </div>
          </div>

          {overview?.inp && (
            <>
              <div className="w-px h-8 bg-gray-100" />
              {/* INP */}
              <div className="flex items-center gap-2">
                <RatingDot rating={overview.inp.rating} />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">INP</span>
                  <MetricValue
                    value={overview.inp.value}
                    unit="ms"
                    rating={overview.inp.rating}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Targets Row */}
        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center gap-6 text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Targets:</span>
          <span>LCP &lt; 2.5s</span>
          <span>FID &lt; 100ms</span>
          <span>CLS &lt; 0.1</span>
          <span>TTFB &lt; 800ms</span>
        </div>
      </div>

      {/* Performance by Page - Compact Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Performance by Page</span>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Good</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Needs Work</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Poor</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Loading...
            </div>
          </div>
        ) : pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    LCP
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    FID
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    CLS
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    TTFB
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    Samples
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pages.map((page, i) => {
                  const lcpRating = getLcpRating(page.lcp);
                  const fidRating = getFidRating(page.fid);
                  const clsRating = getClsRating(page.cls);
                  const ttfbRating = getTtfbRating(page.ttfb);
                  const maxLcp = Math.max(...pages.map((p) => p.lcp), 4000);
                  const maxTtfb = Math.max(...pages.map((p) => p.ttfb), 1800);

                  return (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-600 bg-gray-100 rounded truncate max-w-[200px]"
                          title={page.path}
                        >
                          {page.path}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RatingDot rating={lcpRating} />
                          <span className="text-[10px] font-medium text-gray-700">
                            {page.lcp.toLocaleString()}ms
                          </span>
                          <CompactMetricBar value={page.lcp} max={maxLcp} rating={lcpRating} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RatingDot rating={fidRating} />
                          <span className="text-[10px] font-medium text-gray-700">
                            {page.fid.toLocaleString()}ms
                          </span>
                          <CompactMetricBar value={page.fid} max={300} rating={fidRating} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RatingDot rating={clsRating} />
                          <span className="text-[10px] font-medium text-gray-700">
                            {page.cls.toFixed(3)}
                          </span>
                          <CompactMetricBar value={page.cls} max={0.25} rating={clsRating} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RatingDot rating={ttfbRating} />
                          <span className="text-[10px] font-medium text-gray-700">
                            {page.ttfb.toLocaleString()}ms
                          </span>
                          <CompactMetricBar value={page.ttfb} max={maxTtfb} rating={ttfbRating} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-50 rounded">
                          {page.samples}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-0.5">No data yet</p>
            <p className="text-[10px] text-gray-400">Metrics are collected from site visitors</p>
          </div>
        )}
      </div>

      {/* Compact Info */}
      <div className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4 text-[10px] text-gray-500">
        <svg
          className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <span>
          <span className="font-medium text-gray-600">LCP</span> = Loading ·
          <span className="font-medium text-gray-600 ml-1">FID</span> = Interactivity ·
          <span className="font-medium text-gray-600 ml-1">CLS</span> = Visual Stability ·
          <span className="font-medium text-gray-600 ml-1">TTFB</span> = Server Response
        </span>
      </div>
    </div>
  );
}
