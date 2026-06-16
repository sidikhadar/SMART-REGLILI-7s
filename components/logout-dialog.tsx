'use client'

import { useApp } from '@/lib/app-context'
import { LogOut } from 'lucide-react'

export function LogoutDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const { t, dir } = useApp()

  if (!open) return null

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut className="h-7 w-7 flip-rtl" />
          </span>
          <h2 className="text-lg font-bold text-foreground">{t('logout')}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t('logout_confirm_msg')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
