'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Eye, EyeOff, ArrowLeft, Check, LogIn, AlertCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AuthBrandMini, AuthFooter } from '@/components/auth/auth-shared'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_ATTEMPTS = 5
const LOCK_MS = 5 * 60 * 1000

/** PAGE 2A — Login. Avec sélection de profil et blocage après 5 tentatives. */
export function LoginScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (role: Role) => void
}) {
  const { t, dir, login } = useApp()
  const [role, setRole] = useState<Role | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  // Minuteur de blocage
  useEffect(() => {
    if (!lockUntil) return
    const tick = () => {
      const left = lockUntil - Date.now()
      if (left <= 0) {
        setLockUntil(null)
        setAttempts(0)
        setError('')
        setRemaining(0)
      } else {
        setRemaining(left)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockUntil])

  const locked = lockUntil !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locked || !role) return

    // Simulation : identifiants de démo valides = "admin@reglili.mr" / "123456"
    const valid = email.trim().toLowerCase() === 'admin@reglili.mr' && password === '123456'

    if (valid) {
      login(role)
      onSuccess(role)
      return
    }

    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      setLockUntil(Date.now() + LOCK_MS)
      setError(t('account_locked'))
    } else {
      setError(`${t('invalid_credentials')} — ${MAX_ATTEMPTS - next} ${t('attempts_left')}`)
    }
  }

  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')

  return (
    <div dir={dir} className="animate-slide-in-right flex h-dvh flex-col bg-navy text-navy-foreground">
      {/* En-tête : logo mini + retour (positions inversées en RTL via flex/dir) */}
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
            {t('signin_title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AuthField icon={<User className="h-5 w-5" />}>
              <input
                type="text"
                required
                dir={dir}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')}
                autoComplete="username"
                disabled={locked}
                className="w-full bg-transparent text-base text-navy-foreground outline-none placeholder:text-navy-foreground/50"
              />
            </AuthField>

            <AuthField icon={<Lock className="h-5 w-5" />}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                dir={dir}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                autoComplete="current-password"
                disabled={locked}
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
            </AuthField>

            {/* Message d'erreur rouge visible */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/15 px-3 py-2.5 text-sm font-medium text-destructive ring-1 ring-destructive/30">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {error}
                  {locked && (
                    <span className="ms-1 font-mono font-bold">
                      ({mm}:{ss})
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-navy-foreground/85">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  aria-pressed={remember}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                    remember
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-white/30 bg-transparent',
                  )}
                >
                  {remember && <Check className="h-3.5 w-3.5" />}
                </button>
                {t('remember_me')}
              </label>
              <button type="button" className="font-medium text-brand hover:underline">
                {t('forgot')}
              </button>
            </div>

            <Divider label={t('choose_role')} />

            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                active={role === 'patron'}
                onClick={() => setRole('patron')}
                img="/role-patron-navy.png"
                imgActive="/role-patron.png"
                title={t('role_patron')}
              />
              <RoleCard
                active={role === 'caissier'}
                onClick={() => setRole('caissier')}
                img="/role-caissier.png"
                imgActive="/role-caissier-green.png"
                title={t('role_caissier')}
              />
            </div>

            <button
              type="submit"
              disabled={!role || locked}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
              {t('signin_title')}
            </button>
          </form>
        </div>
      </main>

      <AuthFooter />
    </div>
  )
}

function AuthField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 transition-colors focus-within:border-brand">
      <span className="text-brand">{icon}</span>
      {children}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <span className="h-px flex-1 bg-white/15" />
      <span className="text-xs font-medium text-navy-foreground/60">{label}</span>
      <span className="h-px flex-1 bg-white/15" />
    </div>
  )
}

function RoleCard({
  active,
  onClick,
  img,
  imgActive,
  title,
}: {
  active: boolean
  onClick: () => void
  img: string
  imgActive: string
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all',
        active
          ? 'border-brand bg-brand/10 shadow-soft'
          : 'border-white/15 bg-white/5 hover:border-brand/40',
      )}
    >
      {active && (
        <span className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
        <img
          src={(active ? imgActive : img) || '/placeholder.svg'}
          alt={title}
          className="h-9 w-9 object-contain mix-blend-multiply"
          crossOrigin="anonymous"
        />
      </span>
      <span className="text-sm font-bold uppercase tracking-wide text-navy-foreground">{title}</span>
    </button>
  )
}
