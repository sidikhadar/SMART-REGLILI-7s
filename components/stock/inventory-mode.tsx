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

  function generatePDF() {
    const date = new Date().toLocaleString('fr-FR')
    const body = countedRows
      .map((r) => {
        const diff = r.diff ?? 0
        const color = diff === 0 ? '#15233a' : diff > 0 ? '#1e7e3e' : '#dc2626'
        const sign = diff > 0 ? '+' : ''
        return `<tr>
          <td>${r.product.name}</td>
          <td style="text-align:center">${r.theoretical}</td>
          <td style="text-align:center">${r.counted}</td>
          <td style="text-align:center;color:${color};font-weight:700">${sign}${diff}</td>
        </tr>`
      })
      .join('')

    const html = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>${t('inventory_report')}</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#15233a;padding:32px;}
        h1{font-size:20px;margin:0 0 4px;}
        .meta{color:#62748e;font-size:13px;margin-bottom:20px;}
        table{width:100%;border-collapse:collapse;font-size:14px;}
        th{text-align:left;background:#eef2f8;padding:10px;border-bottom:2px solid #e3e9f1;}
        th.c{text-align:center;}
        td{padding:9px 10px;border-bottom:1px solid #e3e9f1;}
        .summary{margin-top:20px;font-size:13px;color:#62748e;}
      </style></head><body>
      <h1>SMART REGLILI — ${t('inventory_report')}</h1>
      <div class="meta">${date}</div>
      <table>
        <thead><tr>
          <th>${t('product_name')}</th>
          <th class="c">${t('theoretical_qty')}</th>
          <th class="c">${t('counted_qty')}</th>
          <th class="c">${t('difference')}</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
      <div class="summary">${countedRows.length} ${t('items_counted')} · ${diffRows.length} ${t('difference')}</div>
      </body></html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => w.print(), 400)
    }
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
