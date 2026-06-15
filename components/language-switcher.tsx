'use client'

import { useApp } from '@/lib/app-context'
import { LANGS } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useApp()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 shadow-soft',
        className,
      )}
      role="group"
      aria-label="Sélecteur de langue"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={cn(
            'flex h-9 min-w-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium transition-colors',
            lang === l.code
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          <span aria-hidden className="text-base leading-none">
            {l.flag}
          </span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
