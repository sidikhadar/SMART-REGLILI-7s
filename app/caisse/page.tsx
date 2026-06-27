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
  Banknote,
  Send,
  UserPlus,
  Wallet,
  ChevronLeft,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PRODUCTS, CLIENTS, SALES } from '@/lib/mock-data'
import { formatMRU, productStock } from '@/lib/format'
import { cn } from '@/lib/utils'

// Les 4 modes de paiement demandés
type PayMode = 'especes' | 'transfert' | 'dette' | 'partiel'

const TRANSFER_APPS = [
  { id: 'bankily', label: 'Bankily', color: '#f59e0b' },
  { id: 'sedad', label: 'Sedad', color: '#2563eb' },
  { id: 'bik', label: 'BIK', color: '#059669' },
  { id: 'click', label: 'Click', color: '#0d9488' },
  { id: 'masrivi', label: 'Masrivi', color: '#7c3aed' },
  { id: 'bamis', label: 'Bamis', color: '#15803d' },
] as const

// Le paiement partiel = combinaison de 2 méthodes.
// m1 = montant saisi (1ère méthode), m2 = reste automatique (2ème méthode)
type PartialCombo = 'especes_transfert' | 'especes_dette' | 'transfert_dette'

const PARTIAL_COMBOS: { id: PartialCombo; m1: 'especes' | 'transfert'; m2: 'transfert' | 'dette' }[] = [
  { id: 'especes_transfert', m1: 'especes', m2: 'transfert' },
  { id: 'especes_dette', m1: 'especes', m2: 'dette' },
  { id: 'transfert_dette', m1: 'transfert', m2: 'dette' },
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
  const [mode, setMode] = useState<PayMode | null>(null)
  const [received, setReceived] = useState('')
  const [transferApp, setTransferApp] = useState<string | null>(null)
  const [partialAmount, setPartialAmount] = useState('')
  // combinaison de 2 méthodes pour le paiement partiel
  const [partialCombo, setPartialCombo] = useState<PartialCombo | null>(null)
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')
  const [clientId, setClientId] = useState<string>('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [done, setDone] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const PAY_MODES: { id: PayMode; label: string; icon: typeof Banknote }[] = [
    { id: 'especes', label: t('pay_mode_especes'), icon: Banknote },
    { id: 'transfert', label: t('pay_mode_transfert'), icon: Send },
    { id: 'dette', label: t('pay_mode_dette'), icon: UserPlus },
    { id: 'partiel', label: t('pay_mode_partiel'), icon: Wallet },
  ]

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

  // Les 2 produits les plus vendus (raccourcis affichés sur la caisse)
  const topProducts = useMemo(() => {
    const qtyByProduct = new Map<string, number>()
    SALES.forEach((s) =>
      s.items.forEach((it) => {
        qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) || 0) + it.qty)
      }),
    )
    return [...qtyByProduct.entries()]
      .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
      .filter((x): x is { product: (typeof PRODUCTS)[number]; qty: number } => !!x.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 2)
      .map((x) => x.product)
  }, [])

  function handleAdd(productId: string) {
    const p = PRODUCTS.find((x) => x.id === productId)
    if (!p) return
    addToCart(p) // incrémente automatiquement si déjà présent (quantité initialisée à 1)
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

  // Paiement partiel : montant de la 1ère méthode (saisi) + reste = 2ème méthode
  const partial_n = Math.min(Number(partialAmount) || 0, cartTotal)
  const partialRemaining = Math.max(0, cartTotal - partial_n)
  const comboCfg = PARTIAL_COMBOS.find((c) => c.id === partialCombo)
  const partialHasTransfert = comboCfg?.m1 === 'transfert' || comboCfg?.m2 === 'transfert'
  const partialHasDette = comboCfg?.m2 === 'dette'
  const hasClient =
    clientMode === 'existing' ? !!clientId : newClientName.trim().length > 0

  // Le bouton Confirmer est-il actif selon le mode choisi ?
  const canConfirm = (() => {
    if (cart.length === 0) return false
    switch (mode) {
      case 'especes':
        return received_n >= cartTotal
      case 'transfert':
        return !!transferApp
      case 'dette':
        return hasClient
      case 'partiel':
        if (!comboCfg) return false
        // les 2 parts doivent être > 0 (vraie répartition entre 2 méthodes)
        if (!(partial_n > 0 && partialRemaining > 0)) return false
        if (partialHasTransfert && !transferApp) return false
        if (partialHasDette && !hasClient) return false
        return true
      default:
        return false
    }
  })()

  function openPay() {
    setMode(null)
    setReceived('')
    setTransferApp(null)
    setPartialAmount('')
    setPartialCombo(null)
    setClientMode('existing')
    setClientId('')
    setNewClientName('')
    setNewClientPhone('')
    setPayOpen(true)
  }

  function validateSale() {
    if (!canConfirm) return
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setPayOpen(false)
      clearCart()
    }, 1400)
  }

  function methodLabel(m: 'especes' | 'transfert' | 'dette') {
    return t(`pay_mode_${m}`)
  }

  // Sélecteur d'application de transfert (réutilisé en mode Transfert et Partiel)
  function renderTransferApps() {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t('choose_app')}</p>
        <div className="grid grid-cols-3 gap-2">
          {TRANSFER_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => setTransferApp(app.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all active:scale-95',
                transferApp === app.id
                  ? 'border-brand bg-brand/10'
                  : 'border-border hover:bg-muted',
              )}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold text-white"
                style={{ backgroundColor: app.color }}
              >
                {app.label.charAt(0)}
              </span>
              <span className="text-xs font-semibold text-foreground">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Sélecteur de client (réutilisé en mode Dette et Partiel avec dette)
  function renderClientPicker() {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setClientMode('existing')}
            className={cn(
              'flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors',
              clientMode === 'existing'
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {t('existing_client')}
          </button>
          <button
            type="button"
            onClick={() => setClientMode('new')}
            className={cn(
              'flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors',
              clientMode === 'new'
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {t('new_client')}
          </button>
        </div>

        {clientMode === 'existing' ? (
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border p-1">
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setClientId(c.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors',
                  clientId === c.id ? 'bg-brand/10 text-brand' : 'hover:bg-muted',
                )}
              >
                <span className="font-medium text-foreground">{c.name}</span>
                {clientId === c.id && <Check className="h-4 w-4 text-brand" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder={t('client_name')}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
            <input
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              inputMode="tel"
              placeholder={t('client_phone')}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
          </div>
        )}
      </div>
    )
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

          {/* Raccourcis : 2 top produits uniquement (un clic l'ajoute au panier) */}
          {!query && (
            <div className="grid grid-cols-2 gap-2">
              {topProducts.map((p) => (
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
                onClick={openPay}
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

                {/* Étape 1 : choix du mode (4 options) */}
                {!mode && (
                  <div className="grid grid-cols-2 gap-3">
                    {PAY_MODES.map((m) => {
                      const Icon = m.icon
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMode(m.id)}
                          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-5 text-center shadow-soft transition-all hover:border-brand hover:bg-brand/5 active:scale-95"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <Icon className="h-6 w-6" />
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {m.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Étape 2 : écran dédié selon le mode */}
                {mode && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setMode(null)}
                      className="mb-3 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4 flip-rtl" />
                      {t('back')}
                    </button>

                    {/* --- Espèces --- */}
                    {mode === 'especes' && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          {t('cash_received')}
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          autoFocus
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

                    {/* --- Transfert : choix de l'application --- */}
                    {mode === 'transfert' && renderTransferApps()}

                    {/* --- Dette : sélection client (montant total en dette) --- */}
                    {mode === 'dette' && renderClientPicker()}

                    {/* --- Partiel : combinaison de 2 méthodes de paiement --- */}
                    {mode === 'partiel' && (
                      <div className="space-y-3">
                        {/* Choix de la combinaison */}
                        <div className="grid grid-cols-1 gap-2">
                          {PARTIAL_COMBOS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setPartialCombo(c.id)
                                setPartialAmount('')
                                setTransferApp(null)
                                setClientId('')
                                setNewClientName('')
                                setNewClientPhone('')
                              }}
                              className={cn(
                                'rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                                partialCombo === c.id
                                  ? 'border-brand bg-brand/10 text-brand'
                                  : 'border-border text-muted-foreground hover:bg-muted',
                              )}
                            >
                              {methodLabel(c.m1)} + {methodLabel(c.m2)}
                            </button>
                          ))}
                        </div>

                        {comboCfg && (
                          <>
                            {/* Montant de la 1ère méthode */}
                            <div>
                              <label className="mb-1 block text-sm font-medium text-foreground">
                                {t('amount')} — {methodLabel(comboCfg.m1)}
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={partialAmount}
                                onChange={(e) => setPartialAmount(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-bold tabular-nums text-foreground outline-none focus:border-brand"
                              />
                              {/* Reste = 2ème méthode */}
                              <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2 text-sm">
                                <span className="text-muted-foreground">
                                  {comboCfg.m2 === 'dette'
                                    ? t('recorded_as_debt')
                                    : methodLabel(comboCfg.m2)}
                                </span>
                                <span
                                  className={cn(
                                    'font-heading font-bold tabular-nums',
                                    comboCfg.m2 === 'dette'
                                      ? 'text-destructive'
                                      : 'text-foreground',
                                  )}
                                >
                                  {formatMRU(partialRemaining)} {t('mru')}
                                </span>
                              </div>
                            </div>

                            {/* App de transfert si la combinaison inclut un transfert */}
                            {partialHasTransfert && renderTransferApps()}

                            {/* Sélection client si la combinaison inclut une dette */}
                            {partialHasDette && renderClientPicker()}
                          </>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={validateSale}
                      disabled={!canConfirm}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />
                      {t('confirm')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
