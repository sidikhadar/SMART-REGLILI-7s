'use client'

import Image from 'next/image'
import { ShoppingCart, BarChart3 } from 'lucide-react'

/**
 * Animation de lancement premium (~2.5s) :
 * - Les pièces du logo arrivent de différentes directions et s'assemblent au centre.
 * - Le logo complet brille légèrement.
 * - Puis l'ensemble glisse vers le haut pendant que la Welcome Screen apparaît.
 */
export function LaunchAnimation() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="launch-assembled relative flex h-44 w-44 items-center justify-center">
        {/* Arc bleu — arrive des côtés */}
        <span className="launch-arc absolute inset-0 rounded-full border-[6px] border-navy-foreground/15" />
        <span className="launch-arc absolute inset-2 rounded-full border-2 border-brand/40" />

        {/* Barres graphiques — arrivent du haut */}
        <span className="launch-piece-top absolute -top-2 left-1/2 flex -translate-x-1/2 items-end gap-1">
          <BarChart3 className="h-8 w-8 text-brand" aria-hidden />
        </span>

        {/* S — arrive de gauche */}
        <span className="launch-piece-left absolute left-3 top-1/2 -translate-y-1/2 font-display text-5xl font-black text-navy-foreground">
          S
        </span>

        {/* R — arrive de droite */}
        <span className="launch-piece-right absolute right-3 top-1/2 -translate-y-1/2 font-display text-5xl font-black text-brand">
          R
        </span>

        {/* Chariot — arrive du bas */}
        <span className="launch-piece-bottom absolute -bottom-1 left-1/2 -translate-x-1/2">
          <ShoppingCart className="h-9 w-9 text-navy-foreground" aria-hidden />
        </span>

        {/* Logo complet assemblé au centre (brille) */}
        <span className="launch-glow relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <Image
            src="/logo-smart-reglili.jpeg"
            alt="SMART REGLILI"
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </span>
      </div>
    </div>
  )
}
