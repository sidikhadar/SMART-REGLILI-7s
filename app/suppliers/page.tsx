'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatMRU } from '@/lib/format'
import { SUPPLIERS } from '@/lib/mock-data'
import type { Supplier } from '@/lib/types'
import { Plus, Truck, X, Check, Phone, HandCoins } from 'lucide-react'
import { PhoneNumber } from '@/components/phone-number'

export default function SuppliersPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Supplier[]>(SUPPLIERS)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [balance, setBalance] = useState('')
  const [payTarget, setPayTarget] = useState<Supplier | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const totalDue = useMemo(
    () => items.reduce((sum, s) => sum + s.balance, 0),
    [items],
  )

  function addSupplier() {
    const n = name.trim()
    if (!n) return
    setItems((prev) => [
      {
        id: `sup-${Date.now()}`,
        name: n,
        phone: phone.trim() || undefined,
        balance: Number(balance) || 0,
      },
      ...prev,
    ])
    setName('')
    setPhone('')
    setBalance('')
    setOpen(false)
  }

  function confirmPay() {
    if (!payTarget) return
    const amt = Number(payAmount) || 0
    setItems((prev) =>
      prev.map((s) =>
        s.id === payTarget.id
          ? { ...s, balance: Math.max(0, s.balance - amt) }
          : s,
      ),
    )
    setPayTarget(null)
    setPayAmount('')
  }

  return (
    <AppShell title={t('suppliers')}>
      {/* Total dû */}
      <div className="mb-4 rounded-3xl border border-destructive/25 bg-destructive/5 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <Truck className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {t('sup_total_due')}
              </p>
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-destructive">
              {formatMRU(totalDue)}{' '}
              <span className="text-base font-medium text-muted-foreground">
                {t('mru')}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('sup_add')}</span>
          </button>
        </div>
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {items.length} {t('sup_count')}
      </p>

      {/* Liste */}
      <div className="space-y-3">
        {items.map((s) => {
          const settled = s.balance <= 0
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{s.name}</p>
                    {s.phone && (
                      <p className="truncate text-sm text-muted-foreground">
                        <PhoneNumber value={s.phone} />
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted-foreground">{t('sup_balance')}</p>
                  <p
                    className={
                      settled
                        ? 'font-heading text-lg font-bold tabular-nums text-brand'
                        : 'font-heading text-lg font-bold tabular-nums text-destructive'
                    }
                  >
                    {settled ? t('sup_settled') : `${formatMRU(s.balance)} ${t('mru')}`}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {s.phone && (
                  <a
                    href={`tel:${s.phone.replace(/\s/g, '')}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    {t('sup_call')}
                  </a>
                )}
                {!settled && (
                  <button
                    type="button"
                    onClick={() => {
                      setPayTarget(s)
                      setPayAmount(String(s.balance))
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.99]"
                  >
                    <HandCoins className="h-4 w-4" />
                    {t('sup_pay')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal ajout */}
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
                {t('sup_add')}
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
                  {t('sup_name')}
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
                  {t('sup_phone')}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="+222 ..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('sup_balance')} ({t('mru')})
                </label>
                <input
                  value={balance}
                  onChange={(e) => setBalance(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addSupplier}
              disabled={!name.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Modal paiement */}
      {payTarget && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setPayTarget(null)}
        >
          <div
            dir={dir}
            className="mt-6 w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {t('sup_pay')}
              </h3>
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-1 text-sm text-muted-foreground">{payTarget.name}</p>
            <p className="mb-4 font-heading text-xl font-extrabold tabular-nums text-destructive">
              {formatMRU(payTarget.balance)} {t('mru')}
            </p>

            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('amount_paid')} ({t('mru')})
            </label>
            <input
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
              autoFocus
            />

            <button
              type="button"
              onClick={confirmPay}
              disabled={!Number(payAmount)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('confirm_payment')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
