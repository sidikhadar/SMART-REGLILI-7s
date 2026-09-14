'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  ClipboardCheck,
  History,
  ArrowLeft,
  MapPin,
  Boxes,
  Wallet,
  Package,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react'
import { ProductCard } from '@/components/stock/product-card'
import { AddProductSheet } from '@/components/stock/add-product-sheet'
import { InventoryMode } from '@/components/stock/inventory-mode'
import { WarehouseHistorySheet } from '@/components/warehouses/warehouse-history-sheet'
import { productStock, formatMRU } from '@/lib/format'
import type { Product, StockMovement, Warehouse } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Gestion du stock d'un entrepôt donné : même structure et mêmes
 * fonctionnalités que la page /stock, mais restreinte aux produits
 * présents dans cet entrepôt.
 */
export function WarehouseStockView({
  warehouse,
  warehouses,
  products,
  movements,
  t,
  lang,
  dir,
  onBack,
  onAddProduct,
  onAdjust,
  onTransfer,
  onRemove,
}: {
  warehouse: Warehouse
  warehouses: Warehouse[]
  /** Produits de cet entrepôt, lots déjà filtrés sur ses quantités. */
  products: Product[]
  movements: StockMovement[]
  t: (k: string) => string
  lang: string
  dir: 'rtl' | 'ltr'
  onBack: () => void
  onAddProduct: (p: Product) => void
  onAdjust: (adjusted: Record<string, number>) => void
  onTransfer: (productId: string, toWarehouseId: string) => void
  onRemove: (productId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [transferFor, setTransferFor] = useState<string | null>(null)

  const otherWarehouses = warehouses.filter((w) => w.id !== warehouse.id)

  // Recherche par nom, code-barres et emplacement de l'entrepôt
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    const matchLocation =
      warehouse.location.toLowerCase().includes(q) ||
      warehouse.name.toLowerCase().includes(q)
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        matchLocation,
    )
  }, [products, query, warehouse.location, warehouse.name])

  const units = products.reduce((s, p) => s + productStock(p.lots), 0)
  const value = products.reduce(
    (s, p) => s + productStock(p.lots) * p.buyPrice,
    0,
  )

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Header entrepôt */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label={t('wh_back')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-lg font-bold text-foreground">
              {warehouse.name}
            </h2>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {warehouse.location}
            </p>
          </div>
          {warehouse.main && (
            <span className="shrink-0 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
              {t('wh_main')}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Stats rapides */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <StatTile
            icon={<Package className="h-4 w-4" />}
            label={t('wh_products')}
            value={String(products.length)}
          />
          <StatTile
            icon={<Boxes className="h-4 w-4" />}
            label={t('wh_units')}
            value={String(units)}
          />
          <StatTile
            icon={<Wallet className="h-4 w-4" />}
            label={t('wh_value')}
            value={formatMRU(value)}
            sub={t('mru')}
          />
        </div>

        {/* Actions principales */}
        <div className="mb-2 flex gap-2">
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
            {t('wh_inventory')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-navy/30 bg-navy/5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10 active:scale-[0.99]"
        >
          <History className="h-4 w-4" />
          {t('wh_history')}
        </button>

        {/* Recherche */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('wh_search_placeholder')}
            className="w-full rounded-xl border border-border bg-card py-3 ps-11 pe-4 text-base text-foreground shadow-soft outline-none focus:border-brand"
          />
        </div>

        {/* Liste produits de l'entrepôt */}
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <div key={p.id}>
              <ProductCard product={p} t={t} lang={lang} />

              {/* Actions transfert / retirer */}
              <div className="mt-1.5 flex items-center gap-2 px-1">
                {otherWarehouses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTransferFor(transferFor === p.id ? null : p.id)
                    }
                    className="flex min-h-11 items-center gap-1 rounded-lg bg-navy/10 px-3 text-xs font-semibold text-navy active:scale-95"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    {t('wh_transfer')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="flex min-h-11 items-center gap-1 rounded-lg bg-destructive/10 px-3 text-xs font-semibold text-destructive active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('wh_remove')}
                </button>
              </div>

              {/* Choix de l'entrepôt cible */}
              {transferFor === p.id && otherWarehouses.length > 0 && (
                <div className="mt-1.5 rounded-xl bg-muted/60 p-2.5">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {t('wh_transfer_to')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {otherWarehouses.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          onTransfer(p.id, w.id)
                          setTransferFor(null)
                        }}
                        className="min-h-11 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground hover:border-brand hover:text-brand active:scale-95"
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="rounded-xl bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
              {products.length === 0
                ? t('wh_no_products')
                : t('no_products_found')}
            </p>
          )}
        </div>
      </div>

      {addOpen && (
        <AddProductSheet
          t={t}
          onClose={() => setAddOpen(false)}
          onSave={(p) => {
            onAddProduct(p)
            setAddOpen(false)
          }}
        />
      )}

      {inventoryOpen && (
        <InventoryMode
          products={products}
          t={t}
          onClose={() => setInventoryOpen(false)}
          onApply={(adjusted) => {
            onAdjust(adjusted)
            setInventoryOpen(false)
          }}
        />
      )}

      {historyOpen && (
        <WarehouseHistorySheet
          warehouseName={warehouse.name}
          movements={movements}
          productName={(pid) =>
            products.find((p) => p.id === pid)?.name ?? pid
          }
          t={t}
          lang={lang}
          dir={dir}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div
        className={cn(
          'mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-brand',
        )}
      >
        {icon}
      </div>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
        {value}
        {sub && (
          <span className="ms-1 text-xs font-medium text-muted-foreground">
            {sub}
          </span>
        )}
      </p>
    </div>
  )
}
