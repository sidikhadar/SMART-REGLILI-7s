'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  LogIn,
  UserPlus,
  Package,
  BarChart3,
  ShoppingCart,
  ShieldCheck,
  Headphones,
  Globe,
  Check,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { LANGS } from '@/lib/i18n'
import { BrandLogoFull } from '@/components/brand-logo'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { t, lang, setLang, login, dir } = useApp()
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<Role | null>('patron')
  const [showPassword, setShowPassword] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [remember, setRemember] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    login(role)
    router.push(role === 'patron' ? '/dashboard' : '/caisse')
  }

  return (
    <main dir={dir} className="flex min-h-dvh items-center justify-center bg-[#05070f] p-3 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-card shadow-2xl">
        {/* ---------- HEADER NAVY + ARCHE CONCAVE ---------- */}
        <header className="relative bg-navy px-6 pb-16 pt-6 text-navy-foreground">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-navy-foreground/70">
                <Globe className="h-3.5 w-3.5" aria-hidden />
                <span>
                  Langue /{' '}
                  <span
                    style={{
                      fontFamily:
                        'var(--font-arabic), "Noto Sans Arabic", "Geeza Pro", "Segoe UI", Tahoma, sans-serif',
                    }}
                  >
                    اللغة
                  </span>{' '}
                  / Language
                </span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    aria-pressed={lang === l.code}
                    aria-label={l.label}
                    className={cn(
                      'flex h-10 w-12 items-center justify-center rounded-lg text-xl transition-all',
                      lang === l.code
                        ? 'bg-navy-foreground/15 ring-2 ring-brand'
                        : 'bg-navy-foreground/5 ring-1 ring-navy-foreground/10 hover:bg-navy-foreground/10',
                    )}
                  >
                    <span aria-hidden>{l.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 rounded-full bg-navy-foreground/10 px-3 py-2 text-sm font-medium ring-1 ring-navy-foreground/15 transition-colors hover:bg-navy-foreground/20"
            >
              <HelpCircle className="h-4 w-4" aria-hidden />
              {t('help')}
            </button>
          </div>

          {/* Vague douce : courbe montante/descendante, le blanc remonte au centre
              pour laisser de la place au logo (le navy ne coupe pas le logo) */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-card"
            viewBox="0 0 500 64"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0,64 L500,64 L500,34 C400,30 345,12 250,12 C155,12 100,30 0,34 Z"
              fill="currentColor"
            />
          </svg>
        </header>

        {/* ---------- LOGO (posé dans le blanc, non coupé) ---------- */}
        <div className="-mt-6 px-6">
          <BrandLogoFull className="max-w-[280px]" />
        </div>

        {/* ---------- PASTILLES FONCTIONNALITÉS ---------- */}
        <div className="mt-1 flex items-center justify-center gap-3 px-6 text-sm font-medium text-navy">
          <span className="flex items-center gap-1.5">
            <Package className="h-4 w-4 text-navy" aria-hidden />
            {t('feat_stock')}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-brand" aria-hidden />
            {t('feat_reports')}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-navy" aria-hidden />
            {t('feat_commerce')}
          </span>
        </div>

        {/* ---------- FORMULAIRE ---------- */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-2 pt-6">
          {mode === 'signup' && (
            <Field icon={<User className="h-5 w-5" />}>
              <input
                type="text"
                required
                dir={dir}
                placeholder={t('full_name')}
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}

          <Field icon={<User className="h-5 w-5" />}>
            <input
              type="text"
              required
              dir={dir}
              placeholder={t('email')}
              autoComplete="username"
              className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field icon={<Lock className="h-5 w-5" />}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              dir={dir}
              placeholder={t('password')}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </Field>

          {mode === 'signup' && (
            <Field icon={<Lock className="h-5 w-5" />}>
              <input
                type="password"
                required
                dir={dir}
                placeholder={t('confirm_password')}
                autoComplete="new-password"
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}

          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  aria-pressed={remember}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                    remember
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-border bg-card',
                  )}
                >
                  {remember && <Check className="h-3.5 w-3.5" />}
                </button>
                {t('remember_me')}
              </label>
              <button type="button" className="text-sm font-medium text-brand hover:underline">
                {t('forgot')}
              </button>
            </div>
          )}

          {/* ---------- CHOIX DU RÔLE ---------- */}
          <Divider label={t('choose_role')} />

          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === 'patron'}
              onClick={() => setRole('patron')}
              img="/role-patron.png"
              title={t('role_patron')}
              desc={t('patron_short')}
            />
            <RoleCard
              active={role === 'caissier'}
              onClick={() => setRole('caissier')}
              img="/role-caissier.png"
              title={t('role_caissier')}
              desc={t('caissier_short')}
            />
          </div>

          {/* ---------- BOUTON PRINCIPAL ---------- */}
          <button
            type="submit"
            disabled={!role}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
                {t('tab_signin')}
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" aria-hidden />
                {t('create_account')}
              </>
            )}
          </button>

          {/* ---------- BASCULE SIGNUP / SIGNIN ---------- */}
          <Divider label={mode === 'signin' ? t('new_here') : t('have_account')} />

          <button
            type="button"
            onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand/40 py-3.5 text-base font-semibold text-brand transition-colors hover:bg-brand/5"
          >
            {mode === 'signin' ? (
              <>
                <UserPlus className="h-5 w-5" aria-hidden />
                {t('create_account')}
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
                {t('tab_signin')}
              </>
            )}
          </button>
        </form>

        {/* ---------- PIED DE PAGE : 3 infos avec icônes ---------- */}
        <div className="mt-5 flex flex-col items-center justify-center gap-3 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
            {t('secure_encrypted')}
          </span>
          <span className="flex items-center gap-1.5">
            <Headphones className="h-4 w-4 text-brand" aria-hidden />
            {t('support_label')} : +222 37 16 20 16
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-brand" aria-hidden />
            {t('contact_label')} : contact@reglili.mr
          </span>
        </div>

        {/* ---------- BARRE NAVY AVEC ARC MONTANT ---------- */}
        <div className="relative">
          <svg
            className="block h-6 w-full text-navy"
            viewBox="0 0 500 24"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0,24 L0,24 Q250,-12 500,24 Z" fill="currentColor" />
          </svg>
          <div className="-mt-px bg-navy px-6 pb-4 pt-1 text-center text-xs text-navy-foreground/85">
            <Lock className="mb-0.5 me-1 inline h-3 w-3" aria-hidden /> © 2025{' '}
            <span className="font-semibold text-brand">SMART REGLILI</span> — {t('footer_rights')}
          </div>
        </div>
      </div>

      {/* ---------- MODAL AIDE ---------- */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <HelpCircle className="h-5 w-5 text-brand" aria-hidden />
                {t('help_title')}
              </h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Fermer"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('help_text')}</p>
            <div className="mt-4 rounded-xl bg-muted p-3 text-sm text-foreground">
              <p className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-brand" aria-hidden /> +222 37 16 20 16
              </p>
              <p className="mt-1 flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand" aria-hidden /> contact@reglili.mr
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------- Sous-composants ---------- */

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-colors focus-within:border-brand">
      <span className="text-brand">{icon}</span>
      {children}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function RoleCard({
  active,
  onClick,
  img,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  img: string
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all',
        active
          ? 'border-brand bg-brand/5 shadow-soft'
          : 'border-border bg-card hover:border-brand/40',
      )}
    >
      {active && (
        <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Check className="h-4 w-4" />
        </span>
      )}
      <span
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl bg-card ring-1 transition-colors',
          active ? 'ring-brand/30' : 'ring-border',
        )}
      >
        <img
          src={img || '/placeholder.svg'}
          alt={title}
          className="h-12 w-12 object-contain mix-blend-multiply"
          crossOrigin="anonymous"
        />
      </span>
      <span className="text-base font-bold uppercase tracking-wide text-foreground">{title}</span>
      <span className="text-xs leading-snug text-muted-foreground">{desc}</span>
    </button>
  )
}
