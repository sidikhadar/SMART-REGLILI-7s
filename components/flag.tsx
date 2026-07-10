'use client'

import { useState } from 'react'

/**
 * Affiche un vrai drapeau via image (flagcdn).
 * Sur certains PC (Windows) les emojis drapeaux s'affichent en texte "MR/FR/GB" :
 * on utilise donc une image réelle, avec repli automatique sur l'emoji
 * si l'image ne charge pas.
 */
export function Flag({
  country,
  emoji,
  className,
}: {
  country: string
  emoji: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className={className} aria-hidden style={{ lineHeight: 1 }}>
        {emoji}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${country}.png`}
      srcSet={`https://flagcdn.com/w160/${country}.png 2x`}
      width={28}
      height={20}
      alt=""
      aria-hidden
      loading="eager"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
