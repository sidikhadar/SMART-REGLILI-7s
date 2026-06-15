'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { BrandLogoFull } from '@/components/brand-logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Store,
  ArrowRight,
  Lock,
  Mail,
  User,
  HelpCircle,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from 'lucide-react'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { t, login, dir } = useApp()
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<Role | null>(null)
  const [showPwd, setShowPwd] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setTimeout(() => {
      login(role)
      router.push(role === 'caissier' ? '/caisse' : '/dashboard')
    }, 650)
  }

  return (
    <main
      dir={dir}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-background"
    >
      {/* Decorative brand panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38dvh] bg-navy"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-12%] h-72 w-72 rounded-full bg-brand/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-[-12%] h-64 w-64 rounded-full bg-navy-foreground/10 blur-3xl"
      />

      {/* Top bar: help button + language switcher */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          aria-label={t('help')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-foreground/20 bg-navy-foreground/10 text-navy-foreground backdrop-blur-sm transition hover:bg-navy-foreground/20"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-10 pt-3">
        {/* Full logo (titles, subtitles, footer baked into the image) */}
        <div className="w-full animate-float-up">
          <BrandLogoFull className="mx-auto max-w-[260px] drop-shadow-[0_8px_30px_rgba(13,33,55,0.18)]" />
        </div>

        {/* Card */}
        <div className="mt-4 w-full rounded-3xl border border-border bg-card p-5 shadow-soft-lg animate-float-up">
          {/* Tabs */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  mode === m
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(m === 'signin' ? 'tab_signin' : 'tab_signup')}
              </button>
            ))}
          </div>

          <p className="mb-5 text-center text-sm text-muted-foreground text-pretty">
            {t(mode === 'signin' ? 'signin_hint' : 'signup_hint')}
          </p>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === 'caissier'}
              onClick={() => setRole('caissier')}
              icon={<Store className="h-6 w-6" />}
              title={t('role_caissier')}
              desc={t('caissier_desc')}
              accent="navy"
            />
            <RoleCard
              active={role === 'patron'}
              onClick={() => setRole('patron')}
              icon={<ShieldCheck className="h-6 w-6" />}
              title={t('role_patron')}
              desc={t('patron_desc')}
              accent="brand"
            />
          </div>

          {/* Credentials */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === 'signup' && (
              <>
                <Field icon={<User className="h-4 w-4" />} type="text" placeholder={t('full_name')} dir={dir} />
                <Field icon={<Store className="h-4 w-4" />} type="text" placeholder={t('shop_name')} dir={dir} />
              </>
            )}
            <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder={t('email')} dir={dir} />
            <Field
              icon={<Lock className="h-4 w-4" />}
              type={showPwd ? 'text' : 'password'}
              placeholder={t('password')}
              dir={dir}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Hide' : 'Show'}
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {mode === 'signup' && (
              <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder={t('confirm_password')} dir={dir} />
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between px-1 text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="h-4 w-4 rounded border-border accent-brand" />
                  {t('remember_me')}
                </label>
                <button type="button" className="font-medium text-brand hover:underline">
                  {t('forgot')}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={!role || loading}
              className="group h-12 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-soft transition hover:bg-brand/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  ...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {t(mode === 'signin' ? 'enter' : 'create_account')}
                  <ArrowRight className="h-5 w-5 flip-rtl transition group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="w-full pt-1 text-center text-sm text-muted-foreground"
            >
              {t(mode === 'signin' ? 'no_account' : 'have_account')}{' '}
              <span className="font-semibold text-brand hover:underline">
                {t(mode === 'signin' ? 'tab_signup' : 'tab_signin')}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t('slogan')}
        </p>
      </div>

      {/* Help dialog */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft-lg animate-float-up">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-brand">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <h2 className="font-heading text-lg font-bold text-foreground">{t('help_title')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{t('help_text')}</p>
            <Button
              onClick={() => setShowHelp(false)}
              className="mt-5 h-11 w-full rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
  accent,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
  accent: 'brand' | 'navy'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border p-4 text-start transition-all duration-200',
        active
          ? 'border-brand bg-accent shadow-soft ring-2 ring-brand/40 -translate-y-0.5'
          : 'border-border bg-card hover:border-brand/40 hover:bg-muted hover:-translate-y-0.5',
      )}
    >
      {/* Glow that appears only on the selected card */}
      {active && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl',
            accent === 'brand' ? 'bg-brand/30' : 'bg-navy/25',
          )}
        />
      )}
      {active && (
        <span className="absolute end-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-soft">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
          active
            ? accent === 'brand'
              ? 'bg-brand text-brand-foreground'
              : 'bg-navy text-navy-foreground'
            : 'bg-muted text-navy',
        )}
      >
        {icon}
      </span>
      <span className="font-heading text-sm font-bold text-foreground">{title}</span>
      <span className="text-xs leading-snug text-muted-foreground">{desc}</span>
    </button>
  )
}

function Field({
  icon,
  trailing,
  dir,
  ...props
}: {
  icon: React.ReactNode
  trailing?: React.ReactNode
  dir: 'rtl' | 'ltr'
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
      <span className="text-muted-foreground">{icon}</span>
      <input
        {...props}
        dir={dir}
        className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      {trailing}
    </div>
  )
}
