'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LogoutDialog } from '@/components/logout-dialog'
import { SwitchRoleDialog } from '@/components/switch-role-dialog'
import { cn } from '@/lib/utils'
import {
  Sun,
  Moon,
  Store,
  Phone,
  Bell,
  CalendarClock,
  HandCoins,
  Package,
  Check,
  LogOut,
  ArrowLeftRight,
  Palette,
  User,
  Mail,
  Camera,
  Lock,
  Eye,
  EyeOff,
  X,
  Info,
  Scale,
  LifeBuoy,
  ScanLine,
  ChevronRight,
} from 'lucide-react'

export default function SettingsPage() {
  const { t, dir, role, userName } = useApp()
  const router = useRouter()

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fullName, setFullName] = useState(userName || 'Sidi Mohamed')
  const [shopName, setShopName] = useState('SMART REGLILI')
  const [shopPhone, setShopPhone] = useState('37 16 20 07')
  const [email, setEmail] = useState('contact@reglili.com')
  const [photo, setPhoto] = useState<string | null>(null)
  const [notif, setNotif] = useState({ stock: true, expiry: true, debt: false })
  const [saved, setSaved] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Thème : préférence UI, appliquée sur <html> et persistée
  useEffect(() => {
    const stored = localStorage.getItem('sr_theme') as 'light' | 'dark' | null
    const initial =
      stored ??
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  useEffect(() => {
    if (userName) setFullName(userName)
  }, [userName])

  function applyTheme(next: 'light' | 'dark') {
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('sr_theme', next)
  }

  function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    setLogoutOpen(false)
    router.push('/')
  }

  const notifRows: { key: keyof typeof notif; label: string; icon: typeof Package }[] = [
    { key: 'stock', label: t('set_notif_stock'), icon: Package },
    { key: 'expiry', label: t('set_notif_expiry'), icon: CalendarClock },
    { key: 'debt', label: t('set_notif_debt'), icon: HandCoins },
  ]

  return (
    <AppShell title={t('settings')}>
      <div className="mx-auto max-w-md space-y-4">
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

          {/* Photo de profil */}
          <div className="mb-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand text-2xl font-bold text-brand-foreground ring-2 ring-brand/30"
              aria-label={t('set_change_photo')}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo || '/placeholder.svg'}
                  alt={t('set_profile_photo')}
                  className="h-full w-full object-cover"
                />
              ) : (
                fullName.slice(0, 1).toUpperCase()
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-foreground/50 py-1 text-[10px] font-semibold text-background">
                <Camera className="h-3 w-3" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhotoPick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-sm font-semibold text-brand"
            >
              {t('set_change_photo')}
            </button>
          </div>

          <div className="space-y-3" dir={dir}>
            <Field icon={User} label={t('set_full_name')} value={fullName} onChange={setFullName} />
            <Field icon={Store} label={t('set_shop_name')} value={shopName} onChange={setShopName} />
            <Field icon={Phone} label={t('set_shop_phone')} value={shopPhone} onChange={setShopPhone} inputMode="tel" />
            <Field icon={Mail} label={t('set_email')} value={email} onChange={setEmail} inputMode="text" />
          </div>

          <button
            type="button"
            onClick={() => setPwOpen(true)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Lock className="h-5 w-5 text-muted-foreground" />
            {t('set_change_password')}
          </button>

          <button
            type="button"
            onClick={save}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold shadow-soft transition-all active:scale-[0.99]',
              saved ? 'bg-brand/15 text-brand' : 'bg-brand text-brand-foreground hover:brightness-110',
            )}
          >
            <Check className="h-5 w-5" />
            {saved ? t('set_saved') : t('set_save')}
          </button>
        </section>

        {/* Apparence (thème + langue conservés tels quels) */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Palette className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_appearance')}
            </h2>
          </div>

          <p className="mb-2 text-sm font-medium text-muted-foreground">{t('set_theme')}</p>
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

          <p className="mb-2 text-sm font-medium text-muted-foreground">{t('set_language_label')}</p>
          <LanguageSwitcher className="w-full justify-center" />
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
                <li key={row.key} className="flex items-center justify-between gap-3 rounded-2xl px-1 py-2.5">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={row.label}
                    onClick={() => setNotif((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
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

        {/* Caisses (patron uniquement) */}
        {role === 'patron' && (
          <NavCard
            href="/registers"
            icon={ScanLine}
            title={t('set_caisses')}
            desc={t('set_caisses_desc')}
            tone="navy"
          />
        )}

        {/* Sections d'information */}
        <div className="space-y-2">
          <NavCard href="/about" icon={Info} title={t('set_about')} desc={t('set_about_desc')} tone="brand" />
          <NavCard href="/legal/privacy" icon={Scale} title={t('set_legal')} desc={t('set_legal_desc')} tone="navy" />
          <NavCard href="/help" icon={LifeBuoy} title={t('set_help_support')} desc={t('set_help_desc')} tone="brand" />
        </div>

        {/* Sécurité / compte */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Lock className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('set_security')}
            </h2>
          </div>

          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand text-base font-bold text-brand-foreground">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
              ) : (
                fullName.slice(0, 1).toUpperCase()
              )}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-foreground">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {role === 'caissier' ? t('role_caissier') : t('role_patron')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSwitchOpen(true)}
            className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeftRight className="h-5 w-5" />
            {t('switch_role_secure')}
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

        <p className="px-2 pb-2 text-center text-xs leading-relaxed text-muted-foreground">
          {t('about_copyright')}
        </p>
      </div>

      <LogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} />
      <SwitchRoleDialog open={switchOpen} onClose={() => setSwitchOpen(false)} />
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </AppShell>
  )
}

/* ---------- Carte de navigation vers une sous-page ---------- */
function NavCard({
  href,
  icon: Icon,
  title,
  desc,
  tone,
}: {
  href: string
  icon: typeof Info
  title: string
  desc: string
  tone: 'brand' | 'navy'
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft transition-colors hover:bg-muted"
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
          tone === 'brand' ? 'bg-brand/15 text-brand' : 'bg-navy/10 text-navy',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground flip-rtl" />
    </Link>
  )
}

/* ---------- Champ de formulaire ---------- */
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
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</span>
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

/* ---------- Modal changement de mot de passe (simulé) ---------- */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { t, dir } = useApp()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 4) {
      setError(t('code_wrong'))
      return
    }
    if (next !== confirm) {
      setError(t('set_password_mismatch'))
      return
    }
    setError('')
    setDone(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="mt-10 w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
            <Lock className="h-5 w-5 text-brand" />
            {t('set_change_password')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Check className="h-7 w-7" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{t('set_password_changed')}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <PwField label={t('set_current_password')} value={current} onChange={setCurrent} show={show} />
            <PwField label={t('set_new_password')} value={next} onChange={setNext} show={show} />
            <PwField label={t('set_confirm_password')} value={confirm} onChange={setConfirm} show={show} />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {show ? t('close') : t('set_new_password')}
            </button>

            {error && <p className="text-xs font-medium text-destructive">{error}</p>}

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <Check className="h-5 w-5" />
              {t('validate')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function PwField({
  label,
  value,
  onChange,
  show,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none focus:border-brand"
      />
    </label>
  )
}
