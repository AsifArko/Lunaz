import { useState, useEffect, useMemo } from 'react';
import type { Order, PaginatedResponse } from 'types';
import { Price } from '@/ui';
import { adminApi as api } from '@/api/adminClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { useMinimumLoadingTime } from '@/features/manage/hooks/useMinimumLoadingTime';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
  imageUrl?: string;
}

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

// Linear regression for predictions
function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y ?? 0 };

  const sumX = data.reduce((acc, p) => acc + p.x, 0);
  const sumY = data.reduce((acc, p) => acc + p.y, 0);
  const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = data.reduce((acc, p) => acc + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
}

// Calculate moving average
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// Elegant Metric Card
function MetricCard({
  label,
  value,
  subtext,
  trend,
  isLoading,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  trend?: { value: number; label?: string };
  isLoading: boolean;
}) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      {isLoading ? (
        <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
      ) : (
        <>
          <p className="text-3xl font-extralight text-gray-900 tracking-tight">{value}</p>
          <div className="flex items-center gap-3 mt-2">
            {trend && (
              <span
                className={`text-xs font-medium ${isPositive ? 'text-gray-700' : 'text-gray-500'}`}
              >
                {isPositive ? '+' : ''}
                {trend.value.toFixed(1)}%
                {trend.label && <span className="text-gray-400 ml-1">{trend.label}</span>}
              </span>
            )}
            {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
          </div>
        </>
      )}
    </div>
  );
}

