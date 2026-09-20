'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { X, Package, Truck, Minus, Plus, Send } from 'lucide-react'
import type { Product, Supplier, PurchaseOrder } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Bon de commande fournisseur généré depuis une alerte de stock bas.
 * Bloc indépendant : ne touche ni aux lots ni à la logique de stock.
 * Le résumé est partagé via l'API Web Share (repli WhatsApp), même pattern
 * que le bouton Partager des factures.
 */
export function PurchaseOrderSheet({
  product,
  suppliers,
  shopName,
  t,
  onClose,
  onSent,
}: {
  product: Product
  suppliers: Supplier[]
  shopName: string
  t: (k: string) => string
  onClose: () => void
  /** Notifié quand le bon a été envoyé (statut passe à 'sent'). */
  onSent?: (order: PurchaseOrder) => void
}) {
  const currentStock = useMemo(
    () => product.lots.reduce((sum, l) => sum + l.quantity, 0),
    [product],
  )
  // Quantité recommandée simple : seuil de stock bas × 3, ajustable.
  const recommended = Math.max(1, product.lowStockThreshold * 3)
  const [quantity, setQuantity] = useState(recommended)
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '')

  const supplier = suppliers.find((s) => s.id === supplierId) ?? null

  function buildText() {
    const lines = [
      t('po_summary_hello'),
      '',
      `${t('po_product')}: ${product.name}`,
      `${t('po_qty')}: ${quantity} ${t('po_units')}`,
      '',
      `${t('po_summary_from')}: ${shopName}`,
    ]
    return lines.join('\n')
  }

  async function handleShare() {
    if (!supplier) return
    onSent?.({
      id: `po-${Date.now()}`,
      productId: product.id,
      supplierId,
      quantity,
      date: new Date().toISOString(),
      status: 'sent',
    })

    const text = buildText()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('po_title'), text })
        return
      } catch {
        // annulé → repli WhatsApp
      }
    }
    // Repli : ouvrir WhatsApp, pré-adressé au fournisseur si son numéro existe.
    const phone = supplier.phone?.replace(/[^\d]/g, '')
    const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
    window.open(`${base}?text=${encodeURIComponent(text)}`, '_blank')
  }

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
              {t('po_title')}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {t('po_subtitle')}
            </p>
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
          {/* Produit concerné */}
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
              {t('po_product')}
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                {product.image ? (
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('po_current_stock')}: {currentStock} {t('po_units')}
                </p>
              </div>
            </div>
          </div>

          {/* Quantité recommandée (ajustable) */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              {t('po_qty')}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))
                }
                className="h-11 w-full rounded-xl border border-border bg-background text-center text-base font-bold tabular-nums text-foreground outline-none transition-colors focus:border-brand"
              />
              <button
                type="button"
                aria-label="+"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {t('po_qty_hint')}
            </p>
          </div>

          {/* Sélecteur de fournisseur */}
          <div className="mb-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              {t('po_supplier')}
            </label>
            <div className="space-y-2">
              {suppliers.map((s) => {
                const active = s.id === supplierId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSupplierId(s.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors',
                      active
                        ? 'border-brand bg-brand/5'
                        : 'border-border bg-background hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        active
                          ? 'bg-brand/15 text-brand'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Truck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {s.name}
                      </p>
                      {s.phone && (
                        <p className="truncate text-xs text-muted-foreground">
                          {s.phone}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'h-4 w-4 shrink-0 rounded-full border-2',
                        active ? 'border-brand bg-brand' : 'border-border',
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action : envoyer par WhatsApp */}
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={handleShare}
            disabled={!supplier}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-brand-foreground transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {t('po_send_whatsapp')}
          </button>
        </div>
      </div>
    </div>
  )
}
