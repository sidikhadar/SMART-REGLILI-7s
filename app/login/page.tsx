'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff, LogIn, Check, AlertCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 5 * 60
import {
  AuthCard,
  NavyHeader,
  HeaderLogo,
  BackButton,
  FeatureRow,
  AuthFooter,
  Field,
  Divider,
  RoleCard,
  ForgotModal,
} from '@/components/auth/auth-ui'

export default function LoginPage() {
  const { t, login, dir } = useApp()
  const router = useRouter()

  const [role, setRole] = useState<Role | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [remember, setRemember] = useState(true)
  const [emailVal, setEmailVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockLeft, setLockLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const locked = lockLeft > 0

  // Minuteur de blocage
  useEffect(() => {
    if (lockLeft <= 0) return
    timerRef.current = setInterval(() => {
      setLockLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setAttempts(0)
          setError('')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [lockLeft])

  function formatTimer(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role || locked) return

    // Pas encore de backend : tout identifiant non vide est accepté.
    // (La logique de blocage 5 tentatives reste prête pour la vraie API.)
    const ok = emailVal.trim().length > 0 && passwordVal.length > 0
    if (ok) {
      setError('')
      setAttempts(0)
      login(role)
      router.push(role === 'patron' ? '/dashboard' : '/caisse')
      return
    }

    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      setLockLeft(LOCK_SECONDS)
      setError(t('account_locked'))
    } else {
      setError(`${t('login_error')} — ${MAX_ATTEMPTS - next} ${t('attempts_left')}`)
    }
  }

  return (
    <AuthCard>
      <NavyHeader left={<HeaderLogo />} right={<BackButton />} />

      {/* Rangée fonctionnalités directement après le haut */}
      <div className="mt-3">
        <FeatureRow />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-2 pt-6">
        <Field icon={<User className="h-5 w-5" />}>
          <input
            type="text"
            required
            dir={dir}
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            disabled={locked}
            placeholder={t('email')}
            autoComplete="username"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
        </Field>

        <Field icon={<Lock className="h-5 w-5" />}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            dir={dir}
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
            disabled={locked}
            placeholder={t('password')}
            autoComplete="current-password"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
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

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <button
              type="button"
              onClick={() => setRemember((v) => !v)}
              aria-pressed={remember}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                remember ? 'border-brand bg-brand text-brand-foreground' : 'border-border bg-card',
              )}
            >
              {remember && <Check className="h-3.5 w-3.5" />}
            </button>
            {t('remember_me')}
          </label>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm font-medium text-brand hover:underline"
          >
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
            desc={t('patron_short')}
          />
          <RoleCard
            active={role === 'caissier'}
            onClick={() => setRole('caissier')}
            img="/role-caissier.png"
            imgActive="/role-caissier-green.png"
            title={t('role_caissier')}
            desc={t('caissier_short')}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="flex-1">
              <p>{error}</p>
              {locked && (
                <p className="mt-1 font-mono text-base font-bold tabular-nums">
                  {formatTimer(lockLeft)}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!role || locked}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
          {t('tab_signin')}
        </button>
      </form>

      <AuthFooter />

      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}
    </AuthCard>
  )
}
