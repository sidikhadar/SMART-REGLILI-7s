import { SALES, PRODUCTS, DAILY_SALES, SALES_LAST_7_DAYS } from './mock-data'

export interface ProductRank {
  productId: string
  name: string
  units: number
  revenue: number
}

/** Agrège les quantités et le CA vendus par produit sur l'historique des ventes. */
function aggregateByProduct(): Map<string, ProductRank> {
  const map = new Map<string, ProductRank>()
  // On initialise tous les produits (même ceux jamais vendus) pour repérer les stagnants
  for (const p of PRODUCTS) {
    map.set(p.id, { productId: p.id, name: p.name, units: 0, revenue: 0 })
  }
  for (const sale of SALES) {
    for (const item of sale.items) {
      const entry =
        map.get(item.productId) ??
        { productId: item.productId, name: item.name, units: 0, revenue: 0 }
      entry.units += item.qty
      entry.revenue += item.qty * item.unitPrice
      map.set(item.productId, entry)
    }
  }
  return map
}

export interface ReportInsights {
  avgBasket: number
  growthPercent: number
  bestSeller: ProductRank | null
  slowMover: ProductRank | null
  peakDay: { day: string; amount: number } | null
  totalRevenue7d: number
}

export function computeInsights(): ReportInsights {
  // Panier moyen = CA total / nombre de tickets
  const totalSales = SALES.reduce((s, x) => s + x.total, 0)
  const avgBasket = SALES.length ? Math.round(totalSales / SALES.length) : 0

  // Croissance : 30 derniers jours vs 30 jours précédents
  const last30 = DAILY_SALES.slice(-30).reduce((s, d) => s + d.total, 0)
  const prev30 = DAILY_SALES.slice(-60, -30).reduce((s, d) => s + d.total, 0)
  const growthPercent = prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 100) : 0

  // Meilleure vente / produit stagnant
  const ranks = [...aggregateByProduct().values()]
  const sorted = [...ranks].sort((a, b) => b.units - a.units)
  const bestSeller = sorted[0] ?? null
  const slowMover = sorted.length ? sorted[sorted.length - 1] : null

  // Jour le plus actif (sur les 7 derniers jours)
  const peak = [...SALES_LAST_7_DAYS].sort((a, b) => b.ventes - a.ventes)[0]
  const peakDay = peak ? { day: peak.day, amount: peak.ventes } : null

  const totalRevenue7d = SALES_LAST_7_DAYS.reduce((s, d) => s + d.ventes, 0)

  return {
    avgBasket,
    growthPercent,
    bestSeller,
    slowMover,
    peakDay,
    totalRevenue7d,
  }
}
