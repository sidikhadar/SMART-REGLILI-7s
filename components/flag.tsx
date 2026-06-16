'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/types'

/**
 * Affiche un vrai drapeau (image) avec repli sur l'emoji si l'image ne charge pas.
 * Résout le problème des emojis drapeaux qui s'affichent en "MR FR GB" sur Windows/desktop.
 */
const FLAG_CODE: Record<Lang, string> = {
  ar: 'mr', // Mauritanie
  fr: 'fr', // France
  en: 'gb', // Royaume-Uni
}

const FLAG_EMOJI: Record<Lang, string> = {
  ar: '🇲🇷',
  fr: '🇫🇷',
  en: '🇬🇧',
}

export function Flag({
  lang,
  className = 'h-5 w-7',
}: {
  lang: Lang
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className={`inline-flex items-center justify-center text-xl leading-none ${className}`}>
        {FLAG_EMOJI[lang]}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${FLAG_CODE[lang]}.png`}
      srcSet={`https://flagcdn.com/w80/${FLAG_CODE[lang]}.png 2x`}
      alt=""
      onError={() => setFailed(true)}
      className={`rounded-[3px] object-cover shadow-sm ${className}`}
      loading="eager"
    />
  )
}
