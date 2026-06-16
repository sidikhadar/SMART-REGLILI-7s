'use client'

import Image from 'next/image'
import { LogIn, UserPlus, HelpCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { LangFlags, AuthFooter } from '@/components/auth/auth-shared'

/**
 * PAGE 1 — Welcome Screen.
 * Le changement de langue se fait uniquement ici et s'applique à toute l'app.
 * Tout tient dans un seul écran sans scroll.
 */
export function WelcomeScreen({
  onLogin,
  onSignup,
  onHelp,
}: {
  onLogin: () => void
  onSignup: () => void
  onHelp: () => void
}) {
  const { t, dir } = useApp()

  return (
    <div dir={dir} className="welcome-reveal flex h-dvh flex-col bg-navy text-navy-foreground">
      {/* Haut : drapeaux + aide */}
      <header className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 sm:px-6">
        <LangFlags />
        <button
          type="button"
          onClick={onHelp}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-medium ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          <HelpCircle className="h-4 w-4" aria-hidden />
          {t('help')}
        </button>
      </header>

      {/* Logo en haut au centre (position d'atterrissage de l'animation) */}
      <div className="flex shrink-0 flex-col items-center px-6 pt-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10 sm:h-24 sm:w-24">
          <Image
            src="/logo-smart-reglili.jpeg"
            alt="SMART REGLILI"
            width={176}
            height={176}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="mt-3 font-display text-2xl font-black tracking-wide sm:text-3xl">
          SMART <span className="text-brand">REGLILI</span>
        </h1>
        <p className="mt-2 max-w-xs text-pretty text-sm text-navy-foreground/70 sm:text-base">
          {t('slogan')}
        </p>
      </div>

      {/* Espace central flexible */}
      <div className="flex-1" />

      {/* Bas : boutons */}
      <div className="shrink-0 px-6 pb-2">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={onLogin}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
            {t('welcome_login')}
          </button>
          <button
            type="button"
            onClick={onSignup}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 text-base font-semibold text-brand transition-colors hover:bg-brand/10 active:scale-[0.99]"
          >
            <UserPlus className="h-5 w-5" aria-hidden />
            {t('welcome_signup')}
          </button>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}
