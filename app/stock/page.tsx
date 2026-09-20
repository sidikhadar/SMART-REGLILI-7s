'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, ClipboardCheck, Boxes, Wallet, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { ProductCard } from '@/components/stock/product-card'
import { AddProductSheet } from '@/components/stock/add-product-sheet'
import { InventoryMode } from '@/components/stock/inventory-mode'
import { PRODUCTS } from '@/lib/mock-data'
import { productStock, formatMRU } from '@/lib/format'
import { stockValue } from '@/lib/stock-utils'
import type { Product, ProductCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORIES: (ProductCategory | 'all')[] = [
  'all',
  'alimentation',
  'cosmetique',
  'sante',
  'autre',
]

export default function StockPage() {
  const { t, lang } = useApp()
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<ProductCategory | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat = cat === 'all' || p.category === cat
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        !!p.location?.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [products, query, cat])

  const lowStockCount = products.filter(
    (p) => productStock(p.lots) <= p.lowStockThreshold,
  ).length
  const totalValue = stockValue(products)

  function handleAddProduct(p: Product) {
    setProducts((prev) => [p, ...prev])
    setAddOpen(false)
  }

  function handleUpdateProduct(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)))
    setEditProduct(null)
  }

  function handleInventoryAdjust(adjusted: Record<string, number>) {
    // Applique les quantités comptées (ajuste le 1er lot pour simuler)
    setProducts((prev) =>
      prev.map((p) => {
        if (!(p.id in adjusted)) return p
        const counted = adjusted[p.id]
        const lots = [...p.lots]
        const current = productStock(lots)
        const diff = counted - current
        if (lots.length === 0) {
          lots.push({ id: `lot-${Date.now()}`, quantity: Math.max(0, counted) })
        } else {
          lots[0] = { ...lots[0], quantity: Math.max(0, lots[0].quantity + diff) }
        }
        return { ...p, lots }
      }),
    )
    setInventoryOpen(false)
  }

  return (
    <AppShell title={t('stock')}>
      {/* Stats rapides */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatTile
          icon={<Boxes className="h-4 w-4" />}
          label={t('in_stock')}
          value={String(products.length)}
        />
        <StatTile
          icon={<Wallet className="h-4 w-4" />}
          label={t('stock_value')}
          value={formatMRU(totalValue)}
          sub={t('mru')}
        />
        <StatTile
          icon={<AlertTriangle className="h-4 w-4" />}
          label={t('low_stock')}
          value={String(lowStockCount)}
          danger={lowStockCount > 0}
        />
      </div>

      {/* Actions */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          {t('add_product')}
        </button>
        <button
          type="button"
          onClick={() => setInventoryOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground shadow-soft transition-all hover:bg-muted active:scale-[0.99]"
        >
          <ClipboardCheck className="h-4 w-4" />
          {t('inventory_mode')}
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_product_or_location')}
          className="w-full rounded-xl border border-border bg-card py-3 ps-11 pe-4 text-base text-foreground shadow-soft outline-none focus:border-brand"
        />
      </div>

      {/* Filtres catégorie */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              cat === c
                ? 'border-brand bg-brand text-brand-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {c === 'all' ? t('cat_all') : t(`cat_${c}`)}
          </button>
        ))}
      </div>

      {/* Liste produits */}
      <div className="space-y-2.5">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            t={t}
            lang={lang}
            onEdit={() => setEditProduct(p)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('no_products_found')}
          </p>
        )}
      </div>

      {addOpen && (
        <AddProductSheet
          t={t}
          onClose={() => setAddOpen(false)}
          onSave={handleAddProduct}
        />
      )}
      {editProduct && (
        <AddProductSheet
          t={t}
          initial={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}
      {inventoryOpen && (
        <InventoryMode
          products={products}
          t={t}
          onClose={() => setInventoryOpen(false)}
          onApply={handleInventoryAdjust}
        />
      )}
    </AppShell>
  )
}

function StatTile({
  icon,
  label,
  value,
  sub,
  danger,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  danger?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div
        className={cn(
          'mb-1 flex h-7 w-7 items-center justify-center rounded-lg',
          danger ? 'bg-destructive/10 text-destructive' : 'bg-accent text-brand',
        )}
      >
        {icon}
      </div>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
        {value}
        {sub && <span className="ms-1 text-xs font-medium text-muted-foreground">{sub}</span>}
      </p>
    </div>
  )
}
