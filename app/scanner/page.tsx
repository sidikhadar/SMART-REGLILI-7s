'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ScanLine,
  Play,
  Square,
  Keyboard,
  Plus,
  Check,
  ArrowRight,
  ShoppingCart,
  X,
  PackageSearch,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PRODUCTS } from '@/lib/mock-data'
import { formatMRU, productStock } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function ScannerPage() {
  const { t, dir, addToCart, cart } = useApp()

  const [scanning, setScanning] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [code, setCode] = useState('')
  const [last, setLast] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [added, setAdded] = useState(false)
  const manualRef = useRef<HTMLInputElement>(null)

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty, 0),
    [cart],
  )

  function findByCode(raw: string): Product | null {
    const q = raw.trim().toLowerCase()
    if (!q) return null
    return (
      PRODUCTS.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === q) ||
          p.name.toLowerCase().includes(q),
      ) ?? null
    )
  }

  // Simule la détection d'un code-barres (la vraie caméra nécessite de publier l'app)
  function simulateScan() {
    const random = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
    setLast(random)
    setNotFound(false)
    setAdded(false)
  }

  function submitManual() {
    const found = findByCode(code)
    if (found) {
      setLast(found)
      setNotFound(false)
      setAdded(false)
      setCode('')
      setManualOpen(false)
    } else {
      setNotFound(true)
      setLast(null)
    }
  }

  function handleAdd() {
    if (!last) return
    addToCart(last)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <AppShell title={t('scanner')}>
      <div className="mx-auto max-w-md space-y-4">
        {/* Cadre de scan */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="relative aspect-square w-full bg-navy">
            {/* Réticule */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                {/* Coins */}
                <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-brand" />
                <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-brand" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-brand" />
                <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-brand" />
                {/* Ligne de scan animée */}
                {scanning && (
                  <span className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse bg-brand shadow-[0_0_12px_2px_hsl(var(--brand))]" />
                )}
                <ScanLine
                  className={cn(
                    'absolute inset-0 m-auto h-16 w-16 transition-opacity',
                    scanning ? 'text-brand/30' : 'text-navy-foreground/30',
                  )}
                />
              </div>
            </div>

            <p className="absolute inset-x-0 bottom-4 text-center text-sm text-navy-foreground/80">
              {scanning ? t('scan_hint') : t('scan_camera_note')}
            </p>
          </div>

          {/* Contrôle scan */}
          <div className="flex gap-2 p-3">
            <button
              type="button"
              onClick={() => {
                setScanning((s) => !s)
                if (!scanning) setTimeout(simulateScan, 900)
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold shadow-soft transition-transform active:scale-95',
                scanning
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-brand text-brand-foreground',
              )}
            >
              {scanning ? (
                <>
                  <Square className="h-5 w-5" />
                  {t('scan_stop')}
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  {t('scan_start')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setManualOpen(true)
                setTimeout(() => manualRef.current?.focus(), 50)
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Keyboard className="h-5 w-5" />
              <span className="hidden sm:inline">{t('scan_manual')}</span>
            </button>
          </div>
        </div>

        {/* Bouton simuler (démo sans caméra) */}
        <button
          type="button"
          onClick={simulateScan}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <ScanLine className="h-4 w-4" />
          {t('scan_simulate')}
        </button>

        {/* Produit introuvable */}
        {notFound && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
            <PackageSearch className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">{t('scan_not_found')}</p>
          </div>
        )}

        {/* Dernier produit scanné */}
        {last && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('scan_last')}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-bold text-foreground">
                  {last.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {productStock(last.lots)} {t('in_stock')}
                  {last.barcode ? ` · ${last.barcode}` : ''}
                </p>
                <p className="mt-1 font-heading text-lg font-extrabold tabular-nums text-brand">
                  {formatMRU(last.sellPrice)}{' '}
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('mru')}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 font-semibold shadow-soft transition-all active:scale-95',
                  added
                    ? 'bg-navy text-navy-foreground'
                    : 'bg-brand text-brand-foreground',
                )}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    {t('scan_added')}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    {t('scan_add_cart')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Aller à la caisse */}
        <Link
          href="/caisse"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <span className="text-start">
              <span className="block font-heading text-sm font-bold text-foreground">
                {t('scan_go_caisse')}
              </span>
              <span className="block text-xs text-muted-foreground">
                {cartCount} {t('items_count')}
              </span>
            </span>
          </span>
          <ArrowRight className={cn('h-5 w-5 text-muted-foreground', dir === 'rtl' && 'rotate-180')} />
        </Link>
      </div>

      {/* Saisie manuelle du code */}
      {manualOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setManualOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {t('scan_manual')}
              </h2>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t('cancel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              ref={manualRef}
              dir={dir}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  submitManual()
                }
              }}
              inputMode="numeric"
              placeholder={t('search_or_scan')}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={submitManual}
              disabled={!code.trim()}
              className="mt-3 w-full rounded-xl bg-brand py-3 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
            >
              {t('scan_add_cart')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
