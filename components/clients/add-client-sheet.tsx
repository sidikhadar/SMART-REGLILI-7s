'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import type { Client } from '@/lib/types'

export function AddClientSheet({
  t,
  onClose,
  onSave,
}: {
  t: (k: string) => string
  onClose: () => void
  onSave: (c: Client) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({
      id: `c${Date.now()}`,
      name: trimmed,
      phone: phone.trim() || undefined,
      totalDebt: 0,
    })
  }

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
            <UserPlus className="h-5 w-5 text-brand" />
            {t('new_client')}
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

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
              {t('client_name')}
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
              {t('phone')}
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="+222 ..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
