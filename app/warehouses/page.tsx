'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatMRU } from '@/lib/format'
import { WAREHOUSES, PRODUCTS } from '@/lib/mock-data'
import type { Warehouse } from '@/lib/types'
import {
  Plus,
  Warehouse as WarehouseIcon,
  X,
  Check,
  MapPin,
  Package,
  Boxes,
  ArrowRightLeft,
  Trash2,
  Minus,
} from 'lucide-react'

/** Stock par entrepôt : { [warehouseId]: { [productId]: unités } } */
type StockMap = Record<string, Record<string, number>>

/** Prix unitaire d'achat (base de la valeur de stock). */
function unitBuyPrice(productId: string): number {
  const p = PRODUCTS.find((x) => x.id === productId)
  return p?.buyPrice ?? 0
}
function productName(productId: string): string {
  return PRODUCTS.find((x) => x.id === productId)?.name ?? productId
}

/** Répartition initiale de démonstration du stock catalogue dans les entrepôts. */
function initialStock(): StockMap {
  return {
    wh1: { p1: 30, p2: 32, p3: 18, p5: 48, p6: 40, p7: 60, p8: 20, p4: 14 },
    wh2: { p2: 20, p5: 30, p7: 40, p8: 30, p1: 20 },
    wh3: { p4: 30, p6: 20, p3: 10 },
  }
}

