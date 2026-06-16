'use client'

import { useState } from 'react'
import { User, Store, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AuthBrandMini, AuthFooter } from '@/components/auth/auth-shared'

/** PAGE 2B — Inscription. Sans cartes de rôle. */
export function SignupScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void
  onSubmit: () => void
}) {
  const { t, dir } = useApp()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div dir={dir} className="animate-slide-in-right flex h-dvh flex-col bg-navy text-navy-foreground">
      <header className="flex shrink-0 items-center justify-between px-4 pt-4 sm:px-6">
        <AuthBrandMini />
        <button
          type="button"
          onClick={onBack}
          aria-label={t('back')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 flip-rtl" aria-hidden />
        </button>
      </header>

      <main className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-3">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mb-4 text-center font-display text-2xl font-black sm:text-3xl">
            {t('signup_title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <Field icon={<User className="h-5 w-5" />}>
              <input
                type="text"
                required
                dir={dir}
                placeholder={t('full_name')}
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
            </Field>
            <Field icon={<Store className="h-5 w-5" />}>
              <input
                type="text"
                required
                dir={dir}
                placeholder={t('shop_name')}
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
            </Field>
            <Field icon={<Phone className="h-5 w-5" />}>
              <input
                type="tel"
                required
                dir={dir}
                placeholder={t('phone')}
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
            </Field>
            <Field icon={<Mail className="h-5 w-5" />}>
              <input
                type="email"
                required
                dir={dir}
                placeholder={t('email')}
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
            </Field>
            <Field icon={<Lock className="h-5 w-5" />}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                dir={dir}
                placeholder={t('password')}
                autoComplete="new-password"
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
                className="text-navy-foreground/60 transition-colors hover:text-navy-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </Field>

            <button
              type="submit"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <UserPlus className="h-5 w-5" aria-hidden />
              {t('create_account')}
            </button>
          </form>

          {/* Phrase publicitaire */}
          <div className="mt-4 text-center">
            <p className="text-pretty text-xs leading-relaxed text-navy-foreground/70">
              {t('signup_pitch')}
            </p>
            <p className="mt-1.5 text-sm font-bold tracking-wide text-brand">
              {t('subslogan')}
            </p>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  )
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 transition-colors focus-within:border-brand">
      <span className="text-brand">{icon}</span>
      {children}
    </div>
  )
}
