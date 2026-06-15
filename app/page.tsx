'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { BrandLogo } from '@/components/brand-logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import {
  Crown,
  Store,
  ArrowRight,
  Lock,
  User,
  ShoppingCart,
  BarChart3,
  PackageCheck,
} from 'lucide-react'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { t, login, dir } = useApp()
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    login(role)
    router.push(role === 'caissier' ? '/caisse' : '/dashboard')
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Decorative brand panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42dvh] bg-navy"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-brand/30 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-5 pt-6">
        <span className="font-heading text-sm font-bold text-navy-foreground/90">
          Smart Reglili
        </span>
        <LanguageSwitcher />
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-10 pt-6">
        {/* Logo + slogan */}
        <div className="flex flex-col items-center text-center animate-float-up">
          <BrandLogo size={96} />
          <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">
            <span className="text-navy-foreground">SMART</span>{' '}
            <span className="text-brand-foreground/95 [text-shadow:0_1px_8px_rgba(46,160,87,0.5)]">
              REGLILI
            </span>
          </h1>
          <p className="mt-1 text-sm font-medium text-navy-foreground/70">
            {t('subslogan')}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 w-full rounded-3xl border border-border bg-card p-5 shadow-soft-lg animate-float-up">
          <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">
            {t('choose_role')}
          </p>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === 'patron'}
              onClick={() => setRole('patron')}
              icon={<Crown className="h-6 w-6" />}
              title={t('role_patron')}
              desc={t('patron_desc')}
            />
            <RoleCard
              active={role === 'caissier'}
              onClick={() => setRole('caissier')}
              icon={<Store className="h-6 w-6" />}
              title={t('role_caissier')}
              desc={t('caissier_desc')}
            />
          </div>

          {/* Credentials */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <Field
              icon={<User className="h-4 w-4" />}
              type="text"
              placeholder={t('email')}
              value={identifier}
              onChange={setIdentifier}
              dir={dir}
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder={role === 'caissier' ? t('pin') : t('password')}
              value={secret}
              onChange={setSecret}
              dir={dir}
            />

            <Button
              type="submit"
              disabled={!role}
              className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {t('enter')}
              <ArrowRight className="h-5 w-5 flip-rtl" />
            </Button>
          </form>
        </div>

        {/* Feature pills */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Pill icon={<PackageCheck className="h-4 w-4" />} label={t('stock')} />
          <Pill icon={<BarChart3 className="h-4 w-4" />} label={t('ai_reports')} />
          <Pill icon={<ShoppingCart className="h-4 w-4" />} label={t('caisse')} />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t('slogan')}
        </p>
      </div>
    </main>
  )
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-2 rounded-2xl border p-4 text-start transition-all',
        active
          ? 'border-brand bg-accent shadow-soft ring-2 ring-brand/40'
          : 'border-border bg-card hover:border-brand/40 hover:bg-muted',
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          active ? 'bg-brand text-brand-foreground' : 'bg-muted text-navy',
        )}
      >
        {icon}
      </span>
      <span className="font-heading text-sm font-bold text-foreground">
        {title}
      </span>
      <span className="text-xs leading-snug text-muted-foreground">{desc}</span>
    </button>
  )
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  dir,
}: {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  dir: 'rtl' | 'ltr'
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-muted-foreground">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="h-12 w-full rounded-xl border border-input bg-background ps-11 pe-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
    </div>
  )
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
      <span className="text-brand">{icon}</span>
      {label}
    </span>
  )
}
