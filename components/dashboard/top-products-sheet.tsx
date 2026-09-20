'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import {
  X,
  TrendingUp,
  Wallet,
  Package,
  Utensils,
  Sparkles,
  Pill,
} from 'lucide-react'
import type { Product, Sale } from '@/lib/types'
import { formatMRU, productStock } from '@/lib/format'
import { cn } from '@/lib/utils'

const CATEGORY_ICON = {
  alimentation: Utensils,
  cosmetique: Sparkles,
  sante: Pill,
  autre: Package,
} as const

interface ProductRanking {
  product: Product
  qty: number
  revenue: number
  stock: number
}

export function TopProductsSheet({
  products,
  sales,
  t,
  dir,
  onClose,
}: {
  products: Product[]
  sales: Sale[]
  t: (k: string) => string
  dir: 'rtl' | 'ltr'
  onClose: () => void
}) {
  /** Classement de TOUS les produits par quantité vendue (décroissant). */
  const ranking = useMemo<ProductRanking[]>(() => {
    const qtyByProduct = new Map<string, number>()
    const revenueByProduct = new Map<string, number>()

    for (const sale of sales) {
      for (const it of sale.items) {
        // qty est exprimée en variante ; on ramène en unités via factor
        const units = it.qty * (it.factor ?? 1)
        qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) ?? 0) + units)
        revenueByProduct.set(
          it.productId,
          (revenueByProduct.get(it.productId) ?? 0) + it.qty * it.unitPrice,
        )
      }
    }

    return products
      .map((product) => ({
        product,
        qty: qtyByProduct.get(product.id) ?? 0,
        revenue: revenueByProduct.get(product.id) ?? 0,
        stock: productStock(product.lots),
      }))
      .sort((a, b) => b.qty - a.qty)
  }, [products, sales])

  const maxQty = Math.max(...ranking.map((r) => r.qty), 1)
  const hasSales = ranking.some((r) => r.qty > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        dir={dir}
        role="dialog"
        aria-modal="true"
        aria-label={t('top_products_all')}
        className="flex max-h-[92dvh] w-full max-w-lg animate-slide-in-up flex-col overflow-hidden rounded-t-3xl bg-card shadow-soft-lg sm:max-h-[85dvh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête (fixe) */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-brand">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-lg font-extrabold text-foreground">
                {t('top_products_all')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {ranking.length} {t('products_count').toLowerCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps défilant */}
        <div className="flex-1 overflow-y-auto p-5">
        {!hasSales ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="h-7 w-7" />
            </span>
            <p className="text-sm text-muted-foreground">{t('tp_empty')}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {ranking.map((row, i) => {
              const CatIcon = CATEGORY_ICON[row.product.category]
              const isLow = row.stock <= row.product.lowStockThreshold
              return (
                <li
                  key={row.product.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Rang */}
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                        i < 3 ? 'bg-accent text-brand' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {i + 1}
                    </span>

                    {/* Image / icône catégorie */}
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {row.product.image ? (
                        <Image
                          src={row.product.image || '/placeholder.svg'}
                          alt={row.product.name}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CatIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Nom + barre de volume */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {row.product.name}
                        </span>
                        <span className="shrink-0 font-heading text-sm font-bold tabular-nums text-foreground">
                          {row.qty} {t('units_sold')}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${(row.qty / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Détails : CA + stock restant */}
                  <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
                    <div className="flex items-center gap-2 bg-card px-3 py-2">
                      <Wallet className="h-4 w-4 shrink-0 text-brand" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{t('tp_revenue')}</p>
                        <p className="font-heading text-sm font-bold tabular-nums text-foreground">
                          {formatMRU(row.revenue)}{' '}
                          <span className="text-xs font-semibold text-muted-foreground">
                            {t('mru')}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-card px-3 py-2">
                      <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{t('tp_stock_left')}</p>
                        <p
                          className={cn(
                            'font-heading text-sm font-bold tabular-nums',
                            isLow ? 'text-destructive' : 'text-foreground',
                          )}
                        >
                          {row.stock}{' '}
                          <span className="text-xs font-semibold text-muted-foreground">
                            {t('tp_units')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        </div>
      </div>
    </div>
  )
}
