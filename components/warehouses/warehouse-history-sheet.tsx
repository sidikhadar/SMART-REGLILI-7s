'use client'

import { useMemo } from 'react'
import {
  X,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
} from 'lucide-react'
import type { StockMovement } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Style + icône + libellé par type de mouvement. */
const MOVEMENT_META = {
  add: {
    labelKey: 'wh_mv_add',
    icon: Plus,
    sign: '+',
    chip: 'bg-brand/10 text-brand',
  },
  remove: {
    labelKey: 'wh_mv_remove',
    icon: Minus,
    sign: '−',
    chip: 'bg-destructive/10 text-destructive',
  },
  transfer_in: {
    labelKey: 'wh_mv_transfer_in',
    icon: ArrowDownLeft,
    sign: '+',
    chip: 'bg-navy/10 text-navy',
  },
  transfer_out: {
    labelKey: 'wh_mv_transfer_out',
    icon: ArrowUpRight,
    sign: '−',
    chip: 'bg-warning/15 text-warning',
  },
} as const

export function WarehouseHistorySheet({
  warehouseName,
  movements,
  productName,
  t,
  lang,
  dir,
  onClose,
}: {
  warehouseName: string
  movements: StockMovement[]
  productName: (productId: string) => string
  t: (k: string) => string
  lang: string
  dir: 'rtl' | 'ltr'
  onClose: () => void
}) {
  // Plus récent en premier
  const sorted = useMemo(
    () =>
      [...movements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [movements],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="max-h-[100dvh] w-full max-w-lg animate-slide-in-up overflow-y-auto rounded-b-3xl bg-card p-5 shadow-soft-lg sm:mt-6 sm:max-h-[92dvh] sm:rounded-3xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
              <History className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-heading text-lg font-extrabold text-foreground">
                {t('wh_history')}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {warehouseName} · {sorted.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="rounded-xl bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
            {t('wh_history_empty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((m) => {
              const meta = MOVEMENT_META[m.type]
              const Icon = meta.icon
              return (
                <li
                  key={m.id}
                  className="rounded-2xl border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        meta.chip,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {productName(m.productId)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(m.date, lang)} · {formatTime(m.date, lang)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-lg px-2 py-1 font-heading text-sm font-bold tabular-nums',
                        meta.chip,
                      )}
                    >
                      {meta.sign}
                      {m.quantity}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px] font-semibold',
                        meta.chip,
                      )}
                    >
                      {t(meta.labelKey)}
                    </span>
                    {m.note && (
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {m.note}
                      </span>
                    )}
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
