'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { REGISTERS, DAILY_SALES } from '@/lib/mock-data'
import { formatMRU } from '@/lib/format'
import type { Register } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Plus,
  Store,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Receipt,
} from 'lucide-react'

export default function RegistersPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Register[]>(REGISTERS)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [toDelete, setToDelete] = useState<Register | null>(null)

  // Ventes du jour par caisse (dernier point de l'historique)
  const todaySales = useMemo(() => {
    const last = DAILY_SALES[DAILY_SALES.length - 1]
    const map: Record<string, number> = {}
    items.forEach((r, i) => {
      if (i === 0) map[r.id] = last?.r1 ?? 0
      else if (i === 1) map[r.id] = last?.r2 ?? 0
      else map[r.id] = Math.round(1800 + (i * 740) % 2600)
    })
    return map
  }, [items])

  const txCount = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach((r, i) => {
      map[r.id] = 12 + ((i + 1) * 7) % 19
    })
    return map
  }, [items])

  const totalToday = useMemo(
    () => items.reduce((sum, r) => sum + (todaySales[r.id] ?? 0), 0),
    [items, todaySales],
  )

  function addRegister() {
    const n = name.trim()
    if (!n) return
    setItems((prev) => [...prev, { id: `r-${Date.now()}`, name: n, active: true }])
    setName('')
    setOpen(false)
  }

  function setActive(id: string) {
    setItems((prev) => prev.map((r) => ({ ...r, active: r.id === id })))
  }

  return (
    <AppShell title={t('multi_register')}>
      {/* En-tête : total du jour + bouton ajouter */}
      <div className="mb-4 rounded-3xl border border-brand/25 bg-brand/5 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Store className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {t('reg_today_sales')}
              </p>
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-foreground">
              {formatMRU(totalToday)}{' '}
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
            <span className="hidden sm:inline">{t('reg_add')}</span>
          </button>
        </div>
      </div>

      {/* Note stock partagé */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-navy/20 bg-navy/5 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/15 text-navy">
          <Boxes className="h-5 w-5" />
        </span>
        <p className="text-sm text-foreground">{t('reg_shared_stock')}</p>
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {items.length} {t('reg_count')}
      </p>

      {/* Liste des caisses */}
      <div className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className={cn(
              'rounded-2xl border bg-card p-4 shadow-soft transition-colors',
              r.active ? 'border-brand/40' : 'border-border',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                    r.active ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Store className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{r.name}</p>
                  {r.active && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('reg_current')}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToDelete(r)}
                aria-label={t('reg_remove')}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Stats du jour */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">{t('reg_today_sales')}</p>
                <p className="mt-0.5 font-heading text-base font-bold tabular-nums text-foreground">
                  {formatMRU(todaySales[r.id] ?? 0)} {t('mru')}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Receipt className="h-3.5 w-3.5" />
                  {t('reg_transactions')}
                </p>
                <p className="mt-0.5 font-heading text-base font-bold tabular-nums text-foreground">
                  {txCount[r.id] ?? 0}
                </p>
              </div>
            </div>

            {/* Activation */}
            {!r.active && (
              <button
                type="button"
                onClick={() => setActive(r.id)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('reg_set_active')}
              </button>
            )}
          </div>
        ))}
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
                {t('reg_add')}
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

            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('reg_name')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Caisse 3"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
              autoFocus
            />

            <button
              type="button"
              onClick={addRegister}
              disabled={!name.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setToDelete(null)}
        >
          <div
            dir={dir}
            className="w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 text-center shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-foreground">
              {t('reg_remove')}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{toDelete.name}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-2xl border border-border bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setItems((prev) => {
                    const next = prev.filter((x) => x.id !== toDelete.id)
                    // garantir qu'une caisse reste active
                    if (next.length && !next.some((r) => r.active)) {
                      next[0] = { ...next[0], active: true }
                    }
                    return next
                  })
                  setToDelete(null)
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-destructive py-3 font-semibold text-destructive-foreground transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <Trash2 className="h-5 w-5" />
                {t('reg_remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
