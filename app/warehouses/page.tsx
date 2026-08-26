'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatMRU, productStock } from '@/lib/format'
import { WAREHOUSES, PRODUCTS, STOCK_MOVEMENTS } from '@/lib/mock-data'
import type { Product, StockMovement, Warehouse } from '@/lib/types'
import { WarehouseSheet } from '@/components/warehouses/warehouse-sheet'
import { WarehouseStockView } from '@/components/warehouses/warehouse-stock-view'
import {
  Plus,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Boxes,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react'

/** Stock par entrepôt : { [warehouseId]: { [productId]: unités } } */
type StockMap = Record<string, Record<string, number>>

/** Répartition initiale de démonstration du stock catalogue dans les entrepôts. */
function initialStock(): StockMap {
  return {
    wh1: { p1: 30, p2: 32, p3: 18, p5: 48, p6: 40, p7: 60, p8: 20, p4: 14 },
    wh2: { p2: 20, p5: 30, p7: 40, p8: 30, p1: 20 },
    wh3: { p4: 30, p6: 20, p3: 10 },
  }
}

export default function WarehousesPage() {
  const { t, lang, dir } = useApp()

  const [items, setItems] = useState<Warehouse[]>(WAREHOUSES)
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS)
  const [stock, setStock] = useState<StockMap>(initialStock)
  const [movements, setMovements] = useState<StockMovement[]>(STOCK_MOVEMENTS)

  // sheets & menus
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Warehouse | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null)
  const [manageId, setManageId] = useState<string | null>(null)

  function unitBuyPrice(productId: string): number {
    return catalog.find((x) => x.id === productId)?.buyPrice ?? 0
  }
  function productName(productId: string): string {
    return catalog.find((x) => x.id === productId)?.name ?? productId
  }

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
  }, [items, stock, catalog])

  /** Journalise un mouvement de stock. */
  function logMovement(
    warehouseId: string,
    productId: string,
    type: StockMovement['type'],
    quantity: number,
    note?: string,
  ) {
    if (quantity <= 0) return
    setMovements((prev) => [
      {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        warehouseId,
        productId,
        type,
        quantity,
        date: new Date().toISOString(),
        note,
      },
      ...prev,
    ])
  }

  function saveWarehouse(values: {
    name: string
    location: string
    main: boolean
  }) {
    const location = values.location || '—'

    if (editTarget) {
      setItems((prev) =>
        prev.map((w) =>
          w.id === editTarget.id
            ? { ...w, name: values.name, location, main: values.main }
            : // un seul entrepôt principal à la fois
              values.main
              ? { ...w, main: false }
              : w,
        ),
      )
      setEditTarget(null)
      return
    }

    const id = `wh-${Date.now()}`
    setItems((prev) => [
      ...prev.map((w) => (values.main ? { ...w, main: false } : w)),
      {
        id,
        name: values.name,
        location,
        productCount: 0,
        units: 0,
        value: 0,
        fillPercent: 0,
        main: values.main,
      },
    ])
    setStock((prev) => ({ ...prev, [id]: {} }))
    setAddOpen(false)
  }

  function deleteWarehouse(w: Warehouse) {
    // Bloqué si l'entrepôt contient encore des lots
    if (stats(w.id).productCount > 0) return
    setItems((prev) => prev.filter((x) => x.id !== w.id))
    setStock((prev) => {
      const next = { ...prev }
      delete next[w.id]
      return next
    })
    setMovements((prev) => prev.filter((m) => m.warehouseId !== w.id))
    setDeleteTarget(null)
  }

  /** Définit les unités d'un produit dans un entrepôt (jamais négatif). */
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
    const qty = stock[fromId]?.[productId] ?? 0
    if (qty <= 0) return

    setStock((prev) => {
      const from = { ...(prev[fromId] ?? {}) }
      const to = { ...(prev[toId] ?? {}) }
      to[productId] = (to[productId] ?? 0) + qty
      delete from[productId]
      return { ...prev, [fromId]: from, [toId]: to }
    })

    const fromName = items.find((w) => w.id === fromId)?.name ?? ''
    const toName = items.find((w) => w.id === toId)?.name ?? ''
    logMovement(fromId, productId, 'transfer_out', qty, `→ ${toName}`)
    logMovement(toId, productId, 'transfer_in', qty, `← ${fromName}`)
  }

  /** Ajoute un produit du catalogue (ou nouveau) dans un entrepôt. */
  function addProductToWarehouse(warehouseId: string, p: Product) {
    const qty = productStock(p.lots)
    const existing = catalog.find(
      (x) => x.id === p.id || (p.barcode && x.barcode === p.barcode),
    )

    if (existing) {
      setUnits(warehouseId, existing.id, (stock[warehouseId]?.[existing.id] ?? 0) + qty)
      logMovement(warehouseId, existing.id, 'add', qty)
      return
    }

    setCatalog((prev) => [p, ...prev])
    setUnits(warehouseId, p.id, qty)
    logMovement(warehouseId, p.id, 'add', qty)
  }

  /** Applique les quantités comptées en inventaire pour un entrepôt. */
  function applyInventory(
    warehouseId: string,
    adjusted: Record<string, number>,
  ) {
    Object.entries(adjusted).forEach(([pid, counted]) => {
      const current = stock[warehouseId]?.[pid] ?? 0
      const diff = counted - current
      setUnits(warehouseId, pid, counted)
      if (diff > 0) logMovement(warehouseId, pid, 'add', diff, t('wh_inventory'))
      else if (diff < 0)
        logMovement(warehouseId, pid, 'remove', -diff, t('wh_inventory'))
    })
  }

  /** Retire totalement un produit d'un entrepôt. */
  function removeProduct(warehouseId: string, productId: string) {
    const qty = stock[warehouseId]?.[productId] ?? 0
    if (qty <= 0) return
    setUnits(warehouseId, productId, 0)
    logMovement(warehouseId, productId, 'remove', qty)
  }

  /**
   * Produits d'un entrepôt : on repart du catalogue et on remplace les lots
   * par la quantité réellement stockée ici, pour réutiliser ProductCard,
   * InventoryMode et le reste des composants de /stock tels quels.
   */
  function warehouseProducts(warehouseId: string): Product[] {
    const wh = stock[warehouseId] ?? {}
    return Object.entries(wh)
      .filter(([, u]) => u > 0)
      .map(([pid, units]) => {
        const base = catalog.find((p) => p.id === pid)
        if (!base) return null
        return {
          ...base,
          lots: [{ id: `${warehouseId}-${pid}`, quantity: units }],
        }
      })
      .filter((p): p is Product => p !== null)
  }

  const manageWarehouse = items.find((w) => w.id === manageId) ?? null

  if (manageWarehouse) {
    return (
      <WarehouseStockView
        warehouse={manageWarehouse}
        warehouses={items}
        products={warehouseProducts(manageWarehouse.id)}
        movements={movements.filter((m) => m.warehouseId === manageWarehouse.id)}
        productName={productName}
        t={t}
        lang={lang}
        dir={dir}
        onBack={() => setManageId(null)}
        onAddProduct={(p) => addProductToWarehouse(manageWarehouse.id, p)}
        onAdjust={(adj) => applyInventory(manageWarehouse.id, adj)}
        onTransfer={(pid, toId) => transfer(manageWarehouse.id, pid, toId)}
        onRemove={(pid) => removeProduct(manageWarehouse.id, pid)}
      />
    )
  }

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
            onClick={() => setAddOpen(true)}
            aria-label={t('wh_add')}
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
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <WarehouseIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-foreground">
                      {w.name}
                    </p>
                    {w.main && (
                      <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {t('wh_main')}
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {w.location}
                  </p>
                </div>

                <WarehouseMenu
                  open={menuId === w.id}
                  onToggle={() => setMenuId(menuId === w.id ? null : w.id)}
                  onClose={() => setMenuId(null)}
                  onEdit={() => {
                    setMenuId(null)
                    setEditTarget(w)
                  }}
                  onDelete={() => {
                    setMenuId(null)
                    setDeleteTarget(w)
                  }}
                  t={t}
                />
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

      {/* Ajout / modification d'entrepôt */}
      {(addOpen || editTarget) && (
        <WarehouseSheet
          warehouse={editTarget}
          t={t}
          dir={dir}
          onClose={() => {
            setAddOpen(false)
            setEditTarget(null)
          }}
          onSave={saveWarehouse}
        />
      )}

      {/* Confirmation de suppression */}
      {deleteTarget && (
        <DeleteWarehouseDialog
          warehouse={deleteTarget}
          productCount={stats(deleteTarget.id).productCount}
          t={t}
          dir={dir}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteWarehouse(deleteTarget)}
        />
      )}
    </AppShell>
  )
}

