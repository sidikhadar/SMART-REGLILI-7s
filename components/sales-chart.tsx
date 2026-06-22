'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DAILY_SALES, REGISTERS } from '@/lib/mock-data'
import { formatMRU } from '@/lib/format'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'

type PeriodKey = '7d' | '15d' | '1m' | '3m' | '6m' | '1y'
type PickMode = 'period' | 'week' | 'month'

const PERIODS: { key: PeriodKey; days: number }[] = [
  { key: '7d', days: 7 },
  { key: '15d', days: 15 },
  { key: '1m', days: 30 },
  { key: '3m', days: 90 },
  { key: '6m', days: 180 },
  { key: '1y', days: 365 },
]

export function SalesChart({ showProfit = true }: { showProfit?: boolean }) {
  const { t, lang } = useApp()
  const [period, setPeriod] = useState<PeriodKey>('7d')
  const [mode, setMode] = useState<PickMode>('period')
  const [week, setWeek] = useState('') // input type=week -> "2026-W12"
  const [month, setMonth] = useState('') // input type=month -> "2026-03"
  const [register, setRegister] = useState<'all' | string>('all')

  const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR'

  // Valeur d'une journée selon la caisse sélectionnée
  function dayValue(d: (typeof DAILY_SALES)[number]) {
    if (register === 'all') return d.total
    if (register === 'r1') return d.r1
    if (register === 'r2') return d.r2
    // caisses ajoutées dynamiquement : on répartit la part restante équitablement
    return Math.round(d.total * 0.18)
  }

  // Filtrage selon le mode
  const filtered = useMemo(() => {
    const all = DAILY_SALES

    if (mode === 'month' && month) {
      return all.filter((d) => d.date.startsWith(month))
    }

    if (mode === 'week' && week) {
      const [y, w] = week.split('-W')
      const target = getWeekRange(Number(y), Number(w))
      return all.filter((d) => {
        const dt = new Date(d.date)
        return dt >= target.start && dt <= target.end
      })
    }

    const days = PERIODS.find((p) => p.key === period)?.days ?? 7
    return all.slice(-days)
  }, [mode, month, week, period])

  // Données formatées pour le graphique
  const chartData = useMemo(() => {
    const longRange = filtered.length > 45
    return filtered.map((d) => {
      const dt = new Date(d.date)
      const label = longRange
        ? dt.toLocaleDateString(locale, { day: '2-digit', month: 'short' })
        : dt.toLocaleDateString(locale, { weekday: 'short', day: '2-digit' })
      const v = dayValue(d)
      return {
        label,
        ventes: v,
        benefice: Math.round(v * (d.profit / d.total)),
      }
    })
  }, [filtered, locale, register])

  // Pour les longues périodes on agrège par semaine pour rester lisible
  const displayData = useMemo(() => {
    if (chartData.length <= 60) return chartData
    const out: typeof chartData = []
    for (let i = 0; i < chartData.length; i += 7) {
      const chunk = chartData.slice(i, i + 7)
      out.push({
        label: chunk[0].label,
        ventes: chunk.reduce((s, c) => s + c.ventes, 0),
        benefice: chunk.reduce((s, c) => s + c.benefice, 0),
      })
    }
    return out
  }, [chartData])

  const totalPeriod = chartData.reduce((s, c) => s + c.ventes, 0)
  const dailyAvg = chartData.length ? Math.round(totalPeriod / chartData.length) : 0

  return (
    <div>
      {/* Contrôles */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Boutons de période */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setMode('period')
                setPeriod(p.key)
              }}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                mode === 'period' && period === p.key
                  ? 'bg-brand text-brand-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`period_${p.key}`)}
            </button>
          ))}
        </div>

        {/* Sélecteurs date */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-xs">
            <span className="font-medium text-muted-foreground">{t('pick_week')}</span>
            <input
              type="week"
              value={week}
              onChange={(e) => {
                setWeek(e.target.value)
                setMode('week')
              }}
              className="bg-transparent text-xs text-foreground outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-xs">
            <span className="font-medium text-muted-foreground">{t('pick_month')}</span>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value)
                setMode('month')
              }}
              className="bg-transparent text-xs text-foreground outline-none"
            />
          </label>

          {/* Filtre caisse */}
          <select
            value={register}
            onChange={(e) => setRegister(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground outline-none"
          >
            <option value="all">{t('all_registers')}</option>
            {REGISTERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résumé */}
      <div className="mb-3 flex flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('total_period')}</p>
          <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
            {formatMRU(totalPeriod)}{' '}
            <span className="text-xs font-semibold text-muted-foreground">{t('mru')}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('daily_average')}</p>
          <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
            {formatMRU(dailyAvg)}{' '}
            <span className="text-xs font-semibold text-muted-foreground">{t('mru')}</span>
          </p>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={16}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
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
              formatter={(value: number) => formatMRU(value) + ' ' + t('mru')}
            />
            <Area
              type="monotone"
              dataKey="ventes"
              name={t('ventes')}
              stroke="var(--brand)"
              strokeWidth={2.5}
              fill="url(#grad-ventes)"
            />
            {showProfit && (
              <Area
                type="monotone"
                dataKey="benefice"
                name={t('profit')}
                stroke="var(--navy)"
                strokeWidth={2.5}
                fill="url(#grad-benefice)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Calcule la plage de dates (lundi→dimanche) d'une semaine ISO
function getWeekRange(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const start = new Date(simple)
  if (dow <= 4) start.setDate(simple.getDate() - simple.getDay() + 1)
  else start.setDate(simple.getDate() + 8 - simple.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
