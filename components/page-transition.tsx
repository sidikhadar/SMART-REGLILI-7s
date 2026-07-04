'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'

// Mémorise le dernier chemin entre les remontages de composant
// (le module reste vivant pendant la navigation côté client).
let lastPath = ''

function orderIndex(path: string): number {
  if (!path) return -1
  return NAV_ITEMS.findIndex(
    (i) => path === i.href || path.startsWith(i.href + '/'),
  )
}

/**
 * Anime l'entrée de chaque page : glissement horizontal selon le sens de
 * navigation (avant / arrière dans l'ordre du menu), ou glissement vertical
 * quand la position dans le menu est inconnue.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const prevIndex = orderIndex(lastPath)
  const currIndex = orderIndex(pathname)

  let anim = 'animate-slide-in-up'
  if (lastPath && lastPath !== pathname) {
    if (currIndex >= 0 && prevIndex >= 0) {
      anim = currIndex < prevIndex ? 'animate-slide-in-back' : 'animate-slide-in-forward'
    } else {
      anim = 'animate-slide-in-forward'
    }
  }

  const [key, setKey] = useState(pathname)

  useEffect(() => {
    lastPath = pathname
    setKey(pathname)
  }, [pathname])

  return (
    <div key={key} className={cn('will-change-transform', anim)}>
      {children}
    </div>
  )
}
