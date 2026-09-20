'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  Flame,
  Utensils,
  Sparkles,
  Pill,
  Package,
  CalendarClock,
  Layers,
  Boxes,
  Pencil,
} from 'lucide-react'
import type { Product } from '@/lib/types'
import { productStock, formatMRU, formatDate } from '@/lib/format'
import {
  productMargin,
  sellSignal,
  productExpiryLevel,
  expiryLevel,
  sortLotsFIFO,
  type SellSignal,
  type ExpiryLevel,
} from '@/lib/stock-utils'
import { SALES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const CATEGORY_ICON = {
  alimentation: Utensils,
  cosmetique: Sparkles,
  sante: Pill,
  autre: Package,
} as const

const SIGNAL_STYLE: Record<SellSignal, { dot: string; label: string }> = {
  hot: { dot: 'bg-brand', label: 'signal_hot' },
  warm: { dot: 'bg-warning', label: 'signal_warm' },
  cold: { dot: 'bg-muted-foreground/50', label: 'signal_cold' },
}

function expiryClasses(level: ExpiryLevel): string {
  switch (level) {
    case 'expired':
    case 'danger':
      return 'bg-destructive/10 text-destructive'
    case 'warning':
      return 'bg-warning/15 text-warning'
    case 'info':
      return 'bg-accent text-accent-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ProductCard({
  product,
  t,
  lang,
  onEdit,
}: {
  product: Product
  t: (k: string) => string
  lang: string
  onEdit?: () => void
}) {
  const [open, setOpen] = useState(false)
  const stock = productStock(product.lots)
  const margin = productMargin(product.buyPrice, product.sellPrice)
  const signal = sellSignal(product.id, SALES)
  const exp = productExpiryLevel(product.lots)
  const isLow = stock <= product.lowStockThreshold
  const CatIcon = CATEGORY_ICON[product.category]
  const fifoLots = sortLotsFIFO(product.lots)

  function expiryText(level: ExpiryLevel, days: number | null) {
    if (level === 'none' || days === null) return t('no_expiry')
    if (level === 'expired') return t('expired')
    if (days === 0) return t('expires_today')
    return `${t('expires_in')} ${days} ${t('days_short')}`
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center gap-3 p-3">
        {/* Image / icône catégorie */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {product.image ? (
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <CatIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Infos principales */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn('h-2.5 w-2.5 shrink-0 rounded-full', SIGNAL_STYLE[signal].dot)}
              title={t(SIGNAL_STYLE[signal].label)}
            />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {product.name}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
              <CatIcon className="h-3 w-3" />
              {t(`cat_${product.category}`)}
            </span>
            <span className="font-heading font-bold tabular-nums text-brand">
              {formatMRU(product.sellPrice)} {t('mru')}
            </span>
            <span className="text-muted-foreground">
              {t('margin')} {margin}%
            </span>
            {product.variants && product.variants.length > 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-navy/10 px-1.5 py-0.5 font-medium text-navy">
                <Boxes className="h-3 w-3" />
                {product.variants.length - 1} {t('sale_units').toLowerCase()}
              </span>
            )}
          </div>
        </div>

        {/* Stock + actions */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              'rounded-lg px-2 py-0.5 text-sm font-bold tabular-nums',
              isLow ? 'bg-destructive/10 text-destructive' : 'bg-accent text-accent-foreground',
            )}
          >
            {stock}
          </span>
          <div className="flex items-center gap-0.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={t('edit_product_title')}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t('hide_lots') : t('view_lots')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Badge d'expiration (lot le plus urgent) */}
      {exp.level !== 'none' && exp.level !== 'ok' && (
        <div className="px-3 pb-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
              expiryClasses(exp.level),
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {expiryText(exp.level, exp.days)}
          </span>
        </div>
      )}

      {/* Détail des lots (FIFO) */}
      {open && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            {t('lots')} ({product.lots.length})
          </div>
          <ul className="space-y-1.5">
            {fifoLots.map((lot, i) => {
              const e = expiryLevel(lot.expiry)
              return (
                <li
                  key={lot.id}
                  className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-sm shadow-soft"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {lot.number ? lot.number : `${t('lot')} ${i + 1}`}
                      </span>
                      {i === 0 && (
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                          {t('fifo_first')}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs',
                        e.level === 'danger' || e.level === 'expired'
                          ? 'text-destructive'
                          : e.level === 'warning'
                            ? 'text-warning'
                            : 'text-muted-foreground',
                      )}
                    >
                      {lot.expiry
                        ? `${t('expiry')}: ${formatDate(lot.expiry, lang)}`
                        : t('no_expiry')}
                    </span>
                  </div>
                  <span className="font-heading font-bold tabular-nums text-foreground">
                    {lot.quantity}
                  </span>
                </li>
              )
            })}
          </ul>

          {/* Variantes de vente (packs, cartons...) */}
          {product.variants && product.variants.length > 1 && (
            <>
              <div className="mb-1.5 mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Boxes className="h-3.5 w-3.5" />
                {t('sale_units')}
              </div>
              <ul className="space-y-1.5">
                {product.variants.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-sm shadow-soft"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{v.label}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        ×{v.factor}
                      </span>
                    </span>
                    <span className="font-heading font-bold tabular-nums text-foreground">
                      {formatMRU(v.price)} {t('mru')}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
