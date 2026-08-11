'use client'

import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  HandCoins,
  Receipt,
  CalendarX,
  Truck,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import {
  computeFinances,
  availableMonths,
  monthLabel,
  latestMonth,
} from '@/lib/finances-utils'
import { formatMRU } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function FinancesPage() {
  const { t, lang, dir } = useApp()

  // Mois sélectionné (initialisé sur le mois le plus récent)
  const months = useMemo(() => availableMonths(lang), [lang])
  const [month, setMonth] = useState<string>(() => latestMonth())

  const f = useMemo(() => computeFinances(month), [month])
  const positive = f.netProfit >= 0

  // Navigation mois précédent / suivant
  const monthIndex = months.findIndex((m) => m.value === month)
  const hasOlder = monthIndex >= 0 && monthIndex < months.length - 1
  const hasNewer = monthIndex > 0
  function goOlder() {
    if (hasOlder) setMonth(months[monthIndex + 1].value)
  }
  function goNewer() {
    if (hasNewer) setMonth(months[monthIndex - 1].value)
  }

  const income = [
    { key: 'sales_revenue', icon: ShoppingBag, value: f.salesRevenue },
    { key: 'debts_collected', icon: HandCoins, value: f.debtsCollected },
  ]
  const deductions = [
    { key: 'total_expenses', icon: Receipt, value: f.expenses },
    { key: 'expired_losses', icon: CalendarX, value: f.expiredLosses },
    { key: 'supplier_debts_deducted', icon: Truck, value: f.supplierDebts },
  ]

  return (
    <AppShell title={t('finances')}>
      {/* Sélecteur de mois */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={goOlder}
          disabled={!hasOlder}
          aria-label={t('prev_month')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-40"
        >
          {dir === 'rtl' ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label={t('select_month')}
            className="min-w-0 flex-1 truncate rounded-xl border border-border bg-card px-3 py-2.5 text-center font-heading text-base font-bold text-foreground shadow-soft outline-none focus:border-brand"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={goNewer}
          disabled={!hasNewer}
          aria-label={t('next_month')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-40"
        >
          {dir === 'rtl' ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Hero : bénéfice net réel */}
      <div
        className={cn(
          'mb-4 rounded-3xl border p-6 text-center shadow-soft',
          positive
            ? 'border-brand/30 bg-brand/5'
            : 'border-destructive/30 bg-destructive/5',
        )}
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              positive ? 'bg-brand/15 text-brand' : 'bg-destructive/15 text-destructive',
            )}
          >
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t('net_profit_real')}
          </p>
        </div>
        <p
          className={cn(
            'font-heading text-4xl font-extrabold tabular-nums',
            positive ? 'text-brand' : 'text-destructive',
          )}
        >
          {formatMRU(f.netProfit)}{' '}
          <span className="text-lg font-medium text-muted-foreground">{t('mru')}</span>
        </p>
        <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium">
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-brand" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={positive ? 'text-brand' : 'text-destructive'}>
            {positive ? t('profit_positive') : t('profit_negative')}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {monthLabel(month, lang)}
        </p>
      </div>

      {/* Résumé entrées / déductions */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <SummaryCard
          label={t('gross_income')}
          value={f.grossIncome}
          mru={t('mru')}
          tone="up"
        />
        <SummaryCard
          label={t('total_deductions')}
          value={f.totalDeductions}
          mru={t('mru')}
          tone="down"
        />
      </div>

      {/* Détail du calcul */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('breakdown')}</h2>

        <div className="space-y-1.5">
          {income.map((row) => (
            <Row
              key={row.key}
              icon={row.icon}
              label={t(row.key)}
              value={row.value}
              mru={t('mru')}
              sign="+"
            />
          ))}
          {deductions.map((row) => (
            <Row
              key={row.key}
              icon={row.icon}
              label={t(row.key)}
              value={row.value}
              mru={t('mru')}
              sign="-"
            />
          ))}
        </div>

        {/* Total */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-foreground">{t('net_profit_real')}</span>
          <span
            className={cn(
              'font-heading text-lg font-extrabold tabular-nums',
              positive ? 'text-brand' : 'text-destructive',
            )}
          >
            {formatMRU(f.netProfit)} {t('mru')}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t('net_profit_formula')}
      </p>
    </AppShell>
  )
}

function SummaryCard({
  label,
  value,
  mru,
  tone,
}: {
  label: string
  value: number
  mru: string
  tone: 'up' | 'down'
}) {
  const up = tone === 'up'
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-1 flex items-center gap-1.5">
        {up ? (
          <ArrowUpRight className="h-4 w-4 text-brand" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-destructive" />
        )}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          'font-heading text-xl font-extrabold tabular-nums',
          up ? 'text-brand' : 'text-destructive',
        )}
      >
        {formatMRU(value)} <span className="text-xs font-medium text-muted-foreground">{mru}</span>
      </p>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  mru,
  sign,
}: {
  icon: typeof ShoppingBag
  label: string
  value: number
  mru: string
  sign: '+' | '-'
}) {
  const positive = sign === '+'
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            positive ? 'bg-brand/10 text-brand' : 'bg-destructive/10 text-destructive',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="truncate text-sm text-foreground">{label}</span>
      </div>
      <span
        className={cn(
          'shrink-0 font-semibold tabular-nums',
          positive ? 'text-brand' : 'text-destructive',
        )}
      >
        {sign}
        {formatMRU(value)} {mru}
      </span>
    </div>
  )
}
