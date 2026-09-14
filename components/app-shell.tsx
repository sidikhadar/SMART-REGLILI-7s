'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import { BottomNav } from '@/components/bottom-nav'
import { PageTransition } from '@/components/page-transition'
import { SubscriptionGate } from '@/components/subscription-gate'
import { useSubscription } from '@/lib/subscription'

export function AppShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const { role } = useApp()
  const router = useRouter()
  const { blocked, ready } = useSubscription()

  useEffect(() => {
    if (role === null) {
      const saved = localStorage.getItem('sr_role')
      if (!saved) router.replace('/')
    }
  }, [role, router])

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar title={title} />
        <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-5 lg:px-8 lg:pb-10">
          <PageTransition>
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </PageTransition>
        </main>
        <BottomNav />
      </div>

      {/* Blocage total de l'application si l'abonnement a expiré */}
      {ready && blocked && <SubscriptionGate />}
    </div>
  )
}
