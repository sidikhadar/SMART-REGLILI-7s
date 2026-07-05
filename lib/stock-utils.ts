import type { Lot, Product, ProductVariant, Sale } from './types'
import { daysUntil, productStock } from './format'

/* ------------------------------ Variantes de vente ------------------------------ */

/**
 * Variante de base (unité) d'un produit. Utilisée quand aucune variante
 * n'est explicitement choisie. Factor = 1, prix = prix de vente unitaire.
 */
export function baseVariant(p: Product): ProductVariant {
  if (p.variants && p.variants.length > 0) return p.variants[0]
  return { id: 'unit', label: 'Unité', barcode: p.barcode, price: p.sellPrice, factor: 1 }
}

/** Liste des variantes vendables d'un produit (au moins l'unité de base). */
export function productVariants(p: Product): ProductVariant[] {
  if (p.variants && p.variants.length > 0) return p.variants
  return [baseVariant(p)]
}

/**
 * Recherche un produit par code-barres parmi une liste, en tenant compte
 * des codes-barres de chaque variante. Renvoie le produit ET la variante
 * correspondante pour que la caisse décompte le bon nombre d'unités.
 */
export function findByBarcode(
  barcode: string,
  products: Product[],
): { product: Product; variant: ProductVariant } | null {
  const code = barcode.trim()
  if (!code) return null
  for (const p of products) {
    for (const v of productVariants(p)) {
      if (v.barcode && v.barcode === code) return { product: p, variant: v }
    }
    if (p.barcode === code) return { product: p, variant: baseVariant(p) }
  }
  return null
}

/** Marge en pourcentage à partir des prix d'achat / vente */
export function productMargin(buyPrice: number, sellPrice: number): number {
  if (sellPrice <= 0) return 0
  return Math.round(((sellPrice - buyPrice) / sellPrice) * 100)
}

/** Bénéfice unitaire en MRU */
export function unitProfit(buyPrice: number, sellPrice: number): number {
  return Math.max(0, sellPrice - buyPrice)
}

export type SellSignal = 'hot' | 'warm' | 'cold'

/**
 * Signal de vente d'un produit basé sur les quantités vendues récemment.
 * feu vert chaud (hot), signal moyen (warm), signal froid (cold)
 */
export function sellSignal(productId: string, sales: Sale[]): SellSignal {
  const soldQty = sales.reduce((sum, s) => {
    const item = s.items.find((it) => it.productId === productId)
    return sum + (item ? item.qty : 0)
  }, 0)
  if (soldQty >= 5) return 'hot'
  if (soldQty >= 2) return 'warm'
  return 'cold'
}

export type ExpiryLevel = 'none' | 'ok' | 'info' | 'warning' | 'danger' | 'expired'

/** Seuils d'alerte d'expiration : 30j, 7j, 3j, 1j, jour même */
export function expiryLevel(expiry?: string): { level: ExpiryLevel; days: number | null } {
  if (!expiry) return { level: 'none', days: null }
  const days = daysUntil(expiry)
  if (days < 0) return { level: 'expired', days }
  if (days === 0) return { level: 'danger', days }
  if (days <= 3) return { level: 'danger', days }
  if (days <= 7) return { level: 'warning', days }
  if (days <= 30) return { level: 'info', days }
  return { level: 'ok', days }
}

/** Le lot le plus proche de l'expiration détermine l'alerte du produit */
export function productExpiryLevel(lots: Lot[]): { level: ExpiryLevel; days: number | null } {
  const dated = lots.filter((l) => l.expiry)
  if (dated.length === 0) return { level: 'none', days: null }
  let best = expiryLevel(dated[0].expiry)
  for (const l of dated.slice(1)) {
    const cur = expiryLevel(l.expiry)
    if (cur.days !== null && (best.days === null || cur.days < best.days)) best = cur
  }
  return best
}

/**
 * Tri FIFO : le lot qui expire le plus tôt est vendu en premier.
 * Les lots sans date d'expiration passent en dernier.
 */
export function sortLotsFIFO(lots: Lot[]): Lot[] {
  return [...lots].sort((a, b) => {
    if (!a.expiry && !b.expiry) return 0
    if (!a.expiry) return 1
    if (!b.expiry) return -1
    return new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
  })
}

/** Valeur totale du stock (au prix d'achat) */
export function stockValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + productStock(p.lots) * p.buyPrice, 0)
}

/* ----------------------------- Lookup code-barres ----------------------------- */

export type LookupSource = 'off' | 'obf' | 'sante'

export interface LookupResult {
  found: boolean
  name?: string
  brand?: string
  image?: string
  category?: 'alimentation' | 'cosmetique' | 'sante' | 'autre'
  vat?: number
  posology?: string
  lotNumber?: string
}

/**
 * Recherche d'un produit par code-barres.
 * - Open Food Facts : vrai appel API public (CORS ouvert).
 * - Open Beauty Facts : vrai appel API public + TVA 20%.
 * - Base Santé Publique : simulée (n° de lot + posologie).
 */
export async function lookupBarcode(
  barcode: string,
  source: LookupSource,
): Promise<LookupResult> {
  try {
    if (source === 'off' || source === 'obf') {
      const host =
        source === 'off'
          ? 'https://world.openfoodfacts.org'
          : 'https://world.openbeautyfacts.org'
      const res = await fetch(`${host}/api/v2/product/${barcode}.json`)
      const data = await res.json()
      if (data?.status === 1 && data.product) {
        const p = data.product
        return {
          found: true,
          name: p.product_name || p.generic_name || `Produit ${barcode}`,
          brand: p.brands,
          image: p.image_front_small_url || p.image_url || undefined,
          category: source === 'obf' ? 'cosmetique' : 'alimentation',
          vat: source === 'obf' ? 20 : undefined,
        }
      }
      return { found: false }
    }

    // Base Santé Publique : simulée (pas d'API publique stable côté client)
    await new Promise((r) => setTimeout(r, 600))
    const SANTE_DB: Record<string, LookupResult> = {
      '3400930000111': {
        found: true,
        name: 'Paracétamol 500mg',
        category: 'sante',
        posology: '1 à 2 cps, 3x/jour (max 6/j)',
        lotNumber: 'PH-LOT-A',
      },
      '3400935551234': {
        found: true,
        name: 'Amoxicilline 1g',
        category: 'sante',
        posology: '1 cp matin et soir, 7 jours',
        lotNumber: 'AMX-2401',
      },
      '3400936667788': {
        found: true,
        name: 'Ibuprofène 400mg',
        category: 'sante',
        posology: '1 cp toutes les 8h pendant le repas',
        lotNumber: 'IBU-77',
      },
    }
    return SANTE_DB[barcode] ?? { found: false }
  } catch {
    return { found: false }
  }
}
