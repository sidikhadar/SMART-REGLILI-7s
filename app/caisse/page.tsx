'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  X,
  Check,
  CreditCard,
  User,
  Receipt,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PRODUCTS, CLIENTS } from '@/lib/mock-data'
import { formatMRU, productStock } from '@/lib/format'
import type { PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'

const METHODS: { key: PaymentMethod; labelKey: string }[] = [
  { key: 'especes', labelKey: 'pay_especes' },
  { key: 'bankily', labelKey: 'pay_bankily' },
  { key: 'sedad', labelKey: 'pay_sedad' },
  { key: 'bik', labelKey: 'pay_bik' },
  { key: 'click', labelKey: 'pay_click' },
  { key: 'masrivi', labelKey: 'pay_masrivi' },
  { key: 'bamis', labelKey: 'pay_bamis' },
  { key: 'credit', labelKey: 'pay_credit' },
]

export default function CaissePage() {
  const { t, cart, addToCart, clearCart, cartTotal } = useApp()
  const [query, setQuery] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [done, setDone] = useState(false)

  const products = useMemo(() => {
    const q = query.toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode ? p.barcode.includes(q) : false),
    )
  }, [query])

  const count = cart.reduce((s, i) => s + i.qty, 0)

  function finishSale() {
    setDone(true)
  }

  function newSale() {
    clearCart()
    setDone(false)
    setCheckoutOpen(false)
  }

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* ----- Colonne produits ----- */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t('caisse')}</h1>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('scan_barcode')}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => {
              const qty = productStock(p.lots)
              const out = qty === 0
              return (
                <button
                  key={p.id}
                  disabled={out}
                  onClick={() => addToCart(p)}
                  className={cn(
                    'group flex flex-col rounded-2xl border border-border bg-card p-3 text-start shadow-sm transition-all active:scale-[0.97]',
                    out ? 'opacity-50' : 'hover:border-brand/50 hover:shadow-soft',
                  )}
                >
                  <span className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-foreground">
                    {p.name}
                  </span>
                  <span className="mt-1 text-lg font-bold text-brand">
                    {formatMRU(p.sellPrice)}{' '}
                    <span className="text-xs font-medium text-muted-foreground">{t('mru')}</span>
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 self-start rounded-lg bg-brand/10 px-2 py-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="h-3.5 w-3.5" />
                    {t('add_to_cart')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ----- Panier (colonne fixe desktop) ----- */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card shadow-soft">
            <CartPanel
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>
        </aside>
      </div>

      {/* ----- Barre panier mobile ----- */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 lg:hidden">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-brand px-4 py-3 text-brand-foreground shadow-soft"
          >
            <span className="flex items-center gap-2">
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-navy-foreground">
                  {count}
                </span>
              </span>
              <span className="font-semibold">{count} {t('items')}</span>
            </span>
            <span className="font-bold">{formatMRU(cartTotal)} {t('mru')}</span>
          </button>
        </div>
      )}

      {/* ----- Feuille de paiement ----- */}
      {checkoutOpen && (
        <CheckoutSheet
          onClose={() => setCheckoutOpen(false)}
          onDone={finishSale}
          onNewSale={newSale}
          done={done}
        />
      )}
    </AppShell>
  )
}

function CartPanel({ onCheckout }: { onCheckout: () => void }) {
  const { t, cart, updateQty, removeFromCart, clearCart, cartTotal } = useApp()

  return (
    <div className="flex max-h-[calc(100vh-7rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <ShoppingCart className="h-5 w-5 text-brand" />
          {t('cart')}
        </h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-danger hover:underline"
          >
            {t('clear')}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <ShoppingCart className="h-10 w-10 opacity-30" />
          <p className="text-sm">{t('tap_to_add')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          {cart.map((i) => (
            <div
              key={i.productId}
              className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMRU(i.unitPrice)} × {i.qty} ={' '}
                  <span className="font-semibold text-foreground">
                    {formatMRU(i.unitPrice * i.qty)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQty(i.productId, i.qty - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
                  aria-label="-"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-foreground">
                  {i.qty}
                </span>
                <button
                  onClick={() => updateQty(i.productId, i.qty + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
                  aria-label="+"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(i.productId)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                aria-label={t('clear')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('total')}</span>
            <span className="font-heading text-2xl font-bold text-foreground">
              {formatMRU(cartTotal)}{' '}
              <span className="text-sm font-medium text-muted-foreground">{t('mru')}</span>
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95"
          >
            <CreditCard className="h-5 w-5" />
            {t('checkout')}
          </button>
        </div>
      )}
    </div>
  )
}

function CheckoutSheet({
  onClose,
  onDone,
  onNewSale,
  done,
}: {
  onClose: () => void
  onDone: () => void
  onNewSale: () => void
  done: boolean
}) {
  const { t, cart, cartTotal } = useApp()
  const [method, setMethod] = useState<PaymentMethod>('especes')
  const [received, setReceived] = useState('')
  const [clientId, setClientId] = useState('')

  const receivedNum = Number(received) || 0
  const isCredit = method === 'credit'
  const change = receivedNum - cartTotal
  const remaining = cartTotal - receivedNum

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-soft sm:rounded-3xl">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15">
              <Check className="h-8 w-8 text-brand" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">{t('sale_done')}</h2>
            <p className="text-3xl font-bold text-brand">
              {formatMRU(cartTotal)} <span className="text-base text-muted-foreground">{t('mru')}</span>
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 font-medium text-foreground hover:bg-muted">
                <Receipt className="h-5 w-5" />
                {t('print_receipt')}
              </button>
              <button
                onClick={onNewSale}
                className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-brand-foreground"
              >
                {t('back_to_sale')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">{t('payment_method')}</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label={t('cancel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* total */}
            <div className="mt-3 rounded-xl bg-navy p-4 text-navy-foreground">
              <p className="text-xs opacity-80">{t('total')}</p>
              <p className="font-heading text-3xl font-bold">
                {formatMRU(cartTotal)} <span className="text-base opacity-80">{t('mru')}</span>
              </p>
            </div>

            {/* méthodes */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors',
                    method === m.key
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-background text-muted-foreground hover:border-brand/40',
                  )}
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>

            {/* client (pour crédit) */}
            {isCredit && (
              <div className="mt-4">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {t('select_client')}
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
                >
                  <option value="">{t('no_client')}</option>
                  {CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* montant reçu (espèces) */}
            {method === 'especes' && (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {t('amount_received')}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-lg font-semibold text-foreground outline-none focus:border-brand"
                />
                {receivedNum > 0 && change >= 0 && (
                  <p className="mt-2 flex justify-between rounded-lg bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">
                    <span>{t('change')}</span>
                    <span>{formatMRU(change)} {t('mru')}</span>
                  </p>
                )}
                {receivedNum > 0 && remaining > 0 && (
                  <p className="mt-2 flex justify-between rounded-lg bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">
                    <span>{t('remaining')}</span>
                    <span>{formatMRU(remaining)} {t('mru')}</span>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={onDone}
              disabled={cart.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('confirm')} · {formatMRU(cartTotal)} {t('mru')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
