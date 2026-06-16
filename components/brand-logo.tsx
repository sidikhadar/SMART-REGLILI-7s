import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Affiche l'image complète du logo Smart Reglili.
 * L'image contient déjà le titre, les sous-titres et le slogan,
 * donc on ne réécrit aucun texte par-dessus.
 */
export function BrandLogoFull({
  className,
  priority = true,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn('relative mx-auto w-full', className)}>
      <Image
        src="/logo-smart-reglili.jpeg"
        alt="Smart Reglili — Gérez, Contrôlez, Développez. Votre stock, notre intelligence."
        width={1213}
        height={1182}
        sizes="(max-width: 768px) 80vw, 360px"
        className="h-auto w-full object-contain"
        priority={priority}
      />
    </div>
  )
}

/**
 * Logo carré complet (image réelle) avec coins arrondis — taille personnalisable.
 * Affiche le vrai logo de l'application sans recadrage.
 */
export function BrandSquare({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/5',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-smart-reglili.jpeg"
        alt="Logo Smart Reglili"
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority
      />
    </div>
  )
}

/**
 * Emblème circulaire complet (logo SR rond) — affiché entier, jamais recadré.
 * Idéal pour le header du menu latéral.
 */
export function BrandEmblem({
  size = 48,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-emblem.png"
        alt="Logo Smart Reglili"
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority
      />
    </div>
  )
}

/**
 * Petite icône carrée (logo recadré) pour la barre supérieure ou les puces.
 */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl bg-card shadow-soft ring-1 ring-border',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-smart-reglili.jpeg"
        alt="Logo Smart Reglili"
        fill
        sizes={`${size}px`}
        // L'icône principale (boîte + chariot) est dans le haut-centre de l'image
        className="scale-[1.7] object-contain object-top"
        priority
      />
    </div>
  )
}
