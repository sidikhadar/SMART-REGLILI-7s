'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Check,
  Crown,
  Smartphone,
  Copy,
  CheckCircle2,
  MessageCircle,
  Mail,
  AlertTriangle,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { formatMRU } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAYMENT_NUMBER = '37 16 20 07'
const WHATSAPP = '+33 7 58 66 46 84'
const WHATSAPP_LINK = 'https://wa.me/33758664684'
const EMAIL = 'contact@reglili.mr'
const PAYMENT_APPS = ['Bankily', 'Sedad', 'Masrivi', 'Click']

interface Plan {
  key: string
  price: number
  periodKey: string
  save?: number
  popular?: boolean
}

const PLANS: Plan[] = [
  { key: 'plan_monthly', price: 1000, periodKey: 'per_month' },
  { key: 'plan_6months', price: 5400, periodKey: 'per_6months', save: 600, popular: true },
  { key: 'plan_yearly', price: 11000, periodKey: 'per_year', save: 1000 },
]

function SubscriptionContent() {
  const { t } = useApp()
  const params = useSearchParams()
  const expired = params.get('expired') === '1'
  const [selected, setSelected] = useState('plan_6months')
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const selectedPlan = PLANS.find((p) => p.key === selected) ?? PLANS[0]

  function copyNumber() {
    navigator.clipboard?.writeText(PAYMENT_NUMBER.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function waConfirmLink() {
    const msg = `${t('wa_sub_message')} (${t(selectedPlan.key)} — ${formatMRU(selectedPlan.price)} ${t('mru')})`
    return `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`
  }

  return (
    <AppShell title={t('subscription')}>
      {/* Bannière d'expiration */}
      {expired && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-destructive">{t('sub_expired_title')}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t('sub_expired_note')}</p>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-4 text-center">
        <h2 className="font-heading text-xl font-extrabold text-foreground text-balance">
          {t('choose_plan')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('plan_subtitle')}</p>
      </div>

      {/* Plans */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const active = selected === plan.key
          return (
            <button
              key={plan.key}
              type="button"
              onClick={() => setSelected(plan.key)}
              className={cn(
                'relative flex flex-col rounded-2xl border p-4 text-left transition-all',
                active
                  ? 'border-brand bg-brand/5 shadow-soft ring-2 ring-brand/30'
                  : 'border-border bg-card hover:border-brand/40',
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground shadow-soft">
                  <Crown className="h-3 w-3" />
                  {t('badge_popular')}
                </span>
              )}
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-foreground">{t(plan.key)}</span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    active ? 'border-brand bg-brand text-brand-foreground' : 'border-border',
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-extrabold tabular-nums text-foreground">
                  {formatMRU(plan.price)}
                </span>
                <span className="text-xs text-muted-foreground">{t('mru')}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t(plan.periodKey)}</span>
              {plan.save && (
                <span className="mt-2 inline-flex w-fit items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  {t('save_label')} {formatMRU(plan.save)} {t('mru')}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
      >
        <Crown className="h-5 w-5" />
        {expired ? t('renew_now') : t('subscribe_now')}
      </button>

      {/* Applications de paiement */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('payment_apps')}</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {PAYMENT_APPS.map((app) => (
            <span
              key={app}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground"
            >
              <Smartphone className="h-4 w-4 text-brand" />
              {app}
            </span>
          ))}
        </div>

        {/* Numéro de paiement */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('payment_number')}</p>
            <p className="font-heading text-lg font-bold tabular-nums text-foreground">
              {PAYMENT_NUMBER}
            </p>
          </div>
          <button
            type="button"
            onClick={copyNumber}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
              copied
                ? 'bg-brand/10 text-brand'
                : 'bg-navy text-navy-foreground hover:brightness-110',
            )}
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>

      {/* Rappel après paiement */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{t('after_payment_title')}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('after_payment_note')}</p>
        </div>
      </div>

      {/* Contacts support */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-brand/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('whatsapp_support')}</p>
            <p className="truncate font-semibold text-foreground" dir="ltr">
              {WHATSAPP}
            </p>
          </div>
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-brand/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-brand">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('email_label')}</p>
            <p className="truncate font-semibold text-foreground">{EMAIL}</p>
          </div>
        </a>
      </div>

      {/* Modal de confirmation d'abonnement */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {t('finalize_title')}
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Récapitulatif formule */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-brand/30 bg-brand/5 p-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('selected_plan')}</p>
                <p className="font-semibold text-foreground">{t(selectedPlan.key)}</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-xl font-extrabold tabular-nums text-foreground">
                  {formatMRU(selectedPlan.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('mru')} {t(selectedPlan.periodKey)}
                </p>
              </div>
            </div>

            {/* Étapes */}
            <ol className="mb-4 space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                  1
                </span>
                <span className="text-sm text-foreground">{t('finalize_step1')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                  2
                </span>
                <span className="text-sm text-foreground">{t('finalize_step2')}</span>
              </li>
            </ol>

            {/* Numéro de paiement */}
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background p-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('payment_number')}</p>
                <p className="font-heading text-lg font-bold tabular-nums text-foreground">
                  {PAYMENT_NUMBER}
                </p>
              </div>
              <button
                type="button"
                onClick={copyNumber}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                  copied
                    ? 'bg-brand/10 text-brand'
                    : 'bg-navy text-navy-foreground hover:brightness-110',
                )}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>

            {/* Confirmation WhatsApp */}
            <a
              href={waConfirmLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <MessageCircle className="h-5 w-5" />
              {t('send_whatsapp_confirm')}
            </a>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionContent />
    </Suspense>
  )
}
