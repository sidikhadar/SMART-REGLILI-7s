'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LogoutDialog } from '@/components/logout-dialog'
import { cn } from '@/lib/utils'
import {
  Sun,
  Moon,
  Store,
  Phone,
  MapPin,
  Bell,
  CalendarClock,
  HandCoins,
  Package,
  Check,
  LogOut,
  ArrowLeftRight,
  Palette,
  User,
} from 'lucide-react'

export default function SettingsPage() {
  const { t, dir, role, userName, switchRole, logout } = useApp()
  const router = useRouter()

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [shopName, setShopName] = useState('SMART REGLILI')
  const [shopPhone, setShopPhone] = useState('37 16 20 07')
  const [shopAddress, setShopAddress] = useState('Nouakchott, Mauritanie')
  const [notif, setNotif] = useState({ stock: true, expiry: true, debt: false })
  const [saved, setSaved] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  // Thème : préférence UI, appliquée sur <html> et persistée
  useEffect(() => {
    const stored = localStorage.getItem('sr_theme') as 'light' | 'dark' | null
    const initial =
      stored ??
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  function applyTheme(next: 'light' | 'dark') {
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('sr_theme', next)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    setLogoutOpen(false)
    logout()
    router.push('/')
  }

  const notifRows: { key: keyof typeof notif; label: string; icon: typeof Package }[] = [
    { key: 'stock', label: t('set_notif_stock'), icon: Package },
    { key: 'expiry', label: t('set_notif_expiry'), icon: CalendarClock },
    { key: 'debt', label: t('set_notif_debt'), icon: HandCoins },
  ]

  return (
    <AppShell title={t('settings')}>
      <div className="space-y-4">
        {/* Apparence */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Palette className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_appearance')}
            </h2>
          </div>

          {/* Thème */}
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {t('set_theme')}
          </p>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {(
              [
                { key: 'light', label: t('set_theme_light'), icon: Sun },
                { key: 'dark', label: t('set_theme_dark'), icon: Moon },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => applyTheme(opt.key)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Langue */}
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {t('set_language_label')}
          </p>
          <LanguageSwitcher className="w-full justify-center" />
        </section>

        {/* Informations du commerce */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Store className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_business')}
            </h2>
          </div>

          <div className="space-y-3" dir={dir}>
            <Field
              icon={Store}
              label={t('set_shop_name')}
              value={shopName}
              onChange={setShopName}
            />
            <Field
              icon={Phone}
              label={t('set_shop_phone')}
              value={shopPhone}
              onChange={setShopPhone}
              inputMode="tel"
            />
            <Field
              icon={MapPin}
              label={t('set_shop_address')}
              value={shopAddress}
              onChange={setShopAddress}
            />
          </div>

          <button
            type="button"
            onClick={save}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold shadow-soft transition-all active:scale-[0.99]',
              saved
                ? 'bg-brand/15 text-brand'
                : 'bg-brand text-brand-foreground hover:brightness-110',
            )}
          >
            <Check className="h-5 w-5" />
            {saved ? t('set_saved') : t('set_save')}
          </button>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_notifications')}
            </h2>
          </div>

          <ul className="space-y-1">
            {notifRows.map((row) => {
              const Icon = row.icon
              const on = notif[row.key]
              return (
                <li
                  key={row.key}
                  className="flex items-center justify-between gap-3 rounded-2xl px-1 py-2.5"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {row.label}
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={row.label}
                    onClick={() =>
                      setNotif((prev) => ({ ...prev, [row.key]: !prev[row.key] }))
                    }
                    className={cn(
                      'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                      on ? 'bg-brand' : 'bg-muted-foreground/30',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
                        on ? 'start-6' : 'start-1',
                      )}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Compte */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
              <User className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_account')}
            </h2>
          </div>

          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-base font-bold text-brand-foreground">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {role === 'caissier' ? t('role_caissier') : t('role_patron')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={switchRole}
            className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeftRight className="h-5 w-5" />
            {t('switch_role')}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 flip-rtl" />
            {t('logout')}
          </button>
        </section>
      </div>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </AppShell>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  inputMode,
}: {
  icon: typeof Store
  label: string
  value: string
  onChange: (v: string) => void
  inputMode?: 'tel' | 'text'
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 focus-within:border-brand">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full bg-transparent py-2.5 text-base text-foreground outline-none"
        />
      </span>
    </label>
  )
}
