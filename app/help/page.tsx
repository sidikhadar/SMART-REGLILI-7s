'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { WhatsAppIcon } from '@/components/auth/auth-ui'
import {
  ArrowLeft,
  ChevronDown,
  LifeBuoy,
  MessageCircleWarning,
  GraduationCap,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPPORT_PHONE = '33758664684'

export default function HelpPage() {
  const { t, dir } = useApp()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
  ]

  const steps = [
    t('tutorial_step1'),
    t('tutorial_step2'),
    t('tutorial_step3'),
    t('tutorial_step4'),
    t('tutorial_step5'),
  ]

  const supportUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(
    'Bonjour, j\'ai besoin d\'aide sur SMART REGLILI.',
  )}`
  const reportUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(
    t('help_report_msg'),
  )}`

  return (
    <AppShell title={t('set_help_support')}>
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 flip-rtl" />
          {t('settings')}
        </Link>

        {/* Centre d'aide / FAQ */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-base font-extrabold text-foreground">
              {t('help_faq')}
            </h2>
          </div>

          <ul className="space-y-2">
            {faqs.map((f, i) => {
              const open = openFaq === i
              return (
                <li key={i} className="overflow-hidden rounded-2xl border border-border">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 bg-background px-4 py-3 text-start"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                      )}
                    />
                  </button>
                  {open && (
                    <p className="border-t border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* Actions support */}
        <section className="space-y-2">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:brightness-105 active:scale-[0.99]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t('help_contact_support')}
          </a>

          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/15 text-warning">
              <MessageCircleWarning className="h-5 w-5" />
            </span>
            {t('help_report')}
          </a>

          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy">
              <GraduationCap className="h-5 w-5" />
            </span>
            {t('help_tutorial')}
          </button>
        </section>
      </div>

      {/* Modal tutoriel */}
      {tutorialOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setTutorialOpen(false)}
        >
          <div
            dir={dir}
            className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
                <GraduationCap className="h-5 w-5 text-brand" />
                {t('tutorial_title')}
              </h3>
              <button
                type="button"
                onClick={() => setTutorialOpen(false)}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-foreground">
                    {s}
                  </p>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => setTutorialOpen(false)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <Check className="h-5 w-5" />
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
