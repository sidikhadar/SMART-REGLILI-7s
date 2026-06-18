'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff, LogIn, Check } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    login(role)
    router.push(role === 'patron' ? '/dashboard' : '/caisse')
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
            autoComplete="current-password"
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

        <button
          type="submit"
          disabled={!role}
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
