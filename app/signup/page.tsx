'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, Phone, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import {
  AuthCard,
  NavyHeader,
  HeaderLogo,
  BackButton,
  FeatureRow,
  AuthFooter,
  Field,
} from '@/components/auth/auth-ui'

export default function SignupPage() {
  const { t, dir } = useApp()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Inscription simulée : on redirige vers la vérification de l'email
    router.push('/verify')
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
            placeholder={t('full_name')}
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field icon={<Store className="h-5 w-5" />}>
          <input
            type="text"
            required
            dir={dir}
            placeholder={t('shop_name')}
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field icon={<Phone className="h-5 w-5" />}>
          <input
            type="tel"
            required
            dir={dir}
            placeholder={t('phone')}
            autoComplete="tel"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field icon={<Mail className="h-5 w-5" />}>
          <input
            type="email"
            required
            dir={dir}
            placeholder={t('email')}
            autoComplete="email"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <Field icon={<Lock className="h-5 w-5" />}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            dir={dir}
            placeholder={t('password')}
            autoComplete="new-password"
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

        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <UserPlus className="h-5 w-5" aria-hidden />
          {t('create_account')}
        </button>
      </form>

      <AuthFooter />
    </AuthCard>
  )
}
