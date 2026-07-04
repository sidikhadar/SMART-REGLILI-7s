'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatMRU } from '@/lib/format'
import { WAREHOUSES } from '@/lib/mock-data'
import type { Warehouse } from '@/lib/types'
import { Plus, Warehouse as WarehouseIcon, X, Check, MapPin, Package, Boxes } from 'lucide-react'

export default function WarehousesPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Warehouse[]>(WAREHOUSES)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  const totalValue = useMemo(
    () => items.reduce((sum, w) => sum + w.value, 0),
    [items],
  )

  function addWarehouse() {
    const n = name.trim()
    if (!n) return
    setItems((prev) => [
      ...prev,
      {
        id: `wh-${Date.now()}`,
        name: n,
        location: location.trim() || '—',
        productCount: 0,
        units: 0,
        value: 0,
        fillPercent: 0,
        main: false,
      },
    ])
    setName('')
    setLocation('')
    setOpen(false)
  }

  function fillColor(pct: number) {
    if (pct >= 70) return 'bg-brand'
    if (pct >= 40) return 'bg-warning'
    return 'bg-destructive'
  }

  return (
    <AppShell title={t('warehouses')}>
      {/* Valeur totale */}
      <div className="mb-4 rounded-3xl border border-brand/25 bg-brand/5 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Boxes className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {t('wh_total_value')}
              </p>
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-foreground">
              {formatMRU(totalValue)}{' '}
              <span className="text-base font-medium text-muted-foreground">
                {t('mru')}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('wh_add')}</span>
          </button>
        </div>
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {items.length} {t('wh_count')}
      </p>

      {/* Cartes entrepôts */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((w) => (
          <div
            key={w.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <WarehouseIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{w.name}</p>
                  <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {w.location}
                  </p>
                </div>
              </div>
              {w.main && (
                <span className="shrink-0 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
                  {t('wh_main')}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  {t('wh_products')}
                </p>
                <p className="mt-0.5 font-heading text-lg font-bold tabular-nums text-foreground">
                  {w.productCount}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{t('wh_units')}</p>
                <p className="mt-0.5 font-heading text-lg font-bold tabular-nums text-foreground">
                  {w.units}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('wh_fill')}</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {w.fillPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${fillColor(w.fillPercent)}`}
                  style={{ width: `${w.fillPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">{t('wh_value')}</span>
              <span className="font-heading font-bold tabular-nums text-foreground">
                {formatMRU(w.value)} {t('mru')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal ajout */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            dir={dir}
            className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {t('wh_add')}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('wh_add')}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('wh_location')}
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addWarehouse}
              disabled={!name.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
