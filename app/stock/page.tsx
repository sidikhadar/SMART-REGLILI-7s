'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Clock,
  Pencil,
  Barcode,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PRODUCTS } from '@/lib/mock-data'
import { formatMRU, daysUntil, productStock } from '@/lib/format'
import type { Product, ProductCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'in_stock' | 'low_stock' | 'expiring'

const CATEGORIES: { key: ProductCategory; labelKey: string }[] = [
  { key: 'alimentation', labelKey: 'cat_alimentation' },
  { key: 'cosmetique', labelKey: 'cat_cosmetique' },
  { key: 'sante', labelKey: 'cat_sante' },
  { key: 'autre', labelKey: 'cat_autre' },
]

function nearestExpiry(p: Product): string | undefined {
  const dated = p.lots.filter((l) => l.expiry).sort((a, b) => (a.expiry! < b.expiry! ? -1 : 1))
  return dated[0]?.expiry
}

export default function StockPage() {
  const { t } = useApp()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [cat, setCat] = useState<ProductCategory | 'all'>('all')

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const qty = productStock(p.lots)
      const exp = nearestExpiry(p)
      const expSoon = exp ? daysUntil(exp) <= 7 : false

      if (cat !== 'all' && p.category !== cat) return false
      if (status === 'in_stock' && qty <= p.lowStockThreshold) return false
      if (status === 'low_stock' && qty > p.lowStockThreshold) return false
      if (status === 'expiring' && !expSoon) return false

      if (query) {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.barcode ? p.barcode.includes(q) : false)
        )
      }
      return true
    })
  }, [query, status, cat])

  const statusFilters: { key: StatusFilter; labelKey: string }[] = [
    { key: 'all', labelKey: 'all' },
    { key: 'in_stock', labelKey: 'in_stock' },
    { key: 'low_stock', labelKey: 'low_stock' },
    { key: 'expiring', labelKey: 'expiring' },
  ]

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{t('stock')}</h1>
            <p className="text-sm text-muted-foreground">
              {PRODUCTS.length} {t('products_count')}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95">
            <Plus className="h-4 w-4" />
            {t('add_product')}
          </button>
        </div>

        {/* Recherche */}
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_product')}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Filtres statut */}
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                status === f.key
                  ? 'bg-navy text-navy-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        {/* Filtres catégorie */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setCat('all')}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              cat === 'all'
                ? 'bg-brand/15 text-brand'
                : 'bg-muted text-muted-foreground hover:bg-muted/70',
            )}
          >
            {t('all')}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                cat === c.key
                  ? 'bg-brand/15 text-brand'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>

        {/* Grille produits */}
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Package className="h-10 w-10 opacity-40" />
            <p className="text-sm">{t('search_product')}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useApp()
  const qty = productStock(product.lots)
  const isLow = qty <= product.lowStockThreshold
  const isOut = qty === 0
  const exp = nearestExpiry(product)
  const expDays = exp ? daysUntil(exp) : undefined
  const expSoon = expDays !== undefined && expDays <= 7
  const margin = product.sellPrice - product.buyPrice
  const marginPct = Math.round((margin / product.buyPrice) * 100)
  const fillPct = Math.min(100, Math.round((qty / (product.lowStockThreshold * 2.5)) * 100))

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-semibold text-foreground">
            {product.name}
          </h3>
          {product.barcode && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Barcode className="h-3.5 w-3.5" />
              {product.barcode}
            </p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            isOut
              ? 'bg-danger/15 text-danger'
              : isLow
                ? 'bg-warning/15 text-warning'
                : 'bg-brand/15 text-brand',
          )}
        >
          {isOut ? t('out_of_stock') : isLow ? t('low_stock') : t('in_stock')}
        </span>
      </div>

      {/* Quantité + barre */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">{qty}</span>
          <span className="text-xs text-muted-foreground">{t('units')}</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isOut ? 'bg-danger' : isLow ? 'bg-warning' : 'bg-brand',
            )}
            style={{ width: `${isOut ? 4 : fillPct}%` }}
          />
        </div>
      </div>

      {/* Prix */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-muted/60 px-2.5 py-1.5">
          <p className="text-[11px] text-muted-foreground">{t('buy_price')}</p>
          <p className="font-semibold text-foreground">{formatMRU(product.buyPrice)}</p>
        </div>
        <div className="rounded-lg bg-muted/60 px-2.5 py-1.5">
          <p className="text-[11px] text-muted-foreground">{t('sell_price')}</p>
          <p className="font-semibold text-foreground">{formatMRU(product.sellPrice)}</p>
        </div>
      </div>

      {/* Marge + péremption */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-1 font-medium text-brand">
          {t('margin')} +{marginPct}%
        </span>
        {expSoon ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 font-medium text-warning">
            <Clock className="h-3.5 w-3.5" />
            {expDays! < 0
              ? t('expired')
              : `${t('expires_in')} ${expDays} ${t('days')}`}
          </span>
        ) : exp ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {expDays} {t('days')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
            {t('no_expiry')}
          </span>
        )}
      </div>

      {/* Action */}
      <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand">
        <Pencil className="h-4 w-4" />
        {t('edit')}
      </button>
    </div>
  )
}
