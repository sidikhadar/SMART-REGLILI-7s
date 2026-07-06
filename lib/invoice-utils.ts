import type { Sale, SaleItem } from './types'
import { SALES, CLIENTS } from './mock-data'

export type InvoiceStatus = 'paid' | 'partial' | 'unpaid'

export interface Invoice {
  id: string
  number: string
  date: string
  clientId?: string
  clientName: string
  items: SaleItem[]
  total: number
  paid: number
  remaining: number
  status: InvoiceStatus
  method: string
  cashier: string
}

/** Statut de paiement dérivé du montant payé vs total. */
function statusOf(total: number, paid: number): InvoiceStatus {
  const effectivePaid = Math.min(paid, total)
  if (effectivePaid >= total) return 'paid'
  if (effectivePaid <= 0) return 'unpaid'
  return 'partial'
}

/**
 * Construit la liste des factures à partir de l'historique des ventes.
 * Chaque vente devient une facture numérotée. Le paiement peut dépasser le
 * total (rendu de monnaie) : on plafonne donc le "payé" au total facturé.
 */
export function buildInvoices(sales: Sale[] = SALES): Invoice[] {
  return sales
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((s, i) => {
      const client = s.clientId
        ? CLIENTS.find((c) => c.id === s.clientId)
        : undefined
      const paid = Math.min(s.paid, s.total)
      return {
        id: s.id,
        number: `INV-${String(sales.length - i).padStart(4, '0')}`,
        date: s.date,
        clientId: s.clientId,
        clientName: client?.name ?? '',
        items: s.items,
        total: s.total,
        paid,
        remaining: Math.max(s.total - paid, 0),
        status: statusOf(s.total, s.paid),
        method: s.method,
        cashier: s.cashier,
      }
    })
}

export interface InvoiceSummary {
  count: number
  billed: number
  collected: number
  outstanding: number
}

export function summarize(invoices: Invoice[]): InvoiceSummary {
  return invoices.reduce(
    (acc, inv) => ({
      count: acc.count + 1,
      billed: acc.billed + inv.total,
      collected: acc.collected + inv.paid,
      outstanding: acc.outstanding + inv.remaining,
    }),
    { count: 0, billed: 0, collected: 0, outstanding: 0 },
  )
}
