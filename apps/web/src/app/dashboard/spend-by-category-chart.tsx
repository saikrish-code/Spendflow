'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SpendByCategoryChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
];

export default function SpendByCategoryChart({ data }: SpendByCategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="65%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
            }}
            formatter={(value: number) => [formatCurrency(value), '']}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 5).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">
              {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
