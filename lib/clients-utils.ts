import type { Sale } from './types'
import { formatMRU } from './format'

/** Total dépensé par un client (somme des ventes qui lui sont rattachées). */
export function clientTotalPurchased(sales: Sale[], clientId: string): number {
  return sales
    .filter((s) => s.clientId === clientId)
    .reduce((sum, s) => sum + s.total, 0)
}

/** Ventes d'un client, les plus récentes en premier. */
export function clientSales(sales: Sale[], clientId: string): Sale[] {
  return sales
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/** Nettoie un numéro de téléphone pour l'API WhatsApp (chiffres uniquement). */
export function normalizePhone(phone?: string): string {
  return (phone || '').replace(/[^\d]/g, '')
}

/** Construit une URL wa.me avec message pré-rempli pour un rappel de dette. */
export function whatsappReminderUrl(
  phone: string | undefined,
  name: string,
  amount: number,
): string {
  const num = normalizePhone(phone)
  const msg = `Bonjour ${name}, ceci est un rappel concernant votre dette de ${formatMRU(
    amount,
  )} MRU auprès de notre boutique. Merci de bien vouloir régulariser. — SMART REGLILI`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
