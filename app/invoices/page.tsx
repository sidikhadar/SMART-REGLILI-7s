'use client'

import { useMemo, useState } from 'react'
import { FileText, Search, ChevronRight, User, Wallet, ReceiptText, CalendarDays } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { StatusBadge } from '@/components/invoices/status-badge'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { buildInvoices, summarize, type InvoiceStatus } from '@/lib/invoice-utils'
import { formatMRU, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const SHOP_NAME = 'SMART REGLILI'
type Filter = 'all' | InvoiceStatus

export default function InvoicesPage() {
  const { t, lang, role, userName } = useApp()
  const allInvoices = useMemo(() => buildInvoices(), [])

  // Le caissier ne voit que ses propres ventes (factures dont le caissier
  // correspond à l'utilisateur connecté). Le patron/owner voit tout.
  const invoices = useMemo(
    () =>
      role === 'caissier'
        ? allInvoices.filter((inv) => inv.cashier === userName)
        : allInvoices,
    [allInvoices, role, userName],
  )
  const summary = useMemo(() => summarize(invoices), [invoices])

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Filtre par date optionnel et flexible : Année + Mois + Jour (optionnels)
  const [year, setYear] = useState<string>('all')
  const [month, setMonth] = useState<string>('all')
  const [day, setDay] = useState<string>('all')

  // Années présentes dans les factures visibles (récentes d'abord)
  const years = useMemo(() => {
    const set = new Set(invoices.map((inv) => new Date(inv.date).getFullYear()))
    return [...set].sort((a, b) => b - a)
  }, [invoices])

  const monthNames = useMemo(() => {
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR'
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }),
    )
  }, [lang])

  const daysInMonth = useMemo(() => {
    if (year === 'all' || month === 'all') return 31
    return new Date(Number(year), Number(month) + 1, 0).getDate()
  }, [year, month])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invoices.filter((inv) => {
      if (filter !== 'all' && inv.status !== filter) return false
      const d = new Date(inv.date)
      if (year !== 'all' && d.getFullYear() !== Number(year)) return false
      if (month !== 'all' && d.getMonth() !== Number(month)) return false
      if (day !== 'all' && d.getDate() !== Number(day)) return false
      if (!q) return true
      return (
        inv.number.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q)
      )
    })
  }, [invoices, filter, query, year, month, day])

  const hasDateFilter = year !== 'all'

  function resetDateFilter() {
    setYear('all')
    setMonth('all')
    setDay('all')
  }

  const selected = invoices.find((i) => i.id === selectedId) ?? null

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('inv_all') },
    { key: 'paid', label: t('inv_status_paid') },
    { key: 'partial', label: t('inv_status_partial') },
    { key: 'unpaid', label: t('inv_status_unpaid') },
  ]

  return (
    <AppShell title={t('invoices')}>
      <p className="mb-4 text-sm text-muted-foreground">{t('inv_subtitle')}</p>

      {/* Résumé */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={ReceiptText}
          label={t('inv_total')}
          value={summary.billed}
          mru={t('mru')}
          hint={`${summary.count} ${t('inv_count')}`}
        />
        <SummaryCard
          icon={Wallet}
          label={t('inv_paid')}
          value={summary.collected}
          mru={t('mru')}
          tone="brand"
        />
        <SummaryCard
          icon={FileText}
          label={t('remaining')}
          value={summary.outstanding}
          mru={t('mru')}
          tone="danger"
        />
        <SummaryCard
          icon={ReceiptText}
          label={t('inv_count')}
          value={summary.count}
          plain
        />
      </div>

      {/* Recherche */}
      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('inv_search')}
          className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === f.key
                ? 'bg-navy text-navy-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtre par date optionnel et flexible : Année + Mois + Jour */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> {t('sales_filter_period')}
          </span>
          {hasDateFilter && (
            <button
              type="button"
              onClick={resetDateFilter}
              className="shrink-0 text-xs font-semibold text-brand hover:underline"
            >
              {t('sales_clear')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value)
              if (e.target.value === 'all') {
                setMonth('all')
                setDay('all')
              }
            }}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground outline-none transition-colors focus:border-brand"
            aria-label={t('sales_year')}
          >
            <option value="all">{t('sales_all_periods')}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value)
              setDay('all')
            }}
            disabled={year === 'all'}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground outline-none transition-colors focus:border-brand disabled:opacity-50"
            aria-label={t('sales_month')}
          >
            <option value="all">{t('sales_month')}</option>
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            disabled={month === 'all'}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground outline-none transition-colors focus:border-brand disabled:opacity-50"
            aria-label={t('sales_day_optional')}
          >
            <option value="all">{t('sales_day_all')}</option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dNum) => (
              <option key={dNum} value={dNum}>
                {dNum}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('inv_empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => setSelectedId(inv.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start shadow-soft transition-transform active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{inv.number}</span>
                  <StatusBadge status={inv.status} t={t} />
                </div>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {inv.clientName || t('inv_walkin')} · {formatDate(inv.date, lang)}
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="font-heading font-bold tabular-nums text-foreground">
                  {formatMRU(inv.total)}
                </p>
                <p className="text-[11px] text-muted-foreground">{t('mru')}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <InvoiceDetail
          invoice={selected}
          shopName={SHOP_NAME}
          t={t}
          lang={lang}
          onClose={() => setSelectedId(null)}
        />
      )}
    </AppShell>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  mru,
  hint,
  tone,
  plain,
}: {
  icon: typeof FileText
  label: string
  value: number
  mru?: string
  hint?: string
  tone?: 'brand' | 'danger'
  plain?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'brand' && 'text-brand',
            tone === 'danger' && 'text-destructive',
            !tone && 'text-muted-foreground',
          )}
        />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          'font-heading text-xl font-extrabold tabular-nums',
          tone === 'brand' && 'text-brand',
          tone === 'danger' && 'text-destructive',
          !tone && 'text-foreground',
        )}
      >
        {formatMRU(value)}
        {mru && <span className="text-xs font-medium text-muted-foreground"> {mru}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      {plain && !hint && <p className="mt-0.5 text-[11px] text-muted-foreground">&nbsp;</p>}
    </div>
  )
}
