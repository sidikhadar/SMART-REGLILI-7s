'use client'

import { useMemo, useState } from 'react'
import {
  Sparkles,
  TrendingUp,
  ShoppingBasket,
  Trophy,
  Snowflake,
  CalendarClock,
  Lightbulb,
  Loader2,
  LineChart,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { SalesChart } from '@/components/sales-chart'
import { computeInsights } from '@/lib/reports-utils'
import { formatMRU } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function AiReportsPage() {
  const { t } = useApp()
  const insights = useMemo(() => computeInsights(), [])

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  function handleGenerate() {
    setGenerating(true)
    setGenerated(false)
    // Analyse simulée
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 1600)
  }

  const recommendations = [t('ai_reco_1'), t('ai_reco_2'), t('ai_reco_3')]

  return (
    <AppShell title={t('ai_reports')}>
      {/* En-tête */}
      <div className="mb-4 flex items-center gap-3 rounded-3xl border border-brand/20 bg-brand/5 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-foreground">
            {t('ai_reports')}
          </p>
          <p className="text-sm text-muted-foreground">{t('ai_subtitle')}</p>
        </div>
      </div>

      {/* KPI principaux */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <KpiCard
          icon={<ShoppingBasket className="h-4 w-4" />}
          label={t('ai_avg_basket')}
          value={formatMRU(insights.avgBasket)}
          suffix={t('mru')}
          tone="navy"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label={t('ai_growth')}
          value={`${insights.growthPercent > 0 ? '+' : ''}${insights.growthPercent}%`}
          tone={insights.growthPercent >= 0 ? 'brand' : 'danger'}
        />
      </div>

      {/* Faits marquants */}
      <div className="mb-4 space-y-2.5">
        {insights.bestSeller && (
          <HighlightRow
            icon={<Trophy className="h-4 w-4" />}
            tone="brand"
            label={t('ai_best_seller')}
            title={insights.bestSeller.name}
            detail={`${insights.bestSeller.units} ${t('inv_items').toLowerCase()} · ${formatMRU(
              insights.bestSeller.revenue,
            )} ${t('mru')}`}
          />
        )}
        {insights.slowMover && (
          <HighlightRow
            icon={<Snowflake className="h-4 w-4" />}
            tone="muted"
            label={t('ai_slow_mover')}
            title={insights.slowMover.name}
            detail={`${insights.slowMover.units} ${t('inv_items').toLowerCase()}`}
          />
        )}
        {insights.peakDay && (
          <HighlightRow
            icon={<CalendarClock className="h-4 w-4" />}
            tone="navy"
            label={t('ai_peak_day')}
            title={insights.peakDay.day}
            detail={`${formatMRU(insights.peakDay.amount)} ${t('mru')}`}
          />
        )}
      </div>

      {/* Tendance du CA */}
      <section className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-brand" />
          <h2 className="font-heading text-base font-bold text-foreground">
            {t('ai_revenue_trend')}
          </h2>
        </div>
        <SalesChart showProfit />
      </section>

      {/* Recommandations IA */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h2 className="font-heading text-base font-bold text-foreground">
            {t('ai_insights')}
          </h2>
        </div>

        {generated ? (
          <ul className="space-y-2.5">
            {recommendations.map((reco, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground">{reco}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">{t('ai_subtitle')}</p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold shadow-soft transition-transform active:scale-95 disabled:opacity-80',
            'bg-brand text-brand-foreground',
          )}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('ai_generating')}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t('ai_generate')}
            </>
          )}
        </button>
      </section>
    </AppShell>
  )
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix?: string
  tone: 'navy' | 'brand' | 'danger'
}) {
  const toneClass =
    tone === 'brand'
      ? 'bg-brand/10 text-brand'
      : tone === 'danger'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-navy/10 text-navy'
  const valueClass =
    tone === 'brand'
      ? 'text-brand'
      : tone === 'danger'
        ? 'text-destructive'
        : 'text-foreground'
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div
        className={cn(
          'mb-2 flex h-8 w-8 items-center justify-center rounded-lg',
          toneClass,
        )}
      >
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'font-heading text-2xl font-extrabold tabular-nums',
          valueClass,
        )}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  )
}

function HighlightRow({
  icon,
  label,
  title,
  detail,
  tone,
}: {
  icon: React.ReactNode
  label: string
  title: string
  detail: string
  tone: 'brand' | 'navy' | 'muted'
}) {
  const toneClass =
    tone === 'brand'
      ? 'bg-brand/10 text-brand'
      : tone === 'navy'
        ? 'bg-navy/10 text-navy'
        : 'bg-muted text-muted-foreground'
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          toneClass,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-foreground">{title}</p>
      </div>
      <p className="shrink-0 text-end text-xs font-medium text-muted-foreground">
        {detail}
      </p>
    </div>
  )
}
