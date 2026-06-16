'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SALES_LAST_7_DAYS } from '@/lib/mock-data'
import { formatMRU } from '@/lib/format'

export function SalesChart({ showProfit = true }: { showProfit?: boolean }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={SALES_LAST_7_DAYS} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-ventes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-benefice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--navy)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--navy)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            cursor={{ stroke: 'var(--brand)', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              fontSize: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => formatMRU(value) + ' MRU'}
          />
          <Area
            type="monotone"
            dataKey="ventes"
            name="Ventes"
            stroke="var(--brand)"
            strokeWidth={2.5}
            fill="url(#grad-ventes)"
          />
          {showProfit && (
            <Area
              type="monotone"
              dataKey="benefice"
              name="Bénéfice"
              stroke="var(--navy)"
              strokeWidth={2.5}
              fill="url(#grad-benefice)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
