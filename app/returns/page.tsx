'use client'

import { useMemo, useState } from 'react'
import {
  RotateCcw,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  Receipt,
  Banknote,
  Wallet,
  X,
  AlertTriangle,
  CalendarClock,
  PackageX,
  ShieldQuestion,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { SALES } from '@/lib/mock-data'
import { formatMRU, formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Sale, SaleItem } from '@/lib/types'

type Reason = 'damaged' | 'expired' | 'wrong' | 'other'
type Refund = 'cash' | 'credit'

interface ReturnRecord {
  id: string
  product: string
  qty: number
  amount: number
  reason: Reason
  refund: Refund
  date: string
}

const REASON_ICON: Record<Reason, typeof AlertTriangle> = {
  damaged: AlertTriangle,
  expired: CalendarClock,
  wrong: PackageX,
  other: ShieldQuestion,
}

export default function ReturnsPage() {
  const { t, dir } = useApp()

  // étape 1 : vente sélectionnée / étape 2 : produit + détails
  const [sale, setSale] = useState<Sale | null>(null)
  const [item, setItem] = useState<SaleItem | null>(null)
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState<Reason | null>(null)
  const [refund, setRefund] = useState<Refund>('cash')
  const [done, setDone] = useState(false)
  const [returns, setReturns] = useState<ReturnRecord[]>([])

  const REASONS: { id: Reason; label: string }[] = [
    { id: 'damaged', label: t('ret_reason_damaged') },
    { id: 'expired', label: t('ret_reason_expired') },
    { id: 'wrong', label: t('ret_reason_wrong') },
    { id: 'other', label: t('ret_reason_other') },
  ]

  const amount = useMemo(
    () => (item ? item.unitPrice * qty : 0),
    [item, qty],
  )

  const canConfirm = !!sale && !!item && qty > 0 && !!reason

  function resetFlow() {
    setSale(null)
    setItem(null)
    setQty(1)
    setReason(null)
    setRefund('cash')
  }

  function selectItem(it: SaleItem) {
    setItem(it)
    setQty(1)
  }

  function confirmReturn() {
    if (!canConfirm || !item) return
    const record: ReturnRecord = {
      id: `ret${Date.now()}`,
      product: item.name,
      qty,
      amount,
      reason: reason!,
      refund,
      date: new Date().toISOString(),
    }
    setReturns((prev) => [record, ...prev])
    setDone(true)
    setTimeout(() => {
      setDone(false)
      resetFlow()
    }, 1500)
  }

  return (
    <AppShell title={t('product_return')}>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* ---------- Étape 1 : choisir une vente ---------- */}
        {!sale && (
          <section>
            <h2 className="mb-2 px-1 font-heading text-sm font-bold text-foreground">
              {t('ret_select_sale')}
            </h2>
            <div className="space-y-2">
              {SALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSale(s)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Receipt className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-sm font-bold text-foreground">
                        #{s.id.toUpperCase()} · {s.register}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(s.date)} · {formatTime(s.date)} · {s.cashier}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {s.items.length} {t('items_count')}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-end">
                    <span className="block font-heading text-base font-extrabold tabular-nums text-foreground">
                      {formatMRU(s.total)}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('mru')}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Étape 2 : produit + détails ---------- */}
        {sale && (
          <section className="space-y-4">
            <button
              type="button"
              onClick={resetFlow}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className={cn('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
              {t('back')}
            </button>

            {/* Produits de la vente */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('ret_choose_product')} · #{sale.id.toUpperCase()}
              </p>
              <div className="space-y-1">
                {sale.items.map((it) => (
                  <button
                    key={it.productId}
                    type="button"
                    onClick={() => selectItem(it)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start transition-colors',
                      item?.productId === it.productId
                        ? 'bg-brand/10 ring-1 ring-brand'
                        : 'hover:bg-muted',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {it.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {it.qty} × {formatMRU(it.unitPrice)} {t('mru')}
                      </span>
                    </span>
                    {item?.productId === it.productId && (
                      <Check className="h-5 w-5 shrink-0 text-brand" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {item && (
              <>
                {/* Quantité retournée */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <p className="mb-3 text-sm font-medium text-foreground">{t('ret_qty')}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl border border-border p-0.5">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                        aria-label={t('minus')}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-heading text-lg font-bold tabular-nums text-foreground">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(item.qty, q + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                        aria-label={t('plus')}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      / {item.qty} {t('items_count')}
                    </span>
                  </div>
                </div>

                {/* Motif du retour */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <p className="mb-3 text-sm font-medium text-foreground">{t('ret_reason')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map((r) => {
                      const Icon = REASON_ICON[r.id]
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setReason(r.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3 py-3 text-start text-sm font-semibold transition-all active:scale-95',
                            reason === r.id
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-border text-foreground hover:bg-muted',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{r.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Type de remboursement */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <p className="mb-3 text-sm font-medium text-foreground">{t('ret_refund')}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRefund('cash')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all active:scale-95',
                        refund === 'cash'
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border text-foreground hover:bg-muted',
                      )}
                    >
                      <Banknote className="h-4 w-4" />
                      {t('ret_refund_cash')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefund('credit')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all active:scale-95',
                        refund === 'credit'
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border text-foreground hover:bg-muted',
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                      {t('ret_refund_credit')}
                    </button>
                  </div>
                </div>

                {/* Récap + confirmation */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('ret_amount_refunded')}
                    </span>
                    <span className="font-heading text-xl font-extrabold tabular-nums text-brand">
                      {formatMRU(amount)}{' '}
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('mru')}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={confirmReturn}
                    disabled={!canConfirm}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {t('ret_confirm')}
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* ---------- Retours récents ---------- */}
        <section>
          <h2 className="mb-2 px-1 font-heading text-sm font-bold text-foreground">
            {t('ret_recent')}
          </h2>
          {returns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <PackageX className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">{t('ret_empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {returns.map((r) => {
                const Icon = REASON_ICON[r.reason]
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {r.product}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {r.qty} {t('items_count')} ·{' '}
                          {r.refund === 'cash'
                            ? t('ret_refund_cash')
                            : t('ret_refund_credit')}{' '}
                          · {formatTime(r.date)}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 font-heading text-base font-bold tabular-nums text-warning">
                      -{formatMRU(r.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Toast de confirmation */}
      {done && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-navy-foreground shadow-xl">
            <Check className="h-5 w-5 text-brand" />
            {t('ret_done')}
          </div>
        </div>
      )}
    </AppShell>
  )
}
