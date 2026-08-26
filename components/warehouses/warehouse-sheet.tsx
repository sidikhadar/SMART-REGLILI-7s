'use client'

import { useState } from 'react'
import { X, Check, Star } from 'lucide-react'
import type { Warehouse } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Formulaire d'ajout / modification d'un entrepôt.
 * Passer `warehouse` pour le mode édition.
 */
export function WarehouseSheet({
  warehouse,
  t,
  dir,
  onClose,
  onSave,
}: {
  warehouse?: Warehouse | null
  t: (k: string) => string
  dir: 'rtl' | 'ltr'
  onClose: () => void
  onSave: (values: { name: string; location: string; main: boolean }) => void
}) {
  const [name, setName] = useState(warehouse?.name ?? '')
  const [location, setLocation] = useState(
    warehouse?.location && warehouse.location !== '—' ? warehouse.location : '',
  )
  const [main, setMain] = useState(warehouse?.main ?? false)

  const canSave = name.trim().length > 0

  function submit() {
    if (!canSave) return
    onSave({ name: name.trim(), location: location.trim(), main })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-extrabold text-foreground">
            {warehouse ? t('wh_edit') : t('wh_add')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t('wh_name')}
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
              {t('wh_location')}
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
          </div>

          {/* Toggle entrepôt principal */}
          <button
            type="button"
            onClick={() => setMain((v) => !v)}
            role="switch"
            aria-checked={main}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors',
              main
                ? 'border-brand/40 bg-brand/5'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                main ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground',
              )}
            >
              <Star className={cn('h-4 w-4', main && 'fill-current')} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {t('wh_is_main')}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t('wh_is_main_hint')}
              </span>
            </span>
            <span
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                main ? 'bg-brand' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-all',
                  main ? 'start-[1.375rem]' : 'start-0.5',
                )}
              />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSave}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          <Check className="h-5 w-5" />
          {t('save')}
        </button>
      </div>
    </div>
  )
}
