'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, X, Headphones, Globe } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import type { Role } from '@/lib/types'
import { LaunchAnimation } from '@/components/auth/launch-animation'
import { WelcomeScreen } from '@/components/auth/welcome-screen'
import { LoginScreen } from '@/components/auth/login-screen'
import { SignupScreen } from '@/components/auth/signup-screen'
import { VerifyScreen } from '@/components/auth/verify-screen'
import { SuccessScreen } from '@/components/auth/success-screen'

type Step = 'launch' | 'welcome' | 'login' | 'signup' | 'verify' | 'success'

export default function AuthFlow() {
  const router = useRouter()
  const { dir } = useApp()
  const [step, setStep] = useState<Step>('launch')
  const [showHelp, setShowHelp] = useState(false)

  // Fin de l'animation de lancement (~2.5s) → Welcome Screen
  useEffect(() => {
    if (step !== 'launch') return
    const id = setTimeout(() => setStep('welcome'), 2500)
    return () => clearTimeout(id)
  }, [step])

  function handleLoginSuccess(_role: Role) {
    router.push('/dashboard')
  }

  return (
    <main dir={dir} className="relative h-dvh overflow-hidden bg-navy">
      {step === 'launch' && (
        <>
          {/* Welcome préparée dessous pour le fondu */}
          <WelcomeScreen
            onLogin={() => setStep('login')}
            onSignup={() => setStep('signup')}
            onHelp={() => setShowHelp(true)}
          />
          <LaunchAnimation />
        </>
      )}

      {step === 'welcome' && (
        <WelcomeScreen
          onLogin={() => setStep('login')}
          onSignup={() => setStep('signup')}
          onHelp={() => setShowHelp(true)}
        />
      )}

      {step === 'login' && (
        <LoginScreen onBack={() => setStep('welcome')} onSuccess={handleLoginSuccess} />
      )}

      {step === 'signup' && (
        <SignupScreen onBack={() => setStep('welcome')} onSubmit={() => setStep('verify')} />
      )}

      {step === 'verify' && (
        <VerifyScreen onBack={() => setStep('signup')} onVerified={() => setStep('success')} />
      )}

      {step === 'success' && <SuccessScreen onLogin={() => setStep('login')} />}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </main>
  )
}

function HelpModal({ onClose }: { onClose: () => void }) {
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
