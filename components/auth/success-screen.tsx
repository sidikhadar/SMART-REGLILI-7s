'use client'

import { Check, LogIn } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AuthFooter } from '@/components/auth/auth-shared'

/** Page de succès après vérification, avec animation de validation. */
export function SuccessScreen({ onLogin }: { onLogin: () => void }) {
  const { t, dir } = useApp()

  return (
    <div dir={dir} className="animate-slide-in-right flex h-dvh flex-col bg-navy text-navy-foreground">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Badge de validation animé */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="success-ring absolute inset-0 rounded-full bg-brand/30" />
          <span className="animate-success-pop flex h-24 w-24 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-soft-lg">
            <Check className="h-12 w-12" strokeWidth={3} aria-hidden />
          </span>
        </div>

        <h1 className="mt-6 text-balance font-display text-2xl font-black sm:text-3xl">
          {t('success_title')}
        </h1>
        <p className="mt-2 text-pretty text-sm text-navy-foreground/75 sm:text-base">
          {t('success_msg')}
        </p>

        <button
          type="button"
          onClick={onLogin}
          className="mt-8 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
          {t('login_now')}
        </button>
      </main>

      <AuthFooter />
    </div>
  )
}
