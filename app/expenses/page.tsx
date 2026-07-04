'use client'

import { useMemo, useState } from 'react'
import { Plus, Receipt, X, Check, Trash2, TrendingDown } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { EXPENSES } from '@/lib/mock-data'
import type { Expense } from '@/lib/types'
import { formatMRU, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const CAT_COLORS: Record<string, string> = {
  Loyer: 'bg-navy/10 text-navy',
  Charges: 'bg-warning/15 text-warning',
  Logistique: 'bg-brand/10 text-brand',
  Salaires: 'bg-destructive/10 text-destructive',
}

export default function ExpensesPage() {
  const { t, lang, dir } = useApp()
  const [items, setItems] = useState<Expense[]>(EXPENSES)
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Charges')

  const categories = useMemo(
    () => Array.from(new Set(items.map((e) => e.category))),
    [items],
  )

  const total = useMemo(() => items.reduce((s, e) => s + e.amount, 0), [items])

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((e) => e.category === filter)),
    [items, filter],
  )

  function addExpense() {
    const amt = Number(amount)
    if (!label.trim() || !amt) return
    setItems((prev) => [
      {
        id: `e${Date.now()}`,
        label: label.trim(),
        amount: amt,
        category,
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setLabel('')
    setAmount('')
    setCategory('Charges')
    setOpen(false)
  }

  return (
    <AppShell title={t('expenses')}>
      {/* Total du mois */}
      <div className="mb-4 rounded-3xl border border-destructive/25 bg-destructive/5 p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <TrendingDown className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-muted-foreground">
            {t('exp_total_month')}
          </p>
        </div>
        <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-destructive">
          {formatMRU(total)}{' '}
          <span className="text-base font-medium text-muted-foreground">{t('mru')}</span>
        </p>
      </div>

      {/* Filtres catégories */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('exp_all_cats')}
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {/* Liste */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t('exp_recent')}</h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} {t('exp_count')}
        </span>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <Receipt className="mx-auto h-9 w-9 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{t('exp_empty')}</p>
          </div>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    CAT_COLORS[e.category] ?? 'bg-muted text-muted-foreground',
                  )}
                >
                  <Receipt className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.category} · {formatDate(e.date, lang)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-heading font-bold tabular-nums text-destructive">
                  -{formatMRU(e.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== e.id))}
                  aria-label={t('delete')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB ajouter */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 end-4 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-soft-lg transition-transform active:scale-95 lg:bottom-8 lg:end-8"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">{t('exp_add')}</span>
      </button>

      {/* Modal ajout */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            dir={dir}
            className="mt-6 w-full max-w-md rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {t('exp_add')}
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

            <label className="mb-1 block text-sm font-medium text-foreground">
              {t('exp_label')}
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('exp_new_placeholder')}
              className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />

            <label className="mb-1 block text-sm font-medium text-foreground">
              {t('exp_amount')} ({t('mru')})
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />

            <label className="mb-1 block text-sm font-medium text-foreground">
              {t('exp_category')}
            </label>
            <div className="mb-5 flex flex-wrap gap-2">
              {['Loyer', 'Charges', 'Logistique', 'Salaires'].map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Chip>
              ))}
            </div>

            <button
              type="button"
              onClick={addExpense}
              disabled={!label.trim() || !Number(amount)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand bg-brand/10 text-brand'
          : 'border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
