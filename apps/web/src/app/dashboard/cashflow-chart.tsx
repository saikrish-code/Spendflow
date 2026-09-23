'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CashflowEntry } from '@spendflow/shared/types';
import { formatCurrency } from '@/lib/utils';

interface CashflowChartProps {
  entries: CashflowEntry[];
}

export default function CashflowChart({ entries }: CashflowChartProps) {
  const data = entries.map((e) => ({
    date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
      new Date(e.date)
    ),
    actual: e.actual,
    forecast: e.forecast,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
            }}
            formatter={(value: number) => [formatCurrency(value), '']}
            labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#actualGradient)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="var(--color-chart-2)"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#forecastGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