/* --------------------------------------------------------------------- */
/* Menu contextuel d'un entrepôt                                          */
/* --------------------------------------------------------------------- */

function WarehouseMenu({
  open,
  onToggle,
  onClose,
  onEdit,
  onDelete,
  t,
}: {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  t: (k: string) => string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocPointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onDocPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label={t('sup_actions')}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-12 z-20 w-48 animate-float-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onEdit}
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-start text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            {t('edit')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="flex min-h-11 w-full items-center gap-2.5 border-t border-border px-4 text-start text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            {t('delete')}
          </button>
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Confirmation de suppression                                            */
/* --------------------------------------------------------------------- */

function DeleteWarehouseDialog({
  warehouse,
  productCount,
  t,
  dir,
  onClose,
  onConfirm,
}: {
  warehouse: Warehouse
  productCount: number
  t: (k: string) => string
  dir: 'rtl' | 'ltr'
  onClose: () => void
  onConfirm: () => void
}) {
  const blocked = productCount > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={dir}
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className={
              blocked
                ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning'
                : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="font-heading text-lg font-extrabold text-foreground">
          {t('wh_delete')}
        </h3>
        <p className="mt-1 truncate text-sm font-medium text-foreground">
          {warehouse.name}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {blocked ? t('wh_delete_blocked') : t('wh_delete_confirm')}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.99]"
          >
            {t('wh_cancel')}
          </button>
          {!blocked && (
            <button
              type="button"
              onClick={onConfirm}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-semibold text-destructive-foreground shadow-soft hover:brightness-110 active:scale-[0.99]"
            >
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
