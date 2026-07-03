'use client'

import { useMemo, useState } from 'react'
import { X, ClipboardCheck, FileText, Check, ScanLine } from 'lucide-react'
import type { Product } from '@/lib/types'
import { productStock } from '@/lib/format'
import { cn } from '@/lib/utils'

export function InventoryMode({
  products,
  t,
  onClose,
  onApply,
}: {
  products: Product[]
  t: (k: string) => string
  onClose: () => void
  onApply: (adjusted: Record<string, number>) => void
}) {
  // quantités comptées saisies par le patron (clé = id produit)
  const [counts, setCounts] = useState<Record<string, string>>({})

  const rows = useMemo(
    () =>
      products.map((p) => {
        const theoretical = productStock(p.lots)
        const raw = counts[p.id]
        const counted = raw === undefined || raw === '' ? null : Number(raw)
        const diff = counted === null ? null : counted - theoretical
        return { product: p, theoretical, counted, diff }
      }),
    [products, counts],
  )

  const countedRows = rows.filter((r) => r.counted !== null)
  const diffRows = countedRows.filter((r) => r.diff !== 0)

  function setCount(id: string, value: string) {
    setCounts((prev) => ({ ...prev, [id]: value }))
  }

  async function generatePDF() {
    // Génère un vrai fichier PDF téléchargeable (fonctionne dans l'iframe d'aperçu)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const marginX = 40
    let y = 50

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(21, 35, 58)
    doc.text(`SMART REGLILI - ${t('inventory_report')}`, marginX, y)

    y += 18
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(98, 116, 142)
    doc.text(new Date().toLocaleString('fr-FR'), marginX, y)

    // En-tête du tableau
    y += 26
    const cols = [marginX, marginX + 230, marginX + 330, marginX + 430]
    doc.setFillColor(238, 242, 248)
    doc.rect(marginX, y - 14, pageW - marginX * 2, 22, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(21, 35, 58)
    doc.text(t('product_name'), cols[0] + 4, y)
    doc.text(t('theoretical_qty'), cols[1], y)
    doc.text(t('counted_qty'), cols[2], y)
    doc.text(t('difference'), cols[3], y)
    y += 18

    // Lignes
    doc.setFont('helvetica', 'normal')
    countedRows.forEach((r) => {
      if (y > 780) {
        doc.addPage()
        y = 50
      }
      const diff = r.diff ?? 0
      const sign = diff > 0 ? '+' : ''
      doc.setTextColor(21, 35, 58)
      doc.text(String(r.product.name).slice(0, 38), cols[0] + 4, y)
      doc.text(String(r.theoretical), cols[1], y)
      doc.text(String(r.counted), cols[2], y)
      if (diff === 0) doc.setTextColor(21, 35, 58)
      else if (diff > 0) doc.setTextColor(30, 126, 62)
      else doc.setTextColor(220, 38, 38)
      doc.text(`${sign}${diff}`, cols[3], y)
      doc.setDrawColor(227, 233, 241)
      doc.line(marginX, y + 6, pageW - marginX, y + 6)
      y += 22
    })

    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(98, 116, 142)
    doc.text(
      `${countedRows.length} ${t('items_counted')} - ${diffRows.length} ${t('difference')}`,
      marginX,
      y,
    )

    // Le téléchargement direct (doc.save) est bloqué dans l'iframe d'aperçu.
    // On génère un blob puis : nouvel onglet si on est dans une iframe,
    // sinon téléchargement classique.
    const fileName = `inventaire-${new Date().toISOString().slice(0, 10)}.pdf`
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const inIframe = window.self !== window.top
    if (inIframe) {
      window.open(url, '_blank')
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  function finish() {
    const adjusted: Record<string, number> = {}
    countedRows.forEach((r) => {
      if (r.counted !== null) adjusted[r.product.id] = r.counted
    })
    onApply(adjusted)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-brand">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('inventory_mode')}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Liste à compter */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-2 text-sm text-accent-foreground">
          <ScanLine className="h-4 w-4 shrink-0" />
          {t('inventory_desc')}
        </p>

        <div className="space-y-2">
          {rows.map(({ product, theoretical, counted, diff }) => (
            <div
              key={product.id}
              className="rounded-2xl border border-border bg-card p-3 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('theoretical_qty')}: {theoretical}
                  </p>
                </div>
                <input
                  value={counts[product.id] ?? ''}
                  onChange={(e) => setCount(product.id, e.target.value)}
                  inputMode="numeric"
                  placeholder={t('counted_qty')}
                  className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-center text-base font-bold tabular-nums text-foreground outline-none focus:border-brand"
                />
              </div>
              {counted !== null && diff !== null && (
                <div
                  className={cn(
                    'mt-2 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium',
                    diff === 0
                      ? 'bg-muted text-muted-foreground'
                      : diff > 0
                        ? 'bg-brand/10 text-brand'
                        : 'bg-destructive/10 text-destructive',
                  )}
                >
                  <span>
                    {diff === 0
                      ? t('no_difference')
                      : diff > 0
                        ? t('surplus')
                        : t('shortage')}
                  </span>
                  <span className="font-heading font-bold tabular-nums">
                    {diff > 0 ? '+' : ''}
                    {diff}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-border bg-card px-4 py-3">
        <p className="mb-2 text-center text-xs text-muted-foreground">
          {countedRows.length} {t('items_counted')}
          {diffRows.length > 0 && ` · ${diffRows.length} ${t('difference')}`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generatePDF}
            disabled={countedRows.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {t('generate_pdf')}
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={countedRows.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-soft hover:brightness-110 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {t('finish_inventory')}
          </button>
        </div>
      </div>
    </div>
  )
}
