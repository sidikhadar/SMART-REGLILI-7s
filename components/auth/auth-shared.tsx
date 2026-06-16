'use client'

import { useApp } from '@/lib/app-context'
import { LANGS } from '@/lib/i18n'
import { Flag } from '@/components/flag'
import { cn } from '@/lib/utils'

/** Sélecteur de langue avec vrais drapeaux. Le changement s'applique à toute l'app. */
export function LangFlags({ className }: { className?: string }) {
  const { lang, setLang } = useApp()
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          aria-label={l.label}
          className={cn(
            'flex h-10 w-12 items-center justify-center rounded-lg transition-all',
            lang === l.code
              ? 'bg-white/15 ring-2 ring-brand'
              : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10',
          )}
        >
          <Flag lang={l.code} className="h-5 w-7" />
        </button>
      ))}
    </div>
  )
}

/** Pied de page commun aux pages d'auth. */
export function AuthFooter() {
  const { t } = useApp()
  return (
    <footer className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-3 text-center text-[10px] text-navy-foreground/60 sm:text-xs">
      <span>{t('contact_label')} : contact@reglili.mr</span>
      <span className="text-navy-foreground/20">|</span>
      <span>{t('payment_label')} : +33 7 58 66 46 84</span>
      <span className="text-navy-foreground/20">|</span>
      <span>Email : contact@reglili.mr</span>
    </footer>
  )
}

/** Petit logo SR + nom, affiché en haut des pages Login / Inscription. */
export function AuthBrandMini() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-sm font-black text-brand-foreground shadow-soft">
        SR
      </span>
      <span className="font-display text-sm font-black tracking-wide text-navy-foreground">
        SMART <span className="text-brand">REGLILI</span>
      </span>
    </div>
  )
}
