'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatTime } from '@/lib/format'
import { ALERTS, PRODUCTS, SUPPLIERS } from '@/lib/mock-data'
import type { Alert, Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PurchaseOrderSheet } from '@/components/stock/purchase-order-sheet'
import {
  Bell,
  BellOff,
  Package,
  CalendarClock,
  HandCoins,
  RotateCcw,
  CheckCheck,
  ClipboardList,
} from 'lucide-react'

const SHOP_NAME = 'SMART REGLILI'

type FilterKey = 'all' | 'stock' | 'expiry' | 'debt' | 'return'

const TYPE_ICON: Record<Alert['type'], typeof Package> = {
  stock: Package,
  expiry: CalendarClock,
  debt: HandCoins,
  return: RotateCcw,
}

export default function AlertsPage() {
  const { t, lang, dir } = useApp()
  const [items, setItems] = useState<Alert[]>(ALERTS)
  const [filter, setFilter] = useState<FilterKey>('all')
  // Produit pour lequel on rédige un bon de commande (null = feuille fermée).
  const [orderProduct, setOrderProduct] = useState<Product | null>(null)

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t('al_all') },
    { key: 'stock', label: t('al_stock') },
    { key: 'expiry', label: t('al_expiry') },
    { key: 'debt', label: t('al_debt') },
    { key: 'return', label: t('al_return') },
  ]

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((a) => a.type === filter)),
    [items, filter],
  )

  function levelClasses(level: Alert['level']) {
    if (level === 'danger')
      return {
        ring: 'border-destructive/25',
        icon: 'bg-destructive/15 text-destructive',
        dot: 'bg-destructive',
      }
    if (level === 'warning')
      return {
        ring: 'border-warning/30',
        icon: 'bg-warning/15 text-warning',
        dot: 'bg-warning',
      }
    return {
      ring: 'border-border',
      icon: 'bg-navy/10 text-navy',
      dot: 'bg-navy',
    }
  }

  return (
    <AppShell title={t('alerts')}>
      {/* En-tête / résumé */}
      <div className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Bell className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {t('alerts')}
              </p>
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-foreground">
              {items.length}{' '}
              <span className="text-base font-medium text-muted-foreground">
                {t('al_count')}
              </span>
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-4 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <CheckCheck className="h-5 w-5" />
              <span className="hidden sm:inline">{t('al_mark_read')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" dir={dir}>
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              filter === f.key
                ? 'bg-brand text-brand-foreground shadow-soft'
                : 'border border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOff className="h-7 w-7" />
          </span>
          <p className="mt-3 font-medium text-muted-foreground">
            {t('al_empty')}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((a) => {
            const Icon = TYPE_ICON[a.type]
            const c = levelClasses(a.level)
            // Bouton "bon de commande" uniquement pour une alerte de stock
            // rattachée à un produit connu.
            const orderable =
              a.type === 'stock' && a.productId
                ? PRODUCTS.find((p) => p.id === a.productId) ?? null
                : null
            return (
              <li
                key={a.id}
                className={cn(
                  'rounded-2xl border bg-card p-4 shadow-soft',
                  c.ring,
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      c.icon,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground text-pretty">
                      {a.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTime(a.date, lang)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== a.id))}
                    aria-label={t('al_mark_read')}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                </div>

                {orderable && (
                  <button
                    type="button"
                    onClick={() => setOrderProduct(orderable)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
                  >
                    <ClipboardList className="h-4 w-4" />
                    {t('po_create')}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {orderProduct && (
        <PurchaseOrderSheet
          product={orderProduct}
          suppliers={SUPPLIERS}
          shopName={SHOP_NAME}
          t={t}
          onClose={() => setOrderProduct(null)}
          onSent={() => setOrderProduct(null)}
        />
      )}
    </AppShell>
  )
}
