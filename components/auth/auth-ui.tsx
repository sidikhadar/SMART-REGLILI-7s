'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  HelpCircle,
  ArrowLeft,
  Package,
  BarChart3,
  ShoppingCart,
  ShieldCheck,
  Headphones,
  Lock,
  X,
  Check,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { LANGS } from '@/lib/i18n'
import { BrandEmblem } from '@/components/brand-logo'
import { Flag } from '@/components/flag'
import { cn } from '@/lib/utils'

/* ============================================================
   COQUILLE EXTERNE — fond sombre + carte arrondie centrée
   (identique pour les 3 pages d'authentification)
   ============================================================ */
export function AuthCard({ children }: { children: React.ReactNode }) {
  const { dir } = useApp()
  return (
    <main dir={dir} className="flex min-h-dvh items-center justify-center bg-[#05070f] p-3 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-card shadow-2xl">
        {children}
      </div>
    </main>
  )
}

/* ============================================================
   HEADER NAVY + VAGUE CONCAVE
   `left` et `right` permettent de changer le contenu :
   - Welcome : drapeaux (left) + Aide (right)
   - Login / Signup : logo (left) + Retour (right)
   ============================================================ */
export function NavyHeader({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <header className="relative bg-navy px-6 pb-16 pt-6 text-navy-foreground">
      <div className="flex items-start justify-between gap-4">
        {left}
        {right}
      </div>

      {/* Vague douce : le blanc remonte au centre pour accueillir le logo */}
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
  )
}

/* ---- Sélecteur de langue (drapeaux) ---- */
export function LangFlags() {
  const { lang, setLang } = useApp()
  return (
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
              'flex h-10 w-12 items-center justify-center overflow-hidden rounded-lg text-xl transition-all',
              lang === l.code
                ? 'bg-navy-foreground/15 ring-2 ring-brand'
                : 'bg-navy-foreground/5 ring-1 ring-navy-foreground/10 hover:bg-navy-foreground/10',
            )}
          >
            <Flag
              country={l.country}
              emoji={l.flag}
              className="h-5 w-7 rounded-sm object-cover shadow-sm"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---- Bouton Aide (Welcome) ---- */
export function HelpButton({ onClick }: { onClick: () => void }) {
  const { t } = useApp()
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-foreground/10 px-3 py-2 text-sm font-medium ring-1 ring-navy-foreground/15 transition-colors hover:bg-navy-foreground/20"
    >
      <HelpCircle className="h-4 w-4" aria-hidden />
      {t('help')}
    </button>
  )
}

/* ---- Bouton Retour vers Welcome (Login / Signup) ---- */
export function BackButton({ href = '/' }: { href?: string }) {
  const { t } = useApp()
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-foreground/10 px-3 py-2 text-sm font-medium ring-1 ring-navy-foreground/15 transition-colors hover:bg-navy-foreground/20"
    >
      <ArrowLeft className="h-4 w-4 flip-rtl" aria-hidden />
      {t('back')}
    </button>
  )
}

/* ---- Logo dans le header (remplace les drapeaux sur Login / Signup) ---- */
export function HeaderLogo() {
  return (
    <div className="flex items-center gap-3">
      <BrandEmblem size={48} className="rounded-full shadow-soft ring-1 ring-navy-foreground/10" />
      <span className="font-display text-lg font-black tracking-wide text-navy-foreground">
        SMART <span className="text-brand">REGLILI</span>
      </span>
    </div>
  )
}

/* ============================================================
   RANGÉE FONCTIONNALITÉS — Stock | Rapports | Commerce
   (traduisible, identique partout)
   ============================================================ */
export function FeatureRow() {
  const { t } = useApp()
  return (
    <div className="flex items-center justify-center gap-3 px-6 text-sm font-medium text-navy">
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
  )
}

/* ============================================================
   PIED DE PAGE — identique pour les 3 pages
   ============================================================ */
export function AuthFooter() {
  const { t } = useApp()
  return (
    <>
      <div className="mt-5 flex flex-row flex-nowrap items-center justify-between gap-1 px-2.5 py-4 text-[8.5px] leading-tight text-muted-foreground sm:gap-3 sm:px-6 sm:text-xs">
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" aria-hidden />
          {t('secure_encrypted')}
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <Headphones className="h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" aria-hidden />
          {t('support_label')} : +33 7 58 66 46 84
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <Globe className="h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" aria-hidden />
          {t('contact_label')} : contact@reglili.mr
        </span>
      </div>

      <div className="relative">
        <svg
          className="block h-6 w-full text-navy"
          viewBox="0 0 500 24"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,24 L0,24 Q250,-12 500,24 Z" fill="currentColor" />
        </svg>
        <div className="-mt-px bg-navy px-6 pb-4 pt-1 text-center text-navy-foreground/85">
          <p className="text-xs">
            <Lock className="mb-0.5 me-1 inline h-3 w-3" aria-hidden /> © 2025{' '}
            <span className="font-semibold text-brand">SMART REGLILI</span> — {t('footer_rights')}
          </p>
          <p className="mt-3 text-[10px] text-navy-foreground/65">{t('footer_created_by')}</p>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   CHAMP DE FORMULAIRE
   ============================================================ */
export function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-colors focus-within:border-brand">
      <span className="text-brand">{icon}</span>
      {children}
    </div>
  )
}

/* ============================================================
   SÉPARATEUR AVEC LIBELLÉ
   ============================================================ */
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/* ============================================================
   CARTE DE RÔLE (Login uniquement)
   ============================================================ */
export function RoleCard({
  active,
  onClick,
  img,
  imgActive,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  img: string
  imgActive: string
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
        active ? 'border-brand bg-brand/5 shadow-soft' : 'border-border bg-card hover:border-brand/40',
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
          src={(active ? imgActive : img) || '/placeholder.svg'}
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

/* ============================================================
   ICÔNE WHATSAPP
   ============================================================ */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ============================================================
   MODAL AIDE
   ============================================================ */
export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useApp()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
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
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('help_text')}</p>
        <div className="mt-4 rounded-xl bg-muted p-3 text-sm text-foreground">
          <p className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-brand" aria-hidden /> +33 7 58 66 46 84
          </p>
          <p className="mt-1 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" aria-hidden /> contact@reglili.mr
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   MODAL MOT DE PASSE OUBLIÉ
   ============================================================ */
export function ForgotModal({ onClose }: { onClose: () => void }) {
  const { t, dir } = useApp()
  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Lock className="h-5 w-5 text-brand" aria-hidden />
            {t('forgot_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('forgot_msg')}</p>

        <div className="mt-5 flex flex-col gap-2">
          <a
            href="https://wa.me/33758664684?text=Bonjour%2C%20j%27ai%20oubli%C3%A9%20mon%20mot%20de%20passe%20SMART%20REGLILI."
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:brightness-105 active:scale-[0.99]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t('whatsapp')}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-muted py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted/70"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
