'use client'

import { useMemo } from 'react'
import {
  X,
  Phone,
  Truck,
  Wallet,
  ShoppingBag,
  History,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import type { Supplier, SupplierTransaction } from '@/lib/types'
import { formatMRU, formatDate, formatTime } from '@/lib/format'
import { PhoneNumber } from '@/components/phone-number'
import { cn } from '@/lib/utils'

export function SupplierDetailSheet({
  supplier,
  transactions,
  t,
  lang,
  dir,
  onClose,
}: {
  supplier: Supplier
  transactions: SupplierTransaction[]
  t: (k: string) => string
  lang: string
  dir: 'rtl' | 'ltr'
  onClose: () => void
}) {
  /** Transactions du fournisseur, du plus récent au plus ancien. */
  const history = useMemo(
    () =>
      transactions
        .filter((tx) => tx.supplierId === supplier.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, supplier.id],
  )

  const totals = useMemo(() => {
    let paid = 0
    let purchased = 0
    for (const tx of history) {
      if (tx.type === 'payment') paid += tx.amount
      else purchased += tx.amount
    }
    return { paid, purchased }
  }, [history])

  const settled = supplier.balance <= 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        dir={dir}
        role="dialog"
        aria-modal="true"
        aria-label={supplier.name}
        className="min-h-dvh w-full max-w-lg animate-slide-in-up bg-card p-5 shadow-soft-lg sm:min-h-0 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Truck className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-lg font-extrabold text-foreground">
                {supplier.name}
              </h2>
              {supplier.phone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <PhoneNumber value={supplier.phone} />
                </p>
              )}
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

        {/* Solde actuel */}
        <div
          className={cn(
            'mb-3 rounded-2xl border p-4',
            settled
              ? 'border-brand/25 bg-brand/5'
              : 'border-destructive/25 bg-destructive/5',
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">
            {t('sup_balance')}
          </p>
          <p
            className={cn(
              'mt-1 font-heading text-2xl font-extrabold tabular-nums',
              settled ? 'text-brand' : 'text-destructive',
            )}
          >
            {settled ? (
              t('sup_settled')
            ) : (
              <>
                {formatMRU(supplier.balance)}{' '}
                <span className="text-sm font-medium text-muted-foreground">
                  {t('mru')}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Cumuls */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-brand">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">{t('sup_total_paid')}</p>
            <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
              {formatMRU(totals.paid)}
              <span className="ms-1 text-xs font-medium text-muted-foreground">
                {t('mru')}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-navy/10 text-navy">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sup_total_purchased')}
            </p>
            <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
              {formatMRU(totals.purchased)}
              <span className="ms-1 text-xs font-medium text-muted-foreground">
                {t('mru')}
              </span>
            </p>
          </div>
        </div>

        {/* Historique */}
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          {t('sup_history')}
        </h3>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <History className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('sup_no_transactions')}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map((tx) => {
              const isPayment = tx.type === 'payment'
              // Solde avant l'opération, reconstitué depuis balanceAfter.
              const balanceBefore = isPayment
                ? tx.balanceAfter + tx.amount
                : tx.balanceAfter - tx.amount

              return (
                <li
                  key={tx.id}
                  className="rounded-2xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          isPayment
                            ? 'bg-brand/10 text-brand'
                            : 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {isPayment ? (
                          <ArrowUpRight className="h-4 w-4 flip-rtl" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 flip-rtl" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {isPayment ? t('sup_tx_payment') : t('sup_tx_purchase')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.date, lang)} · {formatTime(tx.date, lang)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        'shrink-0 font-heading font-bold tabular-nums',
                        isPayment ? 'text-brand' : 'text-destructive',
                      )}
                    >
                      {isPayment ? '−' : '+'}
                      {formatMRU(tx.amount)}
                    </p>
                  </div>

                  {/* Solde avant / après */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                    <span className="text-muted-foreground">
                      {t('sup_balance_before')}{' '}
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatMRU(Math.max(0, balanceBefore))}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {t('sup_balance_after')}{' '}
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatMRU(tx.balanceAfter)}
                      </span>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
