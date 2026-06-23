'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Search,
  ScanLine,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ShoppingCart,
  Check,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PRODUCTS } from '@/lib/mock-data'
import { formatMRU, productStock } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/types'

const PAY_METHODS: PaymentMethod[] = [
  'especes',
  'bankily',
  'masrivi',
  'sedad',
  'click',
  'bik',
  'bamis',
  'amanety',
  'credit',
]

export default function CaissePage() {
  const {
    t,
    dir,
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    registers,
    activeRegister,
    setActiveRegister,
  } = useApp()

  const [query, setQuery] = useState('')
  const [showRegisters, setShowRegisters] = useState(false)
  const [editingQty, setEditingQty] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('especes')
  const [received, setReceived] = useState('')
  const [done, setDone] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeName =
    registers.find((r) => r.id === activeRegister)?.name ?? registers[0]?.name

  // Recherche produit par nom ou code-barres
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)),
    ).slice(0, 8)
  }, [query])

  function handleAdd(productId: string) {
    const p = PRODUCTS.find((x) => x.id === productId)
    if (!p) return
    addToCart(p) // incrémente automatiquement si déjà présent
    setQuery('')
    searchRef.current?.focus()
  }

  // Simule un scan : on prend le premier résultat exact / sinon le 1er résultat
  function handleScan() {
    if (results.length) {
      handleAdd(results[0].id)
      return
    }
    // pas de saisie -> ajoute un produit aléatoire pour démo
    const random = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
    addToCart(random)
  }

  const received_n = Number(received) || 0
  const change = Math.max(0, received_n - cartTotal)
  const remaining = Math.max(0, cartTotal - received_n)

  function validateSale() {
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setPayOpen(false)
      setReceived('')
      clearCart()
    }, 1400)
  }

  return (
    <AppShell title={t('caisse')}>
      <div className="grid gap-4 lg:grid-cols-5">
        {/* ----- Colonne gauche : recherche + résultats ----- */}
        <section className="lg:col-span-3">
          {/* Sélecteur de caisse */}
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => setShowRegisters((s) => !s)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <span className="text-start">
                  <span className="block text-xs text-muted-foreground">
                    {t('active_register')}
                  </span>
                  <span className="block font-heading text-base font-bold text-foreground">
                    {activeName}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  showRegisters && 'rotate-180',
                )}
              />
            </button>

            {showRegisters && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                {registers.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRegister(r.id)
                      setShowRegisters(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-start text-sm transition-colors hover:bg-muted',
                      r.id === activeRegister && 'bg-brand/5',
                    )}
                  >
                    <span className="font-medium text-foreground">{r.name}</span>
                    {r.id === activeRegister && (
                      <Check className="h-4 w-4 text-brand" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barre de recherche + scan */}
          <div className="mb-3 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-3 shadow-soft">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                dir={dir}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_or_scan')}
                className="w-full bg-transparent py-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleScan}
              className="flex items-center gap-2 rounded-2xl bg-navy px-4 font-semibold text-navy-foreground shadow-soft transition-transform active:scale-95"
            >
              <ScanLine className="h-5 w-5" />
              <span className="hidden sm:inline">{t('scan')}</span>
            </button>
          </div>

          {/* Résultats de recherche */}
          {query && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t('no_products_found')}
                </p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-start last:border-0 transition-colors hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {productStock(p.lots)} {t('in_stock')} · {p.barcode}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-heading font-bold tabular-nums text-foreground">
                        {formatMRU(p.sellPrice)}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                        <Plus className="h-4 w-4" />
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Raccourcis produits populaires si pas de recherche */}
          {!query && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRODUCTS.slice(0, 9).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAdd(p.id)}
                  className="rounded-2xl border border-border bg-card p-3 text-start shadow-soft transition-transform active:scale-95"
                >
                  <span className="block truncate text-sm font-medium text-foreground">
                    {p.name}
                  </span>
                  <span className="mt-1 block font-heading font-bold tabular-nums text-brand">
                    {formatMRU(p.sellPrice)}{' '}
                    <span className="text-xs text-muted-foreground">{t('mru')}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ----- Colonne droite : panier ----- */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                {t('cart')} · {cart.length} {t('items_count')}
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-destructive"
                >
                  {t('clear')}
                </button>
              )}
            </div>

            {/* Lignes du panier */}
            <div className="max-h-[42vh] divide-y divide-border overflow-y-auto">
              {cart.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">{t('empty_cart')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatMRU(item.unitPrice)} {t('mru')} / {t('unit')}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Contrôle quantité */}
                      <div className="flex items-center gap-1 rounded-xl border border-border p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                          aria-label={t('minus')}
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        {editingQty === item.productId ? (
                          <input
                            type="number"
                            inputMode="numeric"
                            autoFocus
                            min={1}
                            defaultValue={item.qty}
                            onBlur={(e) => {
                              const v = parseInt(e.target.value, 10)
                              updateQty(item.productId, isNaN(v) ? item.qty : v)
                              setEditingQty(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const v = parseInt(
                                  (e.target as HTMLInputElement).value,
                                  10,
                                )
                                updateQty(item.productId, isNaN(v) ? item.qty : v)
                                setEditingQty(null)
                              }
                            }}
                            className="h-8 w-12 rounded-lg border border-brand bg-background text-center text-sm font-bold text-foreground outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingQty(item.productId)}
                            className="h-8 w-12 rounded-lg text-center text-sm font-bold tabular-nums text-foreground transition-colors hover:bg-muted"
                            aria-label={t('qty_short')}
                          >
                            {item.qty}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                          aria-label={t('plus')}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Total ligne */}
                      <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                        {formatMRU(item.qty * item.unitPrice)} {t('mru')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Résumé */}
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="tabular-nums text-foreground">
                  {formatMRU(cartTotal)} {t('mru')}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-medium text-foreground">{t('total')}</span>
                <span className="font-heading text-2xl font-extrabold tabular-nums text-brand">
                  {formatMRU(cartTotal)}{' '}
                  <span className="text-sm text-muted-foreground">{t('mru')}</span>
                </span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setPayOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-5 w-5" />
                {t('validate_sale')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ----- Modale de paiement ----- */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl">
            {done ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground animate-success-pop">
                  <Check className="h-8 w-8" />
                </span>
                <p className="mt-4 font-heading text-lg font-bold text-foreground">
                  {t('sale_completed')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatMRU(cartTotal)} {t('mru')} · {activeName}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {t('payment')}
                  </h3>
                  <button type="button" onClick={() => setPayOpen(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="mb-4 rounded-2xl bg-muted/60 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('total')}</p>
                  <p className="font-heading text-3xl font-extrabold tabular-nums text-foreground">
                    {formatMRU(cartTotal)}{' '}
                    <span className="text-base text-muted-foreground">{t('mru')}</span>
                  </p>
                </div>

                {/* Méthodes de paiement */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={cn(
                        'rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors',
                        method === m
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {t(`pay_${m}`)}
                    </button>
                  ))}
                </div>

                {/* Montant reçu + monnaie (espèces) */}
                {method === 'especes' && (
                  <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      {t('cash_received')}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={received}
                      onChange={(e) => setReceived(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-bold tabular-nums text-foreground outline-none focus:border-brand"
                    />
                    {received_n > 0 && (
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">
                          {remaining > 0 ? t('remaining') : t('change')}
                        </span>
                        <span className="font-heading font-bold tabular-nums text-foreground">
                          {formatMRU(remaining > 0 ? remaining : change)} {t('mru')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={validateSale}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  <Check className="h-5 w-5" />
                  {t('validate_sale')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
