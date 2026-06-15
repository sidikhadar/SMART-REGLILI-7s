export function formatMRU(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatTime(iso: string, lang = 'fr'): string {
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR'
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string, lang = 'fr'): string {
  const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR'
  return new Date(iso).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  })
}

export function daysUntil(iso: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

export function productStock(lots: { quantity: number }[]): number {
  return lots.reduce((sum, l) => sum + l.quantity, 0)
}
