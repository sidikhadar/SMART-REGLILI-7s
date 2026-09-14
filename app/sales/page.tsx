'use client'

import { useMemo, useState } from 'react'
import { ShoppingCart, Clock, ArrowRight, Store, CalendarDays } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { buildInvoices } from '@/lib/invoice-utils'
import { SALES, REGISTERS } from '@/lib/mock-data'
import { formatMRU, formatTime, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const SHOP_NAME = 'SMART REGLILI'

export default function SalesPage() {
  const { t, lang } = useApp()

  // Toutes les ventes, de la plus récente à la plus ancienne
  const allSales = useMemo(
    () => [...SALES].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [],
  )
  const invoices = useMemo(() => buildInvoices(), [])

  // Années présentes dans les données (récentes d'abord)
  const years = useMemo(() => {
    const set = new Set(allSales.map((s) => new Date(s.date).getFullYear()))
    return [...set].sort((a, b) => b - a)
  }, [allSales])

  // --- Filtres ---
  const [register, setRegister] = useState<string>('all')
  const [year, setYear] = useState<string>('all') // 'all' ou une année
  const [month, setMonth] = useState<string>('all') // 'all' ou 0-11
  const [day, setDay] = useState<string>('all') // 'all' ou 1-31
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)

  const monthNames = useMemo(() => {
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR'
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }),
    )
  }, [lang])

  // Nombre de jours du mois sélectionné (pour la liste des jours)
  const daysInMonth = useMemo(() => {
    if (year === 'all' || month === 'all') return 31
    return new Date(Number(year), Number(month) + 1, 0).getDate()
  }, [year, month])

  const filtered = useMemo(() => {
    return allSales.filter((s) => {
      if (register !== 'all' && s.register !== register) return false
      const d = new Date(s.date)
      if (year !== 'all' && d.getFullYear() !== Number(year)) return false
      if (month !== 'all' && d.getMonth() !== Number(month)) return false
      if (day !== 'all' && d.getDate() !== Number(day)) return false
      return true
    })
  }, [allSales, register, year, month, day])

  const total = filtered.reduce((sum, s) => sum + s.total, 0)
  const selectedInvoice = invoices.find((i) => i.id === selectedSaleId) ?? null

  const hasFilter = register !== 'all' || year !== 'all'

  function resetFilters() {
    setRegister('all')
    setYear('all')
    setMonth('all')
    setDay('all')
  }

  return (
    <AppShell title={t('sales_all')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {t('sales_count')} · {formatMRU(total)} {t('currency')}
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 text-xs font-semibold text-brand hover:underline"
          >
            {t('sales_clear')}
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        {/* Caisse */}
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Store className="h-3.5 w-3.5" /> {t('sales_filter_register')}
          </span>
          <select
            value={register}
            onChange={(e) => setRegister(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-brand"
          >
            <option value="all">{t('sales_all_registers')}</option>
            {REGISTERS.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        {/* Période : Année + Mois + Jour optionnel */}
        <div>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> {t('sales_filter_period')}
          </span>
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
      </div>

      {/* Liste des ventes */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('sales_empty')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelectedSaleId(s.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-start shadow-soft transition-colors hover:bg-muted active:scale-[0.99]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.items.length} {t('products_count').toLowerCase()} · {s.cashier}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatDate(s.date, lang)} · {formatTime(s.date, lang)} · {s.register}
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                    {formatMRU(s.total)} {t('currency')}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flip-rtl" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Ticket de la vente sélectionnée (lecture seule) */}
      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          shopName={SHOP_NAME}
          t={t}
          lang={lang}
          onClose={() => setSelectedSaleId(null)}
        />
      )}
    </AppShell>
  )
}
