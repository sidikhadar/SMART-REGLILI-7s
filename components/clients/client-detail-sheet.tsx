'use client'

import { X, Phone, ShoppingBag, Wallet, MessageCircle, Receipt } from 'lucide-react'
import type { Client, Sale } from '@/lib/types'
import { formatMRU, formatDate, formatTime } from '@/lib/format'
import { clientSales, clientTotalPurchased, whatsappReminderUrl } from '@/lib/clients-utils'

export function ClientDetailSheet({
  client,
  sales,
  t,
  lang,
  onClose,
}: {
  client: Client
  sales: Sale[]
  t: (k: string) => string
  lang: string
  onClose: () => void
}) {
  const history = clientSales(sales, client.id)
  const totalPurchased = clientTotalPurchased(sales, client.id)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="min-h-dvh w-full max-w-lg bg-card p-5 shadow-soft-lg sm:min-h-0 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-heading text-lg font-extrabold text-brand">
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading text-lg font-extrabold text-foreground">
                {client.name}
              </h2>
              {client.phone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {client.phone}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Résumé chiffres */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-brand">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">{t('total_purchased')}</p>
            <p className="font-heading text-lg font-extrabold tabular-nums text-foreground">
              {formatMRU(totalPurchased)}
              <span className="ms-1 text-xs font-medium text-muted-foreground">{t('mru')}</span>
            </p>
          </div>
          <div
            className={`rounded-2xl border p-3 ${
              client.totalDebt > 0
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-border bg-background'
            }`}
          >
            <div
              className={`mb-1 flex h-7 w-7 items-center justify-center rounded-lg ${
                client.totalDebt > 0
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-accent text-brand'
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">{t('current_debt')}</p>
            <p
              className={`font-heading text-lg font-extrabold tabular-nums ${
                client.totalDebt > 0 ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {formatMRU(client.totalDebt)}
              <span className="ms-1 text-xs font-medium text-muted-foreground">{t('mru')}</span>
            </p>
          </div>
        </div>

        {/* Rappel WhatsApp (si dette) */}
        {client.totalDebt > 0 && client.phone && (
          <a
            href={whatsappReminderUrl(client.phone, client.name, client.totalDebt)}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <MessageCircle className="h-4 w-4" />
            {t('send_reminder')}
          </a>
        )}

        {/* Historique */}
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          {t('purchase_history')}
        </h3>
        <div className="space-y-2">
          {history.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-background p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(s.date, lang)} · {formatTime(s.date, lang)}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-brand">
                  {t(`pay_${s.method}`)}
                </span>
              </div>
              <ul className="mb-1.5 space-y-0.5">
                {s.items.map((it) => (
                  <li
                    key={it.productId}
                    className="flex justify-between text-sm text-foreground"
                  >
                    <span className="truncate">
                      {it.name} <span className="text-muted-foreground">×{it.qty}</span>
                    </span>
                    <span className="tabular-nums">{formatMRU(it.qty * it.unitPrice)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-border pt-1.5 text-sm font-semibold text-foreground">
                <span>{t('total')}</span>
                <span className="tabular-nums">
                  {formatMRU(s.total)} {t('mru')}
                </span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('no_purchases')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
