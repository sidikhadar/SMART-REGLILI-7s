import { cn } from '@/lib/utils'

/**
 * Affiche un numéro de téléphone toujours de gauche à droite (LTR),
 * même quand l'interface est en arabe (RTL).
 * On utilise `dir="ltr"` + `unicode-bidi: isolate` pour empêcher
 * le moteur bidi d'inverser les chiffres et les espaces.
 */
export function PhoneNumber({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <bdi
      dir="ltr"
      className={cn('inline-block [unicode-bidi:isolate]', className)}
    >
      {value}
    </bdi>
  )
}
