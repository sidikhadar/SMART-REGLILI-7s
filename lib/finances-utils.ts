import { DAILY_SALES, EXPENSES, SUPPLIERS, PRODUCTS } from './mock-data'
import { daysUntil } from './format'

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

/**
 * Calcul automatique du bénéfice net réel :
 * Revenus ventes + Dettes récupérées - Dépenses - Pertes expirées - Dettes fournisseurs
 *
 * Les valeurs sont dérivées des données mock. Certaines entrées (dettes
 * récupérées) sont simulées car il n'existe pas d'historique de recouvrement.
 */
export function computeFinances(): FinanceBreakdown {
  // Revenus des ventes : total des 30 derniers jours
  const last30 = DAILY_SALES.slice(-30)
  const salesRevenue = last30.reduce((sum, d) => sum + d.total, 0)

  // Dettes récupérées ce mois-ci (simulé)
  const debtsCollected = 5400

  // Dépenses réelles enregistrées
  const expenses = EXPENSES.reduce((sum, e) => sum + e.amount, 0)

  // Pertes : valeur d'achat des lots déjà expirés ou expirant sous 3 jours
  const expiredLosses = PRODUCTS.reduce((sum, p) => {
    const lostQty = p.lots
      .filter((l) => l.expiry && daysUntil(l.expiry) <= 3)
      .reduce((q, l) => q + l.quantity, 0)
    return sum + lostQty * p.buyPrice
  }, 0)

  // Dettes fournisseurs restant à payer
  const supplierDebts = SUPPLIERS.reduce((sum, s) => sum + s.balance, 0)

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
