'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/app-context'
import { ArrowLeftRight, Eye, EyeOff, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SwitchRoleDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t, role, switchRole } = useApp()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)

  // reset state whenever the dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPassword('')
      setShow(false)
      setError(false)
    }
  }, [open])

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const targetLabel =
    role === 'caissier' ? t('switch_to_patron') : t('switch_to_caissier')

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    // Simulated check: any password of 4+ chars is accepted in this UI build.
    if (password.trim().length < 4) {
      setError(true)
      return
    }
    switchRole()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <button
        type="button"
        aria-label={t('cancel')}
        onClick={onClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
      />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-soft ring-1 ring-border">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('cancel')}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ArrowLeftRight className="h-7 w-7" />
          </span>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('switch_role_title')}
          </h2>
          <p className="mt-1 text-sm font-medium text-brand">{targetLabel}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('switch_password_hint')}
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border-2 bg-background px-3 py-2.5 transition-colors',
              error ? 'border-destructive' : 'border-border focus-within:border-brand',
            )}
          >
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              autoFocus
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder={t('password')}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={t('password')}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">
              {t('wrong_password')}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {t('switch_role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
