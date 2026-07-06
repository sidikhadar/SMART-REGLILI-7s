'use client'

import { X, Download, Share2, User } from 'lucide-react'
import type { Invoice } from '@/lib/invoice-utils'
import { formatMRU, formatDate, formatTime } from '@/lib/format'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'

export function InvoiceDetail({
  invoice,
  shopName,
  t,
  lang,
  onClose,
}: {
  invoice: Invoice
  shopName: string
  t: (k: string) => string
  lang: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label={t('close')}
        onClick={onClose}
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
      />

      {/* Feuille */}
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-soft sm:rounded-3xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold text-foreground">
              {t('inv_receipt')}
            </p>
            <p className="truncate text-sm text-muted-foreground">{invoice.number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps défilant */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* En-tête magasin / client */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('inv_from')}</p>
              <p className="font-semibold text-foreground">{shopName}</p>
            </div>
            <StatusBadge status={invoice.status} t={t} />
          </div>

          <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-muted/50 p-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('inv_to')}</p>
              <p className="flex items-center gap-1.5 font-semibold text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {invoice.clientName || t('inv_walkin')}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">{t('inv_date')}</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(invoice.date, lang)} · {formatTime(invoice.date, lang)}
              </p>
            </div>
          </div>

          {/* Lignes d'articles */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="flex items-center justify-between bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <span>{t('inv_items')}</span>
              <span>{t('total')}</span>
            </div>
            <div className="divide-y divide-border">
              {invoice.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                      {item.variantLabel && item.factor && item.factor > 1 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({item.variantLabel})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} × {formatMRU(item.unitPrice)} {t('mru')}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {formatMRU(item.qty * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="mt-4 space-y-1.5">
            <TotalRow label={t('subtotal')} value={invoice.total} mru={t('mru')} />
            <TotalRow
              label={t('total')}
              value={invoice.total}
              mru={t('mru')}
              strong
            />
            <TotalRow
              label={t('inv_paid')}
              value={invoice.paid}
              mru={t('mru')}
              tone="brand"
            />
            {invoice.remaining > 0 && (
              <TotalRow
                label={t('remaining')}
                value={invoice.remaining}
                mru={t('mru')}
                tone="danger"
              />
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('inv_thanks')}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            {t('inv_share')}
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground transition-transform active:scale-95"
          >
            <Download className="h-4 w-4" />
            {t('inv_download')}
          </button>
        </div>
      </div>
    </div>
  )
}

function TotalRow({
  label,
  value,
  mru,
  strong,
  tone,
}: {
  label: string
  value: number
  mru: string
  strong?: boolean
  tone?: 'brand' | 'danger'
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          'text-sm',
          strong ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          strong ? 'font-heading text-lg font-extrabold text-foreground' : 'text-sm font-medium',
          tone === 'brand' && 'text-brand',
          tone === 'danger' && 'text-destructive',
          !tone && !strong && 'text-foreground',
        )}
      >
        {formatMRU(value)} {mru}
      </span>
    </div>
  )
}
