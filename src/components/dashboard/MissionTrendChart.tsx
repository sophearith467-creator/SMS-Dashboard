import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { TrendingUpIcon } from 'lucide-react';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from 'date-fns';
import { useChartColors } from '../../hooks/useChartColors';
import type { Mission } from '../../types/mission';

export type TrendPeriod = 'day' | 'week' | 'month' | 'year';

const PERIOD_HINT: Record<TrendPeriod, string> = {
  day: 'Daily submitted vs completed will appear here once activity is recorded.',
  week: 'Weekly submitted vs completed will appear here once missions start flowing.',
  month: 'Monthly submitted vs completed will appear here once missions start flowing through the pipeline.',
  year: 'Yearly submitted vs completed will appear here once you have multi-year history.'
};

type TrendPoint = { label: string; submitted: number; completed: number };

function buildTrend(missions: Mission[], period: TrendPeriod): TrendPoint[] {
  const today = startOfDay(new Date());
  let firstBucket: Date;
  let currentBucket: Date;
  let bucketCount: number;
  let nextBucket: (date: Date) => Date;
  let labelFormat: string;

  switch (period) {
    case 'day':
      currentBucket = today;
      firstBucket = subDays(today, 13);
      bucketCount = 14;
      nextBucket = (date) => addDays(date, 1);
      labelFormat = 'MMM d';
      break;
    case 'week':
      currentBucket = startOfWeek(today, { weekStartsOn: 1 });
      firstBucket = subWeeks(currentBucket, 11);
      bucketCount = 12;
      nextBucket = (date) => addWeeks(date, 1);
      labelFormat = 'MMM d';
      break;
    case 'month':
      currentBucket = startOfMonth(today);
      firstBucket = subMonths(currentBucket, 5);
      bucketCount = 6;
      nextBucket = (date) => addMonths(date, 1);
      labelFormat = 'MMM';
      break;
    case 'year':
      currentBucket = startOfYear(today);
      firstBucket = subYears(currentBucket, 4);
      bucketCount = 5;
      nextBucket = (date) => addYears(date, 1);
      labelFormat = 'yyyy';
      break;
  }

  let bucketStart = firstBucket;
  const buckets = Array.from({ length: bucketCount }, () => {
    const bucket = { start: bucketStart, label: format(bucketStart, labelFormat), submitted: 0, completed: 0 };
    bucketStart = nextBucket(bucketStart);
    return bucket;
  });
  const bucketEnd = nextBucket(currentBucket);
  const completedStatuses = new Set(['COMPLETED', 'REPORT_SUBMITTED', 'SETTLED']);

  for (const mission of missions) {
    const createdAt = new Date(mission.createdAt);
    const submittedIndex = buckets.findIndex((bucket, index) =>
      createdAt >= bucket.start && createdAt < (buckets[index + 1]?.start ?? bucketEnd)
    );
    if (submittedIndex >= 0) buckets[submittedIndex].submitted += 1;

    if (completedStatuses.has(mission.status)) {
      const updatedAt = new Date(mission.updatedAt || mission.createdAt);
      const completedIndex = buckets.findIndex((bucket, index) =>
        updatedAt >= bucket.start && updatedAt < (buckets[index + 1]?.start ?? bucketEnd)
      );
      if (completedIndex >= 0) buckets[completedIndex].completed += 1;
    }
  }

  return buckets;
}

export function MissionTrendChart({
  missions,
  period = 'month'
}: {
  missions: Mission[];
  period?: TrendPeriod;
}) {
  const colors = useChartColors();
  const data = buildTrend(missions, period);
  const hasData =
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((point) => point.submitted > 0 || point.completed > 0);

  if (!hasData) {
    return (
      <div className="flex h-[268px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-muted/40 px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface shadow-soft">
          <TrendingUpIcon size={18} className="text-fg-subtle" aria-hidden />
        </div>
        <p className="mt-3 text-[14px] font-medium text-fg">No throughput yet</p>
        <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-fg-subtle">
          {PERIOD_HINT[period]}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="trendSubmitted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.brand} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.brand} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="trendCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.success} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colors.success} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: colors.grid, strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              boxShadow: '0 12px 40px -12px rgb(15 23 42 / 0.22)',
              fontSize: 12,
              color: colors.tooltipText
            }}
            labelStyle={{ color: colors.tooltipText, fontWeight: 600, marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="submitted"
            name="Submitted"
            stroke={colors.brand}
            strokeWidth={2}
            fill="url(#trendSubmitted)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={colors.success}
            strokeWidth={2}
            fill="url(#trendCompleted)"
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
