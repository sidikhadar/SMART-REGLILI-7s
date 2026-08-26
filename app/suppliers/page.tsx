'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { formatMRU } from '@/lib/format'
import { SUPPLIERS, SUPPLIER_TRANSACTIONS } from '@/lib/mock-data'
import type { Supplier, SupplierTransaction } from '@/lib/types'
import {
  Plus,
  Truck,
  X,
  Check,
  Phone,
  HandCoins,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { PhoneNumber } from '@/components/phone-number'
import { SupplierDetailSheet } from '@/components/suppliers/supplier-detail-sheet'
import { cn } from '@/lib/utils'

export default function SuppliersPage() {
  const { t, dir, lang } = useApp()

  const [items, setItems] = useState<Supplier[]>(SUPPLIERS)
  const [txs, setTxs] = useState<SupplierTransaction[]>(SUPPLIER_TRANSACTIONS)
  const [query, setQuery] = useState('')

  // Formulaire ajout / modification
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [balance, setBalance] = useState('')

  // Paiement, suppression, détail, menu contextuel
  const [payTarget, setPayTarget] = useState<Supplier | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  const totalDue = useMemo(
    () => items.reduce((sum, s) => sum + s.balance, 0),
    [items],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) => s.name.toLowerCase().includes(q))
  }, [items, query])

  const detail = items.find((s) => s.id === detailId) ?? null

  function openAdd() {
    setEditing(null)
    setName('')
    setPhone('')
    setBalance('')
    setFormOpen(true)
  }

  function openEdit(s: Supplier) {
    setMenuId(null)
    setEditing(s)
    setName(s.name)
    setPhone(s.phone ?? '')
    setBalance(String(s.balance))
    setFormOpen(true)
  }

  function submitForm() {
    const n = name.trim()
    if (!n) return
    const bal = Number(balance) || 0

    if (editing) {
      setItems((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, name: n, phone: phone.trim() || undefined, balance: bal }
            : s,
        ),
      )
    } else {
      setItems((prev) => [
        {
          id: `sup-${Date.now()}`,
          name: n,
          phone: phone.trim() || undefined,
          balance: bal,
        },
        ...prev,
      ])
    }
    setFormOpen(false)
    setEditing(null)
  }

  function confirmPay() {
    if (!payTarget) return
    const amt = Number(payAmount) || 0
    if (amt <= 0) return

    const after = Math.max(0, payTarget.balance - amt)

    setItems((prev) =>
      prev.map((s) => (s.id === payTarget.id ? { ...s, balance: after } : s)),
    )
    // Le règlement est tracé dans l'historique du fournisseur.
    setTxs((prev) => [
      {
        id: `stx-${Date.now()}`,
        supplierId: payTarget.id,
        type: 'payment',
        amount: Math.min(amt, payTarget.balance),
        date: new Date().toISOString(),
        balanceAfter: after,
      },
      ...prev,
    ])
    setPayTarget(null)
    setPayAmount('')
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setTxs((prev) => prev.filter((tx) => tx.supplierId !== deleteTarget.id))
    setDeleteTarget(null)
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
            onClick={openAdd}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('sup_add')}</span>
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('sup_search')}
          aria-label={t('sup_search')}
          className="w-full bg-transparent py-1 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t('close')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {filtered.length} {t('sup_count')}
      </p>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Truck className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('sup_empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const settled = s.balance <= 0
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-2">
                  {/* Zone cliquable → historique */}
                  <button
                    type="button"
                    onClick={() => setDetailId(s.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-start transition-opacity active:opacity-70"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                      <Truck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {s.name}
                      </p>
                      {s.phone && (
                        <p className="truncate text-sm text-muted-foreground">
                          <PhoneNumber value={s.phone} />
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-xs text-muted-foreground">
                        {t('sup_balance')}
                      </p>
                      <p
                        className={cn(
                          'font-heading text-lg font-bold tabular-nums',
                          settled ? 'text-brand' : 'text-destructive',
                        )}
                      >
                        {settled
                          ? t('sup_settled')
                          : `${formatMRU(s.balance)} ${t('mru')}`}
                      </p>
                    </div>
                    <ChevronRight className="mt-4 h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                  </button>

                  {/* Menu contextuel */}
                  <SupplierMenu
                    open={menuId === s.id}
                    onToggle={() => setMenuId(menuId === s.id ? null : s.id)}
                    onClose={() => setMenuId(null)}
                    onEdit={() => openEdit(s)}
                    onDelete={() => {
                      setMenuId(null)
                      setDeleteTarget(s)
                    }}
                    t={t}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  {s.phone && (
                    <a
                      href={`tel:${s.phone.replace(/\s/g, '')}`}
                      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:bg-muted"
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
                      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.99]"
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
      )}

      {/* Modal ajout / modification */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setFormOpen(false)}
        >
          <div
            dir={dir}
            role="dialog"
            aria-modal="true"
            className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {editing ? t('sup_edit') : t('sup_add')}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label={t('close')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sup-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t('sup_name')}
                </label>
                <input
                  id="sup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="sup-phone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t('sup_phone')}
                </label>
                <input
                  id="sup-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="+222 ..."
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="sup-balance"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  {t('sup_balance')} ({t('mru')})
                </label>
                <input
                  id="sup-balance"
                  value={balance}
                  onChange={(e) =>
                    setBalance(e.target.value.replace(/[^\d]/g, ''))
                  }
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={submitForm}
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
            role="dialog"
            aria-modal="true"
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-1 text-sm text-muted-foreground">
              {payTarget.name}
            </p>
            <p className="mb-4 font-heading text-xl font-extrabold tabular-nums text-destructive">
              {formatMRU(payTarget.balance)} {t('mru')}
            </p>

            <label
              htmlFor="sup-pay-amount"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t('amount_paid')} ({t('mru')})
            </label>
            <input
              id="sup-pay-amount"
              value={payAmount}
              onChange={(e) =>
                setPayAmount(e.target.value.replace(/[^\d]/g, ''))
              }
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

      {/* Confirmation de suppression */}
      {deleteTarget && (
        <div
          dir={dir}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm animate-float-up rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="h-7 w-7" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                {t('sup_delete')}
              </h2>
              <p className="mt-1.5 text-sm font-semibold text-foreground">
                {deleteTarget.name}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t('sup_delete_msg')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-11 flex-1 rounded-xl bg-muted text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="min-h-11 flex-1 rounded-xl bg-destructive text-sm font-semibold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historique du fournisseur */}
      {detail && (
        <SupplierDetailSheet
          supplier={detail}
          transactions={txs}
          t={t}
          lang={lang}
          dir={dir}
          onClose={() => setDetailId(null)}
        />
      )}
    </AppShell>
  )
}

/** Menu « ⋯ » d'une carte fournisseur (Modifier / Supprimer). */
function SupplierMenu({
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
          className="absolute end-0 top-12 z-20 w-44 animate-float-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onEdit}
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-start text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            {t('sup_edit')}
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
