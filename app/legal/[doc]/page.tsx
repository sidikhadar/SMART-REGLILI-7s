'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { ArrowLeft, ShieldCheck, FileText, Scale } from 'lucide-react'

const DOCS = {
  privacy: { titleKey: 'legal_privacy', bodyKey: 'legal_privacy_body', icon: ShieldCheck },
  terms: { titleKey: 'legal_terms', bodyKey: 'legal_terms_body', icon: FileText },
  notices: { titleKey: 'legal_notices', bodyKey: 'legal_notices_body', icon: Scale },
} as const

type DocKey = keyof typeof DOCS

export default function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>
}) {
  const { doc } = use(params)
  const { t } = useApp()

  if (!(doc in DOCS)) notFound()
  const entry = DOCS[doc as DocKey]
  const Icon = entry.icon

  return (
    <AppShell title={t(entry.titleKey)}>
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 flip-rtl" />
          {t('settings')}
        </Link>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-heading text-lg font-extrabold text-foreground">
                {t(entry.titleKey)}
              </h1>
              <p className="text-xs text-muted-foreground">{t('legal_updated')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {t(entry.bodyKey)
              .split('\n\n')
              .map((para, i) => {
                const trimmed = para.trim()
                // Un paragraphe qui se termine par « : » et court est traité comme un titre de section
                const isHeading = trimmed.endsWith(':') && trimmed.length < 60
                if (isHeading) {
                  return (
                    <h2
                      key={i}
                      className="font-heading text-sm font-bold text-foreground"
                    >
                      {trimmed.replace(/:$/, '')}
                    </h2>
                  )
                }
                return (
                  <p
                    key={i}
                    className="text-pretty text-sm leading-relaxed text-muted-foreground"
                  >
                    {trimmed}
                  </p>
                )
              })}
          </div>
        </section>

        {/* Navigation entre documents */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DOCS) as DocKey[]).map((key) => {
            const active = key === doc
            return (
              <Link
                key={key}
                href={`/legal/${key}`}
                className={
                  'rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition-colors ' +
                  (active
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted')
                }
              >
                {t(DOCS[key].titleKey)}
              </Link>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
