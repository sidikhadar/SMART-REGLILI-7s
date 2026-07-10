'use client'

import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import { formatMRU } from '@/lib/format'

export function PaymentModal({
  title,
  amount,
  t,
  onClose,
  onConfirm,
}: {
  title: string
  amount: number
  t: (k: string) => string
  onClose: () => void
  /** montant réglé ; égal à `amount` pour un paiement total */
  onConfirm: (paid: number) => void
}) {
  const [partial, setPartial] = useState('')

  const partialValue = Number(partial) || 0
  const validPartial = partialValue > 0 && partialValue < amount

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-b-3xl bg-card p-5 shadow-soft-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
            <Wallet className="h-5 w-5 text-brand" />
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-background p-4 text-center">
          <p className="text-xs text-muted-foreground">{t('remaining')}</p>
          <p className="font-heading text-2xl font-extrabold tabular-nums text-destructive">
            {formatMRU(amount)}{' '}
            <span className="text-sm font-medium text-muted-foreground">{t('mru')}</span>
          </p>
        </div>

        {/* Paiement total */}
        <button
          type="button"
          onClick={() => onConfirm(amount)}
          className="mb-3 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          {t('pay_full')}
        </button>

        {/* Paiement partiel */}
        <div className="rounded-2xl border border-border bg-background p-3">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {t('partial_payment')}
          </label>
          <div className="flex gap-2">
            <input
              value={partial}
              onChange={(e) => setPartial(e.target.value)}
              inputMode="numeric"
              placeholder={t('amount_paid')}
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => onConfirm(partialValue)}
              disabled={!validPartial}
              className="shrink-0 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              {t('confirm_payment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
