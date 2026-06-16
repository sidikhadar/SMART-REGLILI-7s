'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, MailCheck, AlertCircle, ShieldCheck } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AuthBrandMini, AuthFooter } from '@/components/auth/auth-shared'

/** Vérification email : code à 6 chiffres. Code de démo : 123456. */
export function VerifyScreen({
  onBack,
  onVerified,
}: {
  onBack: () => void
  onVerified: () => void
}) {
  const { t, dir } = useApp()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function setDigit(i: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = v
    setCode(next)
    setError('')
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length) {
      const next = ['', '', '', '', '', '']
      digits.forEach((d, idx) => (next[idx] = d))
      setCode(next)
      refs.current[Math.min(digits.length, 5)]?.focus()
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const entered = code.join('')
    if (entered.length < 6) {
      setError(t('invalid_code'))
      return
    }
    // Simulation : code de démo valide = 123456
    if (entered === '123456') {
      onVerified()
    } else {
      setError(t('invalid_code'))
    }
  }

  function resend() {
    setResent(true)
    setCode(['', '', '', '', '', ''])
    setError('')
    refs.current[0]?.focus()
    setTimeout(() => setResent(false), 2500)
  }

  return (
    <div dir={dir} className="animate-slide-in-right flex h-dvh flex-col bg-navy text-navy-foreground">
      <header className="flex shrink-0 items-center justify-between px-4 pt-4 sm:px-6">
        <AuthBrandMini />
        <button
          type="button"
          onClick={onBack}
          aria-label={t('back')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 flip-rtl" aria-hidden />
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto w-full max-w-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30">
            <MailCheck className="h-8 w-8 text-brand" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black">{t('verify_title')}</h1>
          <p className="mt-2 text-pretty text-sm text-navy-foreground/70">{t('verify_subtitle')}</p>

          <form onSubmit={handleVerify} className="mt-6">
            <div dir="ltr" className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Chiffre ${i + 1}`}
                  className="h-14 w-12 rounded-xl border-2 border-white/15 bg-white/5 text-center font-mono text-2xl font-bold text-navy-foreground outline-none transition-colors focus:border-brand"
                />
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" aria-hidden />
                {error}
              </div>
            )}
            {resent && (
              <p className="mt-4 text-sm font-medium text-brand">{t('code_resent')}</p>
            )}

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
              {t('verify_btn')}
            </button>
          </form>

          <button
            type="button"
            onClick={resend}
            className="mt-4 text-sm font-medium text-brand hover:underline"
          >
            {t('resend_code')}
          </button>
        </div>
      </main>

      <AuthFooter />
    </div>
  )
}
