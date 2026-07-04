'use client'

import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { BrandEmblem } from '@/components/brand-logo'
import { ArrowLeft, Mail, Globe, User } from 'lucide-react'

export default function AboutPage() {
  const { t } = useApp()

  return (
    <AppShell title={t('set_about')}>
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 flip-rtl" />
          {t('settings')}
        </Link>

        {/* Logo + identité */}
        <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-card p-2 shadow-soft ring-1 ring-border">
            <BrandEmblem size={56} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black tracking-wide text-foreground">
            SMART <span className="text-brand">REGLILI</span>
          </h1>
          <p className="mt-1 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {t('about_version')}
          </p>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
            {t('about_description')}
          </p>
        </section>

        {/* Créateur */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t('about_creator')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-navy">
              <User className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {t('about_creator_name')}
              </p>
              <a
                href="mailto:sidimohamedkhadar@gmail.com"
                className="flex items-center gap-1.5 truncate text-sm text-brand"
              >
                <Mail className="h-4 w-4 shrink-0" />
                sidimohamedkhadar@gmail.com
              </a>
            </div>
          </div>

          <a
            href="https://reglili.mr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <Globe className="h-5 w-5" />
            {t('about_website')} : reglili.mr
          </a>
        </section>

        <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
          {t('about_copyright')}
        </p>
      </div>
    </AppShell>
  )
}
