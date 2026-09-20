'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import type { Invoice } from '@/lib/invoice-utils'
import { exportInvoicesXlsx, exportInvoicesPdf } from '@/lib/export-utils'
import { cn } from '@/lib/utils'

/**
 * Bouton « Exporter » + menu déroulant (Excel / PDF).
 * Exporte exactement la liste `invoices` qu'on lui passe : l'appelant est
 * responsable d'appliquer les filtres de date en cours avant de la fournir.
 */
export function ExportMenu({
  invoices,
  filename,
  title,
  shopName,
  t,
  lang,
}: {
  invoices: Invoice[]
  filename: string
  title: string
  shopName: string
  t: (k: string) => string
  lang: string
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'xlsx' | 'pdf' | null>(null)
  const disabled = invoices.length === 0

  async function run(kind: 'xlsx' | 'pdf') {
    if (busy) return
    setBusy(kind)
    try {
      const opts = { filename, title, shopName, t, lang }
      if (kind === 'xlsx') await exportInvoicesXlsx(invoices, opts)
      else await exportInvoicesPdf(invoices, opts)
      setOpen(false)
    } catch (err) {
      console.error('[v0] export failed', err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-muted disabled:opacity-40',
        )}
      >
        <Download className="h-4 w-4" />
        {t('exp_export')}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <>
          {/* Fermeture au clic extérieur */}
          <button
            type="button"
            aria-label={t('close')}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute end-0 z-50 mt-1.5 w-60 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-soft"
          >
            <MenuItem
              icon={FileSpreadsheet}
              label={t('exp_excel')}
              loading={busy === 'xlsx'}
              onClick={() => run('xlsx')}
            />
            <MenuItem
              icon={FileText}
              label={t('exp_pdf')}
              loading={busy === 'pdf'}
              onClick={() => run('pdf')}
            />
          </div>
        </>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  loading,
  onClick,
}: {
  icon: typeof FileText
  label: string
  loading?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className={cn('h-4 w-4', loading && 'animate-pulse')} />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  )
}
