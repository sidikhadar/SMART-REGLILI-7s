'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MailCheck, ShieldCheck, Check } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import {
  AuthCard,
  NavyHeader,
  HeaderLogo,
  BackButton,
  FeatureRow,
  AuthFooter,
} from '@/components/auth/auth-ui'

const DEMO_CODE = '123456'

export default function VerifyPage() {
  const { t, dir } = useApp()
  const router = useRouter()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const [sentMsg, setSentMsg] = useState(false)
  const [done, setDone] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function setDigit(i: number, v: string) {
    const char = v.replace(/\D/g, '').slice(-1)
    setError(false)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = char
      return next
    })
    if (char && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return
    // Démo : tout code valide sauf si différent du code de démonstration
    if (code === DEMO_CODE || code.length === 6) {
      setDone(true)
    } else {
      setError(true)
    }
  }

  function resend() {
    setSentMsg(true)
    setDigits(['', '', '', '', '', ''])
    setError(false)
    inputs.current[0]?.focus()
    setTimeout(() => setSentMsg(false), 2500)
  }

  if (done) {
    return (
      <AuthCard>
        <NavyHeader left={<HeaderLogo />} right={<BackButton href="/login" />} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand/30 animate-success-ring" />
            <span className="animate-success-pop flex h-24 w-24 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-soft">
              <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-check-draw"
                />
              </svg>
            </span>
          </div>
          <h1 className="animate-rise-in text-pretty text-2xl font-black text-foreground">
            {t('success_title')}
          </h1>
          <p className="animate-rise-in mt-2 text-base text-muted-foreground">{t('success_msg')}</p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="animate-rise-in mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <Check className="h-5 w-5" aria-hidden />
            {t('login_now')}
          </button>
        </div>
        <AuthFooter />
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <NavyHeader left={<HeaderLogo />} right={<BackButton href="/signup" />} />

      <div className="mt-3">
        <FeatureRow />
      </div>

      <form onSubmit={handleVerify} className="flex flex-col items-center px-6 pb-2 pt-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <MailCheck className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-black text-foreground">{t('verify_title')}</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t('verify_subtitle')}</p>

        <div dir="ltr" className="mt-6 flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              aria-label={`Chiffre ${i + 1}`}
              className={cn(
                'h-14 w-12 rounded-xl border-2 bg-card text-center text-2xl font-bold text-foreground outline-none transition-colors focus:border-brand',
                error ? 'border-destructive' : 'border-border',
              )}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-destructive">
            {t('invalid_code')}
          </p>
        )}
        {sentMsg && (
          <p className="mt-3 text-sm font-medium text-brand">{t('code_sent')}</p>
        )}

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <ShieldCheck className="h-5 w-5" aria-hidden />
          {t('verify_btn')}
        </button>

        <button
          type="button"
          onClick={resend}
          className="mt-4 text-sm font-medium text-brand hover:underline"
        >
          {t('resend_code')}
        </button>
      </form>

      <AuthFooter />
    </AuthCard>
  )
}
