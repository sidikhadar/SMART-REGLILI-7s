import { DAILY_SALES, EXPENSES, SUPPLIERS, PRODUCTS, PAYMENT_TOTALS } from './mock-data'
import { daysUntil } from './format'
import type { PaymentMethod } from './types'

export interface FinanceBreakdown {
  salesRevenue: number
  debtsCollected: number
  expenses: number
  expiredLosses: number
  supplierDebts: number
  grossIncome: number
  totalDeductions: number
  netProfit: number
}

export interface MonthOption {
  /** Clé du mois au format YYYY-MM. */
  value: string
  /** Libellé lisible, ex. « Août 2026 ». */
  label: string
}

const MONTH_NAMES: Record<string, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
}

/** Formate une clé YYYY-MM en libellé lisible selon la langue. */
export function monthLabel(value: string, lang = 'fr'): string {
  const [y, m] = value.split('-')
  const names = MONTH_NAMES[lang] ?? MONTH_NAMES.fr
  const idx = Number.parseInt(m, 10) - 1
  return `${names[idx] ?? m} ${y}`
}

/**
 * Liste des mois pour lesquels des données de ventes existent,
 * du plus récent au plus ancien.
 */
export function availableMonths(lang = 'fr'): MonthOption[] {
  const set = new Set<string>()
  for (const d of DAILY_SALES) set.add(d.date.slice(0, 7)) // YYYY-MM
  return [...set]
    .sort((a, b) => (a < b ? 1 : -1)) // plus récent d'abord
    .map((value) => ({ value, label: monthLabel(value, lang) }))
}

/** Le mois le plus récent disponible (mois courant en principe). */
export function latestMonth(): string {
  const months = [...new Set(DAILY_SALES.map((d) => d.date.slice(0, 7)))].sort()
  return months[months.length - 1] ?? new Date().toISOString().slice(0, 7)
}

/** Modes de paiement correspondant à un compte de trésorerie réel. */
export type TreasuryMethod = Extract<
  PaymentMethod,
  'especes' | 'bankily' | 'sedad' | 'bik' | 'click' | 'masrivi' | 'amanety'
>

export const TREASURY_METHODS: TreasuryMethod[] = [
  'especes',
  'bankily',
  'sedad',
  'bik',
  'click',
  'masrivi',
  'amanety',
]

export interface TreasuryAccount {
  method: TreasuryMethod
  /** Ventes encaissées sur ce compte. */
  salesIn: number
  /** Dépenses réglées depuis ce compte. */
  expensesOut: number
  /** Solde détenu = ventes encaissées − dépenses réglées. */
  balance: number
}

export interface TreasurySummary {
  accounts: TreasuryAccount[]
  total: number
}

/**
 * Solde de trésorerie détenu par compte de paiement :
 * somme des ventes encaissées avec ce mode (PAYMENT_TOTALS déjà agrégé)
 * moins les dépenses réglées depuis ce compte (EXPENSES.method, défaut espèces).
 */
export function computeTreasury(): TreasurySummary {
  const accounts: TreasuryAccount[] = TREASURY_METHODS.map((method) => {
    const salesIn = PAYMENT_TOTALS[method] ?? 0
    const expensesOut = EXPENSES.filter(
      (e) => (e.method ?? 'especes') === method,
    ).reduce((sum, e) => sum + e.amount, 0)
    return { method, salesIn, expensesOut, balance: salesIn - expensesOut }
  })
  const total = accounts.reduce((sum, a) => sum + a.balance, 0)
  return { accounts, total }
}

/**
 * Calcul automatique du bénéfice net réel pour un mois donné :
 * Revenus ventes + Dettes récupérées - Dépenses - Pertes expirées - Dettes fournisseurs
 *
 * @param month clé YYYY-MM. Par défaut, le mois le plus récent disponible.
 *
 * Les valeurs sont dérivées des données mock. Certaines entrées (dettes
 * récupérées) sont simulées car il n'existe pas d'historique de recouvrement.
 */
export function computeFinances(month?: string): FinanceBreakdown {
  const targetMonth = month ?? latestMonth()

  // Revenus des ventes : total du mois sélectionné
  const monthSales = DAILY_SALES.filter((d) => d.date.startsWith(targetMonth))
  const salesRevenue = monthSales.reduce((sum, d) => sum + d.total, 0)

  // Nombre de jours du mois avec des ventes (pour proratiser les valeurs simulées)
  const isLatest = targetMonth === latestMonth()

  // Dettes récupérées (simulé — seulement affiché pour le mois courant)
  const debtsCollected = isLatest ? 5400 : Math.round(salesRevenue * 0.03)

  // Dépenses réelles enregistrées (mock daté sur le mois courant)
  const expenses = isLatest
    ? EXPENSES.reduce((sum, e) => sum + e.amount, 0)
    : Math.round(salesRevenue * 0.14)

  // Pertes : valeur d'achat des lots déjà expirés ou expirant sous 3 jours
  // (rattaché au mois courant, car les lots ne portent pas de date mensuelle)
  const expiredLosses = isLatest
    ? PRODUCTS.reduce((sum, p) => {
        const lostQty = p.lots
          .filter((l) => l.expiry && daysUntil(l.expiry) <= 3)
          .reduce((q, l) => q + l.quantity, 0)
        return sum + lostQty * p.buyPrice
      }, 0)
    : 0

  // Dettes fournisseurs restant à payer (solde courant uniquement)
  const supplierDebts = isLatest
    ? SUPPLIERS.reduce((sum, s) => sum + s.balance, 0)
    : 0

  const grossIncome = salesRevenue + debtsCollected
  const totalDeductions = expenses + expiredLosses + supplierDebts
  const netProfit = grossIncome - totalDeductions

  return {
    salesRevenue,
    debtsCollected,
    expenses,
    expiredLosses,
    supplierDebts,
    grossIncome,
    totalDeductions,
    netProfit,
  }
}
