'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { BrandLogoFull } from '@/components/brand-logo'
import {
  AuthCard,
  NavyHeader,
  LangFlags,
  HelpButton,
  FeatureRow,
  AuthFooter,
  HelpModal,
} from '@/components/auth/auth-ui'

export default function WelcomePage() {
  const { t } = useApp()
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <AuthCard>
      <div className="animate-header-drop">
        <NavyHeader left={<LangFlags />} right={<HelpButton onClick={() => setShowHelp(true)} />} />
      </div>

      {/* Logo complet centré (posé dans le blanc, non coupé) */}
      <div className="-mt-6 px-6">
        <BrandLogoFull className="animate-logo-pop max-w-[280px]" />
      </div>

      {/* Rangée fonctionnalités */}
      <div className="mt-1 animate-rise-in" style={{ animationDelay: '0.25s' }}>
        <FeatureRow />
      </div>

      {/* Slogan court */}
      <p
        className="animate-rise-in mt-4 px-8 text-center text-pretty text-sm text-muted-foreground"
        style={{ animationDelay: '0.35s' }}
      >
        {t('welcome_intro')}
      </p>

      {/* Boutons principaux */}
      <div
        className="animate-rise-in mt-6 flex flex-col gap-3 px-6"
        style={{ animationDelay: '0.45s' }}
      >
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <LogIn className="h-5 w-5 flip-rtl" aria-hidden />
          {t('tab_signin')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/signup')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand/40 py-3.5 text-base font-semibold text-brand transition-colors hover:bg-brand/5 active:scale-[0.99]"
        >
          <UserPlus className="h-5 w-5" aria-hidden />
          {t('create_account')}
        </button>
      </div>

      <AuthFooter />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </AuthCard>
  )
}