export default function WarehousesPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Warehouse[]>(WAREHOUSES)
  const [stock, setStock] = useState<StockMap>(initialStock)

  // modal "ajouter un entrepôt"
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  // modal "gérer les produits d'un entrepôt"
  const [manageId, setManageId] = useState<string | null>(null)

  /** Agrégats calculés en direct depuis le stock (pas de valeurs figées). */
  function stats(warehouseId: string) {
    const entries = Object.entries(stock[warehouseId] ?? {}).filter(
      ([, u]) => u > 0,
    )
    const units = entries.reduce((s, [, u]) => s + u, 0)
    const value = entries.reduce((s, [pid, u]) => s + u * unitBuyPrice(pid), 0)
    return { productCount: entries.length, units, value }
  }

  const totals = useMemo(() => {
    let units = 0
    let value = 0
    for (const w of items) {
      const s = stats(w.id)
      units += s.units
      value += s.value
    }
    return { units, value }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, stock])

  function addWarehouse() {
    const n = name.trim()
    if (!n) return
    const id = `wh-${Date.now()}`
    setItems((prev) => [
      ...prev,
      {
        id,
        name: n,
        location: location.trim() || '—',
        productCount: 0,
        units: 0,
        value: 0,
        fillPercent: 0,
        main: false,
      },
    ])
    setStock((prev) => ({ ...prev, [id]: {} }))
    setName('')
    setLocation('')
    setOpen(false)
  }

  /** Ajoute/retire des unités d'un produit dans un entrepôt (jamais négatif). */
  function setUnits(warehouseId: string, productId: string, units: number) {
    setStock((prev) => {
      const wh = { ...(prev[warehouseId] ?? {}) }
      if (units <= 0) delete wh[productId]
      else wh[productId] = units
      return { ...prev, [warehouseId]: wh }
    })
  }

  /** Transfère toutes les unités d'un produit vers un autre entrepôt. */
  function transfer(fromId: string, productId: string, toId: string) {
    if (fromId === toId) return
    setStock((prev) => {
      const from = { ...(prev[fromId] ?? {}) }
      const to = { ...(prev[toId] ?? {}) }
      const qty = from[productId] ?? 0
      if (qty <= 0) return prev
      to[productId] = (to[productId] ?? 0) + qty
      delete from[productId]
      return { ...prev, [fromId]: from, [toId]: to }
    })
  }

  function fillColor(pct: number) {
    if (pct >= 70) return 'bg-brand'
    if (pct >= 40) return 'bg-warning'
    return 'bg-destructive'
  }

  const manageWarehouse = items.find((w) => w.id === manageId) ?? null

  return (
    <AppShell title={t('warehouses')}>
      {/* Valeur + unités totales (combiné) */}
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
              {formatMRU(totals.value)}{' '}
              <span className="text-base font-medium text-muted-foreground">
                {t('mru')}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('wh_total_units')} :{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {totals.units}
              </span>{' '}
              {t('wh_units')}
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
        {items.map((w) => {
          const s = stats(w.id)
          return (
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
                    <p className="truncate font-semibold text-foreground">
                      {w.name}
                    </p>
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
                    {s.productCount}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t('wh_units')}</p>
                  <p className="mt-0.5 font-heading text-lg font-bold tabular-nums text-foreground">
                    {s.units}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  {t('wh_value')}
                </span>
                <span className="font-heading font-bold tabular-nums text-foreground">
                  {formatMRU(s.value)} {t('mru')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setManageId(w.id)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 active:scale-[0.99]"
              >
                <Package className="h-4 w-4" />
                {t('wh_manage')}
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal ajout d'entrepôt */}
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

      {/* Modal gestion des produits d'un entrepôt */}
      {manageWarehouse && (
        <ManageProductsModal
          warehouse={manageWarehouse}
          warehouses={items}
          stock={stock[manageWarehouse.id] ?? {}}
          onClose={() => setManageId(null)}
          onSetUnits={(pid, u) => setUnits(manageWarehouse.id, pid, u)}
          onTransfer={(pid, toId) => transfer(manageWarehouse.id, pid, toId)}
          t={t}
          dir={dir}
        />
      )}
    </AppShell>
  )
}

/* --------------------------------------------------------------------- */
/* Modal : gérer les produits d'un entrepôt                              */
/* --------------------------------------------------------------------- */

function ManageProductsModal({
  warehouse,
  warehouses,
  stock,
  onClose,
  onSetUnits,
  onTransfer,
  t,
  dir,
}: {
  warehouse: Warehouse
  warehouses: Warehouse[]
  stock: Record<string, number>
  onClose: () => void
  onSetUnits: (productId: string, units: number) => void
  onTransfer: (productId: string, toId: string) => void
  t: (k: string) => string
  dir: 'rtl' | 'ltr'
}) {
  const present = Object.entries(stock).filter(([, u]) => u > 0)
  const presentIds = new Set(present.map(([pid]) => pid))
  const available = PRODUCTS.filter((p) => !presentIds.has(p.id))

  const [adding, setAdding] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [addQty, setAddQty] = useState('')
  const [transferFor, setTransferFor] = useState<string | null>(null)

  const otherWarehouses = warehouses.filter((w) => w.id !== warehouse.id)

  function confirmAdd() {
    const qty = Number.parseInt(addQty, 10)
    if (!selectedProduct || !Number.isFinite(qty) || qty <= 0) return
    onSetUnits(selectedProduct, (stock[selectedProduct] ?? 0) + qty)
    setAdding(false)
    setSelectedProduct('')
    setAddQty('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-lg font-extrabold text-foreground">
              {t('wh_manage_title')} {warehouse.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {present.length} {t('wh_products')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Liste des produits présents */}
        {present.length === 0 ? (
          <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
            {t('wh_no_products')}
          </p>
        ) : (
          <ul className="space-y-2">
            {present.map(([pid, units]) => (
              <li
                key={pid}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {productName(pid)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {units} {t('wh_units')} · {t('wh_in_stock')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSetUnits(pid, units - 1)}
                      aria-label={t('wh_remove')}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground active:scale-95"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground">
                      {units}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSetUnits(pid, units + 1)}
                      aria-label={t('wh_add_product')}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Actions transfert / retirer */}
                <div className="mt-2 flex items-center gap-2">
                  {otherWarehouses.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setTransferFor(transferFor === pid ? null : pid)
                      }
                      className="flex items-center gap-1 rounded-lg bg-navy/10 px-2.5 py-1.5 text-xs font-semibold text-navy active:scale-95"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      {t('wh_transfer')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSetUnits(pid, 0)}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('wh_remove')}
                  </button>
                </div>

                {/* Sélecteur d'entrepôt cible pour le transfert */}
                {transferFor === pid && otherWarehouses.length > 0 && (
                  <div className="mt-2 rounded-lg bg-muted/60 p-2">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      {t('wh_transfer_to')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {otherWarehouses.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            onTransfer(pid, w.id)
                            setTransferFor(null)
                          }}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand active:scale-95"
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Ajout d'un produit du catalogue */}
        {adding ? (
          <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-3">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('wh_choose_product')}
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-brand"
            >
              <option value="">—</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('wh_quantity')}
            </label>
            <input
              value={addQty}
              onChange={(e) => setAddQty(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="0"
              className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-brand"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setSelectedProduct('')
                  setAddQty('')
                }}
                className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-semibold text-foreground active:scale-[0.99]"
              >
                {t('wh_cancel')}
              </button>
              <button
                type="button"
                onClick={confirmAdd}
                disabled={!selectedProduct || !addQty}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground active:scale-[0.99] disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {t('wh_save')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={available.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/5 active:scale-[0.99] disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
            {t('wh_add_product')}
          </button>
        )}
      </div>
    </div>
  )
}
