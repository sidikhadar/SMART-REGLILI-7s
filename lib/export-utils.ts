import type { Invoice } from './invoice-utils'
import { formatMRU, formatDate } from './format'

/**
 * Colonnes exportées pour chaque facture/vente :
 * date, numéro de facture, client, montant total, montant payé,
 * mode de paiement, statut.
 *
 * Bloc indépendant : la génération de fichier se fait entièrement côté
 * client (SheetJS pour le .xlsx, jsPDF pour le .pdf). La même structure
 * de données (`toRows`) pourra être réutilisée telle quelle si la
 * génération est un jour déplacée côté backend.
 */

export interface ExportOptions {
  /** Nom de fichier sans extension, ex. « factures-2026-08 ». */
  filename: string
  /** Titre affiché en tête du document (PDF). */
  title: string
  /** Nom du commerce, affiché en tête du PDF. */
  shopName: string
  t: (k: string) => string
  lang: string
}

/** En-têtes de colonnes localisés, dans l'ordre d'export. */
function headers(t: (k: string) => string): string[] {
  return [
    t('exp_col_date'),
    t('exp_col_number'),
    t('exp_col_client'),
    t('exp_col_total'),
    t('exp_col_paid'),
    t('exp_col_method'),
    t('exp_col_status'),
  ]
}

/** Convertit une facture en cellules ordonnées (montants numériques bruts). */
function toRow(inv: Invoice, t: (k: string) => string, lang: string) {
  return {
    date: formatDate(inv.date, lang),
    number: inv.number,
    client: inv.clientName || t('inv_walkin'),
    total: inv.total,
    paid: inv.paid,
    method: t(`pay_${inv.method}`),
    status: t(`inv_status_${inv.status}`),
  }
}

/** Structure de données tabulaire réutilisable (backend-ready). */
export function toRows(invoices: Invoice[], t: (k: string) => string, lang: string) {
  return invoices.map((inv) => toRow(inv, t, lang))
}

/** Export Excel (.xlsx) via SheetJS, chargé à la demande. */
export async function exportInvoicesXlsx(
  invoices: Invoice[],
  { filename, t, lang }: ExportOptions,
) {
  const XLSX = await import('xlsx')
  const rows = toRows(invoices, t, lang)

  const totalSum = invoices.reduce((s, i) => s + i.total, 0)
  const paidSum = invoices.reduce((s, i) => s + i.paid, 0)

  const aoa: (string | number)[][] = [
    headers(t),
    ...rows.map((r) => [r.date, r.number, r.client, r.total, r.paid, r.method, r.status]),
    [],
    [t('exp_total_row'), '', '', totalSum, paidSum, '', ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [
    { wch: 14 }, // date
    { wch: 12 }, // numéro
    { wch: 22 }, // client
    { wch: 14 }, // total
    { wch: 14 }, // payé
    { wch: 14 }, // mode
    { wch: 12 }, // statut
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, t('exp_sheet_name').slice(0, 31))
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/** Export PDF via jsPDF (déjà installé), chargé à la demande. */
export async function exportInvoicesPdf(
  invoices: Invoice[],
  { filename, title, shopName, t, lang }: ExportOptions,
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 40
  let y = 48

  // En-tête
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(shopName, marginX, y)
  y += 20
  doc.setFontSize(12)
  doc.setTextColor(90)
  doc.text(title, marginX, y)
  doc.setTextColor(0)
  y += 24

  // Colonnes (largeurs proportionnelles à la page)
  const cols = [
    { key: 'date', label: t('exp_col_date'), w: 0.14, align: 'left' as const },
    { key: 'number', label: t('exp_col_number'), w: 0.13, align: 'left' as const },
    { key: 'client', label: t('exp_col_client'), w: 0.22, align: 'left' as const },
    { key: 'total', label: t('exp_col_total'), w: 0.14, align: 'right' as const },
    { key: 'paid', label: t('exp_col_paid'), w: 0.14, align: 'right' as const },
    { key: 'method', label: t('exp_col_method'), w: 0.13, align: 'left' as const },
    { key: 'status', label: t('exp_col_status'), w: 0.1, align: 'left' as const },
  ]
  const usableWidth = pageWidth - marginX * 2
  let x = marginX
  const colX = cols.map((c) => {
    const start = x
    x += c.w * usableWidth
    return { ...c, x: start, width: c.w * usableWidth }
  })

  const rowHeight = 20

  function drawHeaderRow() {
    doc.setFillColor(20, 30, 60)
    doc.rect(marginX, y - 14, usableWidth, rowHeight, 'F')
    doc.setTextColor(255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    for (const c of colX) {
      const tx = c.align === 'right' ? c.x + c.width - 4 : c.x + 4
      doc.text(c.label, tx, y, { align: c.align })
    }
    doc.setTextColor(0)
    doc.setFont('helvetica', 'normal')
    y += rowHeight
  }

  drawHeaderRow()

  const rows = toRows(invoices, t, lang)
  doc.setFontSize(9)
  rows.forEach((r, idx) => {
    if (y > pageHeight - 60) {
      doc.addPage()
      y = 48
      drawHeaderRow()
    }
    if (idx % 2 === 1) {
      doc.setFillColor(244, 246, 250)
      doc.rect(marginX, y - 14, usableWidth, rowHeight, 'F')
    }
    const cells: Record<string, string> = {
      date: r.date,
      number: r.number,
      client: r.client,
      total: formatMRU(r.total),
      paid: formatMRU(r.paid),
      method: r.method,
      status: r.status,
    }
    for (const c of colX) {
      const raw = cells[c.key] ?? ''
      const maxChars = Math.floor(c.width / 5)
      const value = raw.length > maxChars ? `${raw.slice(0, maxChars - 1)}…` : raw
      const tx = c.align === 'right' ? c.x + c.width - 4 : c.x + 4
      doc.text(value, tx, y, { align: c.align })
    }
    y += rowHeight
  })

  // Ligne de total
  const totalSum = invoices.reduce((s, i) => s + i.total, 0)
  const paidSum = invoices.reduce((s, i) => s + i.paid, 0)
  if (y > pageHeight - 60) {
    doc.addPage()
    y = 48
  }
  y += 4
  doc.setDrawColor(200)
  doc.line(marginX, y - 14, marginX + usableWidth, y - 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const totalCol = colX[3]
  const paidCol = colX[4]
  doc.text(`${t('exp_total_row')}:`, colX[2].x + colX[2].width - 4, y, { align: 'right' })
  doc.text(`${formatMRU(totalSum)} ${t('mru')}`, totalCol.x + totalCol.width - 4, y, {
    align: 'right',
  })
  doc.text(`${formatMRU(paidSum)} ${t('mru')}`, paidCol.x + paidCol.width - 4, y, {
    align: 'right',
  })

  doc.save(`${filename}.pdf`)
}
