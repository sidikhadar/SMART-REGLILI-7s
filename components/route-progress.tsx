'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Fine barre verte (2px) affichée en haut de l'écran pendant la navigation
 * / le "chargement des données" entre les pages. Montée une seule fois dans
 * le layout racine pour persister entre les navigations.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const firstRender = useRef(true)

  useEffect(() => {
    // Ne pas déclencher au tout premier rendu (chargement initial)
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    setVisible(true)
    setProgress(12)
    const t1 = setTimeout(() => setProgress(64), 90)
    const t2 = setTimeout(() => setProgress(88), 260)
    const t3 = setTimeout(() => setProgress(100), 460)
    const t4 = setTimeout(() => setVisible(false), 660)
    const t5 = setTimeout(() => setProgress(0), 780)

    return () => {
      ;[t1, t2, t3, t4, t5].forEach(clearTimeout)
    }
  }, [pathname])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
    >
      <div
        className="h-full rounded-full bg-brand shadow-[0_0_8px_var(--brand)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  )
}
