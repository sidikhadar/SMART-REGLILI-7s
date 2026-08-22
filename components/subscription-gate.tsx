'use client'

import { useState } from 'react'
import { Lock, ShieldCheck, MessageCircle, RefreshCw, Copy, Check } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { useSubscription, PRICE_MRU } from '@/lib/subscription'
import { formatMRU } from '@/lib/format'
import { BrandSquare } from '@/components/brand-logo'
import { PhoneNumber } from '@/components/phone-number'

const PAY_NUMBER = '37 16 20 07'
const WA_LINK = 'https://wa.me/33758664684'
const EMAIL = 'contact@reglili.com'

/**
 * Écran de blocage affiché lorsque l'abonnement (ou l'essai) est expiré.
 * Il recouvre entièrement l'application : aucune autre page n'est accessible
 * tant que le paiement n'a pas été confirmé.
 */
export function SubscriptionGate() {
  const { t } = useApp()
  const { refresh } = useSubscription()
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notConfirmed, setNotConfirmed] = useState(false)

  function copyNumber() {
    navigator.clipboard?.writeText(PAY_NUMBER.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function verifyPayment() {
    setChecking(true)
    setNotConfirmed(false)
    // Relit l'état d'abonnement (activé par l'administrateur).
    setTimeout(() => {
      refresh()
      setChecking(false)
      setNotConfirmed(true)
      setTimeout(() => setNotConfirmed(false), 4000)
    }, 900)
  }

  const waUrl = `${WA_LINK}?text=${encodeURIComponent(t('wa_sub_message'))}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/98 px-4 py-8 backdrop-blur-sm"
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <BrandSquare size={64} />
        </div>

        {/* Bandeau d'alerte */}
        <div className="mt-6 rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
            <Lock className="h-7 w-7 text-destructive" aria-hidden />
          </div>
          <h1
            id="gate-title"
            className="mt-4 font-heading text-xl font-extrabold text-balance text-foreground"
          >
            {t('sub_expired_title')}
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('sub_expired_note')}
          </p>
          <p className="mt-3 rounded-xl bg-card px-3 py-2 text-xs font-semibold text-destructive">
            {t('gate_locked_note')}
          </p>
        </div>

        {/* Montant à payer */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('plan_monthly')}
          </p>
          <p className="mt-1 text-center font-heading text-3xl font-extrabold text-brand">
            {formatMRU(PRICE_MRU)}
            <span className="ms-1 text-sm font-semibold text-muted-foreground">
              {t('per_month')}
            </span>
          </p>

          {/* Numéro de paiement */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
              {t('payment_number')}
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <PhoneNumber
                value={PAY_NUMBER}
                className="min-w-0 flex-1 truncate font-heading text-base font-bold text-foreground"
              />
              <button
                type="button"
                onClick={copyNumber}
                aria-label={t('copy')}
                className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-brand/10 px-2.5 text-xs font-semibold text-brand transition-transform active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden /> {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> {t('copy')}
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-3 text-pretty text-xs leading-relaxed text-muted-foreground">
            {t('finalize_step1')} {t('finalize_step2')}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand px-4 font-heading text-base font-bold text-brand-foreground shadow-soft transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            {t('send_whatsapp_confirm')}
          </a>

          <button
            type="button"
            onClick={verifyPayment}
            disabled={checking}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 font-heading text-base font-bold text-foreground shadow-soft transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`}
              aria-hidden
            />
            {t('check_payment')}
          </button>

          {notConfirmed && (
            <p
              role="status"
              className="rounded-xl bg-warning/10 px-3 py-2 text-center text-xs font-semibold text-warning"
            >
              {t('payment_not_confirmed')}
            </p>
          )}
        </div>

        {/* Support */}
        <div className="mt-5 flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
            {t('secure_encrypted')}
          </span>
          <a href={`mailto:${EMAIL}`} className="font-semibold text-brand">
            {EMAIL}
          </a>
        </div>
      </div>
    </div>
  )
}