// Elegant Area Chart with smooth curves
function AreaChart({
  data,
  predictedData,
  height = 200,
}: {
  data: SalesData[];
  predictedData: SalesData[];
  height?: number;
}) {
  if (data.length === 0) return null;

  const allData = [...data, ...predictedData];
  const values = allData.map((d) => d.revenue);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values.filter((v) => v > 0), 0);
  const range = maxValue - minValue || 1;

  const width = 1000;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) =>
    padding.left + (index / Math.max(allData.length - 1, 1)) * chartWidth;
  const getY = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / range) * chartHeight;

  // Create smooth curve path using cubic bezier
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const actualPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));
  const actualPath = createSmoothPath(actualPoints);

  // Area fill path
  const areaPath =
    actualPath +
    ` L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Prediction points
  const predictionPoints =
    predictedData.length > 0
      ? [
          { x: getX(data.length - 1), y: getY(data[data.length - 1]?.revenue || 0) },
          ...predictedData.map((d, i) => ({
            x: getX(data.length + i),
            y: getY(d.revenue),
          })),
        ]
      : [];
  const predictionPath = createSmoothPath(predictionPoints);

  // Moving average trend line
  const trendValues = movingAverage(
    data.map((d) => d.revenue),
    3
  );
  const trendPoints = data.map((_, i) => ({ x: getX(i), y: getY(trendValues[i]) }));
  const trendPath = createSmoothPath(trendPoints);

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: minValue + range * pct,
    y: getY(minValue + range * pct),
  }));

  // X-axis labels (show every nth label based on data length)
  const xLabelInterval = Math.max(1, Math.floor(allData.length / 6));
  const xLabels = allData.filter((_, i) => i % xLabelInterval === 0 || i === allData.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
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
            ৳{(tick.value / 1000).toFixed(tick.value >= 1000 ? 1 : 0)}
            {tick.value >= 1000 ? 'k' : ''}
          </text>
        </g>
      ))}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#374151" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGradient)" />

      {/* Trend line */}
      <path
        d={trendPath}
        fill="none"
        stroke="#d1d5db"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.8"
      />

      {/* Main line */}
      <path
        d={actualPath}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Prediction line */}
      {predictionPath && (
        <path
          d={predictionPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6,4"
        />
      )}

      {/* Data points */}
      {actualPoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#fff"
          stroke="#374151"
          strokeWidth="1.5"
        />
      ))}

      {/* X-axis labels */}
      {xLabels.map((d, i) => {
        const index = allData.findIndex((ad) => ad.date === d.date);
        return (
          <text
            key={i}
            x={getX(index)}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] fill-gray-400"
          >
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

// Elegant Ring Chart (minimal donut)
function RingChart({ data, total }: { data: { label: string; value: number }[]; total: number }) {
  if (total === 0) return null;

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = circumference * 0.25;

  const segments = data.map((d, i) => {
    const percentage = d.value / total;
    const dashArray = percentage * circumference;
    const segment = {
      ...d,
      percentage,
      dashArray,
      offset: currentOffset,
      color: `rgb(${80 + i * 35}, ${90 + i * 35}, ${100 + i * 35})`,
    };
    currentOffset -= dashArray;
    return segment;
  });

  return (
    <div className="flex items-center gap-8">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashArray} ${circumference}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-700"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-light text-gray-900">{total}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-gray-600 capitalize">{seg.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 tabular-nums">
              {(seg.percentage * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Elegant Vertical Bar Chart
function VerticalBarChart({ data }: { data: HourlyData[] }) {
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);

  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map((d) => {
        const height = (d.orders / maxOrders) * 100;
        const opacity = 0.3 + (d.orders / maxOrders) * 0.7;
        return (
          <div
            key={d.hour}
            className="flex-1 rounded-t transition-all duration-300 hover:opacity-70 cursor-default"
            style={{
              height: `${Math.max(height, 2)}%`,
              backgroundColor: `rgba(55, 65, 81, ${opacity})`,
            }}
            title={`${d.hour.toString().padStart(2, '0')}:00 — ${d.orders} orders`}
          />
        );
      })}
    </div>
  );
}

// Elegant Progress Bar
function ProgressBar({
  label,
  value,
  total,
  showPercentage = true,
}: {
  label: string;
  value: number;
  total: number;
  showPercentage?: boolean;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 capitalize">{label}</span>
        <span className="text-sm text-gray-900 font-medium tabular-nums">
          {value}
          {showPercentage && <span className="text-gray-400 ml-1">({percentage.toFixed(0)}%)</span>}
        </span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-700 rounded-full transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Revenue by Day of Week — same AreaChart style as Revenue Trend
function DayOfWeekAreaChart({
  data,
  height = 200,
}: {
  data: { label: string; current: number }[];
  height?: number;
}) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.current);
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

  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.current) }));
  const linePath = createSmoothPath(points);
  const areaPath =
    linePath +
    ` L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  const trendValues = movingAverage(values, 2);
  const trendPoints = data.map((_, i) => ({ x: getX(i), y: getY(trendValues[i]) }));
  const trendPath = createSmoothPath(trendPoints);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: minValue + range * pct,
    y: getY(minValue + range * pct),
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
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
            ৳{(tick.value / 1000).toFixed(tick.value >= 1000 ? 1 : 0)}
            {tick.value >= 1000 ? 'k' : ''}
          </text>
        </g>
      ))}

      <defs>
        <linearGradient id="dayOfWeekGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#374151" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#dayOfWeekGradient)" />
      <path
        d={trendPath}
        fill="none"
        stroke="#d1d5db"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.8"
      />
      <path
        d={linePath}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#fff"
          stroke="#374151"
          strokeWidth="1.5"
        />
      ))}

      {data.map((d, i) => (
        <text
          key={i}
          x={getX(i)}
          y={height - 8}
          textAnchor="middle"
          className="text-[10px] fill-gray-400"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

export function ReportsPage() {
  const { token } = useAdminAuth();
  const { addToast } = useToast();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Core metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Enhanced metrics
  const [previousPeriodRevenue, setPreviousPeriodRevenue] = useState(0);
  const [previousPeriodOrders, setPreviousPeriodOrders] = useState(0);
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [paymentStatusCounts, setPaymentStatusCounts] = useState<Record<string, number>>({});

  // Prediction data
  const [predictedData, setPredictedData] = useState<SalesData[]>([]);
  const [projectedRevenue, setProjectedRevenue] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setIsLoading(true);

      try {
        const res = await api<PaginatedResponse<Order>>('/orders?limit=1000', { token });
        const orders = res.data;

        const now = new Date();
        let periodStart: Date;
        let previousPeriodStart: Date;
        let previousPeriodEnd: Date;

        switch (period) {
          case 'week':
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousPeriodStart = new Date(periodStart.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousPeriodEnd = periodStart;
            break;
          case 'month':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousPeriodEnd = periodStart;
            break;
          case 'year':
            periodStart = new Date(now.getFullYear(), 0, 1);
            previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
            previousPeriodEnd = periodStart;
            break;
        }

        const periodOrders = orders.filter((o) => new Date(o.createdAt) >= periodStart);
        const previousOrders = orders.filter(
          (o) =>
            new Date(o.createdAt) >= previousPeriodStart &&
            new Date(o.createdAt) < previousPeriodEnd
        );

        const revenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
        setTotalRevenue(revenue);
        setTotalOrders(periodOrders.length);
        setAverageOrderValue(periodOrders.length > 0 ? revenue / periodOrders.length : 0);

        const prevRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
        setPreviousPeriodRevenue(prevRevenue);
        setPreviousPeriodOrders(previousOrders.length);

        const customerIds = new Set(periodOrders.map((o) => o.userId));
        setUniqueCustomers(customerIds.size);

        const itemsSold = periodOrders.reduce(
          (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
          0
        );
        setTotalItemsSold(itemsSold);

        const counts: Record<string, number> = {};
        periodOrders.forEach((o) => {
          counts[o.status] = (counts[o.status] || 0) + 1;
        });
        setStatusCounts(counts);

        const paymentCounts: Record<string, number> = {};
        periodOrders.forEach((o) => {
          paymentCounts[o.paymentStatus] = (paymentCounts[o.paymentStatus] || 0) + 1;
        });
        setPaymentStatusCounts(paymentCounts);

        const productMap = new Map<
          string,
          {
            productId: string;
            productName: string;
            revenue: number;
            quantity: number;
            imageUrl?: string;
          }
        >();
        periodOrders.forEach((o) => {
          o.items.forEach((item) => {
            const existing = productMap.get(item.productId);
            if (existing) {
              existing.revenue += item.total;
              existing.quantity += item.quantity;
            } else {
              productMap.set(item.productId, {
                productId: item.productId,
                productName: item.productName,
                revenue: item.total,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
              });
            }
          });
        });
        const sortedProducts = Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopProducts(sortedProducts);

        const hourlyMap: Record<number, { orders: number; revenue: number }> = {};
        for (let h = 0; h < 24; h++) {
          hourlyMap[h] = { orders: 0, revenue: 0 };
        }
        periodOrders.forEach((o) => {
          const hour = new Date(o.createdAt).getHours();
          hourlyMap[hour].orders += 1;
          hourlyMap[hour].revenue += o.total;
        });
        setHourlyData(
          Object.entries(hourlyMap).map(([hour, data]) => ({
            hour: parseInt(hour),
            ...data,
          }))
        );

        const dataByDate: Record<string, { revenue: number; orders: number }> = {};
        periodOrders.forEach((o) => {
          const date = new Date(o.createdAt).toISOString().split('T')[0];
          if (!dataByDate[date]) {
            dataByDate[date] = { revenue: 0, orders: 0 };
          }
          dataByDate[date].revenue += o.total;
          dataByDate[date].orders += 1;
        });

        const chartData = Object.entries(dataByDate)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setSalesData(chartData);

        if (chartData.length >= 3) {
          const regressionData = chartData.map((d, i) => ({ x: i, y: d.revenue }));
          const { slope, intercept } = linearRegression(regressionData);

          const daysToPredict = period === 'week' ? 3 : period === 'month' ? 7 : 14;
          const predictions: SalesData[] = [];
          const lastDate =
            chartData.length > 0 ? new Date(chartData[chartData.length - 1].date) : now;

          for (let i = 1; i <= daysToPredict; i++) {
            const predDate = new Date(lastDate);
            predDate.setDate(predDate.getDate() + i);
            const predictedRevenue = Math.max(0, intercept + slope * (chartData.length + i - 1));
            predictions.push({
              date: predDate.toISOString().split('T')[0],
              revenue: predictedRevenue,
              orders: Math.max(
                0,
                Math.round(predictedRevenue / (averageOrderValue > 0 ? averageOrderValue : 1))
              ),
            });
          }

          setPredictedData(predictions);

          const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 365;
          const daysElapsed = chartData.length;
          const remainingDays = Math.max(0, daysInPeriod - daysElapsed);
          const avgDailyRevenue = revenue / Math.max(daysElapsed, 1);
          const projected = revenue + avgDailyRevenue * remainingDays;
          setProjectedRevenue(projected);
        } else {
          setPredictedData([]);
          setProjectedRevenue(revenue);
        }
      } catch {
        addToast('Failed to load reports', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    // addToast is stable from context, averageOrderValue is used only for predictions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, period]);

  const growthRate = useMemo(() => {
    if (previousPeriodRevenue === 0) return totalRevenue > 0 ? 100 : 0;
    return ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
  }, [totalRevenue, previousPeriodRevenue]);

  const ordersGrowthRate = useMemo(() => {
    if (previousPeriodOrders === 0) return totalOrders > 0 ? 100 : 0;
    return ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100;
  }, [totalOrders, previousPeriodOrders]);

  const itemsPerOrder = useMemo(() => {
    return totalOrders > 0 ? totalItemsSold / totalOrders : 0;
  }, [totalItemsSold, totalOrders]);

  const peakHour = useMemo(() => {
    if (hourlyData.length === 0) return null;
    return hourlyData.reduce((max, h) => (h.orders > max.orders ? h : max), hourlyData[0]);
  }, [hourlyData]);

  const statusChartData = useMemo(() => {
    return Object.entries(statusCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [statusCounts]);

  const weeklyComparison = useMemo(() => {
    if (salesData.length === 0) return [];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    salesData.forEach((d) => {
      const day = new Date(d.date).getDay();
      dayTotals[day] += d.revenue;
    });

    return days.map((day, i) => ({
      label: day,
      current: dayTotals[i],
      previous: dayTotals[i] * 0.85,
    }));
  }, [salesData]);

  const showLoading = useMinimumLoadingTime(isLoading, 450);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Performance overview and insights</p>
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${
                period === p ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue"
          value={<Price amount={totalRevenue} />}
          trend={{ value: growthRate, label: 'vs prev' }}
          isLoading={showLoading}
        />
        <MetricCard
          label="Orders"
          value={totalOrders.toLocaleString()}
          trend={{ value: ordersGrowthRate, label: 'vs prev' }}
          isLoading={showLoading}
        />
        <MetricCard
          label="Avg. Order Value"
          value={<Price amount={averageOrderValue} />}
          subtext={`${itemsPerOrder.toFixed(1)} items/order`}
          isLoading={showLoading}
        />
        <MetricCard
          label="Customers"
          value={uniqueCustomers.toLocaleString()}
          subtext={`${totalItemsSold.toLocaleString()} items sold`}
          isLoading={showLoading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Revenue Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily revenue with {predictedData.length}-day forecast
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gray-700 rounded" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gray-400 rounded" style={{ strokeDasharray: '4,4' }} />
              <span>Forecast</span>
            </div>
          </div>
        </div>

        {showLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : salesData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-gray-400">
            No data available for this period
          </div>
        ) : (
          <AreaChart data={salesData} predictedData={predictedData} height={220} />
        )}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">
            Projected Revenue
          </p>
          <p className="text-3xl font-extralight text-gray-900">
            {showLoading ? '—' : <Price amount={projectedRevenue} />}
          </p>
          <p className="text-xs text-gray-400 mt-2">End of {period} estimate</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">
            Peak Activity
          </p>
          <p className="text-3xl font-extralight text-gray-900">
            {showLoading || !peakHour ? '—' : `${peakHour.hour.toString().padStart(2, '0')}:00`}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {peakHour ? `${peakHour.orders} orders at peak hour` : 'No data'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">
            Items Sold
          </p>
          <p className="text-3xl font-extralight text-gray-900">
            {showLoading ? '—' : totalItemsSold.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">{itemsPerOrder.toFixed(1)} avg per order</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-6">Order Status Distribution</h2>
          {showLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : statusChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders in this period</p>
          ) : (
            <RingChart data={statusChartData} total={totalOrders} />
          )}
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-6">Hourly Order Distribution</h2>
          {showLoading ? (
            <div className="h-24 bg-gray-50 rounded animate-pulse" />
          ) : (
            <>
              <VerticalBarChart data={hourlyData} />
              <div className="flex justify-between text-[10px] text-gray-400 mt-3">
                <span>12AM</span>
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>11PM</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Products & Payments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Top Products by Revenue</h2>
          </div>
          {showLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No product data</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-8">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-400 tabular-nums">{index + 1}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-700 truncate block max-w-[180px]">
                        {product.productName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs text-gray-600 tabular-nums">{product.quantity}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs font-medium text-gray-900 tabular-nums">
                        <Price amount={product.revenue} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-6">Payment Status</h2>
          {showLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : Object.keys(paymentStatusCounts).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payment data</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(paymentStatusCounts).map(([status, count]) => (
                <ProgressBar key={status} label={status} value={count} total={totalOrders} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Day of Week */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-900">Revenue by Day of Week</h2>
          <p className="text-xs text-gray-400 mt-0.5">Revenue distribution across weekdays</p>
        </div>

        {showLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : weeklyComparison.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-gray-400">
            No data available for this period
          </div>
        ) : (
          <DayOfWeekAreaChart
            data={weeklyComparison.map((d) => ({ label: d.label, current: d.current }))}
            height={220}
          />
        )}
      </div>

      {/* Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-600"
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
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
              <p className="text-xs text-gray-400">Download analytics reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = ['Date', 'Revenue', 'Orders'];
                const rows = salesData.map((d) => [d.date, d.revenue.toFixed(2), d.orders]);
                const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `revenue-${period}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Revenue data exported', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
              Revenue
            </button>
            <button
              onClick={() => {
                const headers = ['Product', 'Revenue', 'Units'];
                const rows = topProducts.map((p) => [
                  p.productName,
                  p.revenue.toFixed(2),
                  p.quantity,
                ]);
                const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `products-${period}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Products data exported', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
              Products
            </button>
            <button
              onClick={() => {
                const data = {
                  period,
                  generated: new Date().toISOString(),
                  metrics: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    avgOrderValue: averageOrderValue,
                    customers: uniqueCustomers,
                    itemsSold: totalItemsSold,
                    growth: growthRate,
                    projected: projectedRevenue,
                  },
                  daily: salesData,
                  products: topProducts,
                  statuses: statusCounts,
                  payments: paymentStatusCounts,
                  forecast: predictedData,
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-${period}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Full report exported', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
              Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
