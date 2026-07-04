'use client'

import { useMemo, useState } from 'react'
import { MessageCircle, CheckCircle2, Package, Truck, Calendar } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { PaymentModal } from '@/components/debts/payment-modal'
import { DEBTS, SUPPLIERS, SALES, CLIENTS } from '@/lib/mock-data'
import { formatMRU, formatDate } from '@/lib/format'
import { whatsappReminderUrl } from '@/lib/clients-utils'
import type { Debt, Supplier } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = 'clients' | 'suppliers'

// produits concernés par une dette (via la vente liée)
function debtProducts(saleId?: string): string[] {
  if (!saleId) return []
  const sale = SALES.find((s) => s.id === saleId)
  return sale ? sale.items.map((i) => `${i.name} ×${i.qty}`) : []
}

function clientPhone(clientId: string): string | undefined {
  return CLIENTS.find((c) => c.id === clientId)?.phone
}

export default function DebtsPage() {
  const { t, lang } = useApp()
  const [tab, setTab] = useState<Tab>('clients')
  const [debts, setDebts] = useState<Debt[]>(DEBTS.filter((d) => d.status === 'open'))
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS)

  // cible du paiement en cours
  const [payDebt, setPayDebt] = useState<Debt | null>(null)
  const [paySupplier, setPaySupplier] = useState<Supplier | null>(null)

  const totalToCollect = useMemo(
    () => debts.reduce((sum, d) => sum + d.amount, 0),
    [debts],
  )
  const totalToPay = useMemo(
    () => suppliers.reduce((sum, s) => sum + s.balance, 0),
    [suppliers],
  )

  function handleDebtPayment(paid: number) {
    if (!payDebt) return
    setDebts((prev) =>
      prev
        .map((d) =>
          d.id === payDebt.id ? { ...d, amount: Math.max(0, d.amount - paid) } : d,
        )
        .filter((d) => d.amount > 0),
    )
    setPayDebt(null)
  }

  function handleSupplierPayment(paid: number) {
    if (!paySupplier) return
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === paySupplier.id
          ? { ...s, balance: Math.max(0, s.balance - paid) }
          : s,
      ),
    )
    setPaySupplier(null)
  }

  const supplierDebts = suppliers.filter((s) => s.balance > 0)

  return (
    <AppShell title={t('debts')}>
      {/* Onglets */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-card p-1">
        <TabButton active={tab === 'clients'} onClick={() => setTab('clients')}>
          {t('client_debts')}
        </TabButton>
        <TabButton active={tab === 'suppliers'} onClick={() => setTab('suppliers')}>
          {t('supplier_debts')}
        </TabButton>
      </div>

      {/* Total en haut, en rouge */}
      <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {tab === 'clients' ? t('to_collect') : t('to_pay')}
        </p>
        <p className="font-heading text-3xl font-extrabold tabular-nums text-destructive">
          {formatMRU(tab === 'clients' ? totalToCollect : totalToPay)}{' '}
          <span className="text-base font-medium text-muted-foreground">{t('mru')}</span>
        </p>
        {tab === 'suppliers' && (
          <p className="mt-1 text-xs text-muted-foreground">{t('deducted_note')}</p>
        )}
      </div>

      {/* Contenu onglet */}
      {tab === 'clients' ? (
        <div className="space-y-2.5">
          {debts.map((d) => {
            const products = debtProducts(d.saleId)
            const phone = clientPhone(d.clientId)
            return (
              <div
                key={d.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{d.clientName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(d.date, lang)}
                    </p>
                  </div>
                  <p className="shrink-0 font-heading text-lg font-extrabold tabular-nums text-destructive">
                    {formatMRU(d.amount)} {t('mru')}
                  </p>
                </div>

                {products.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {products.map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <Package className="h-3 w-3" />
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {phone && (
                    <a
                      href={whatsappReminderUrl(phone, d.clientName, d.amount)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand/10 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t('send_reminder')}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setPayDebt(d)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.99]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('mark_paid')}
                  </button>
                </div>
              </div>
            )
          })}
          {debts.length === 0 && <EmptyState label={t('all_settled')} t={t} />}
        </div>
      ) : (
        <div className="space-y-2.5">
          {supplierDebts.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-brand">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{s.name}</p>
                    {s.phone && (
                      <p className="truncate text-xs text-muted-foreground">{s.phone}</p>
                    )}
                  </div>
                </div>
                <p className="shrink-0 font-heading text-lg font-extrabold tabular-nums text-destructive">
                  {formatMRU(s.balance)} {t('mru')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaySupplier(s)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('mark_paid')}
              </button>
            </div>
          ))}
          {supplierDebts.length === 0 && <EmptyState label={t('all_settled')} t={t} />}
        </div>
      )}

      {payDebt && (
        <PaymentModal
          title={payDebt.clientName}
          amount={payDebt.amount}
          t={t}
          onClose={() => setPayDebt(null)}
          onConfirm={handleDebtPayment}
        />
      )}
      {paySupplier && (
        <PaymentModal
          title={paySupplier.name}
          amount={paySupplier.balance}
          t={t}
          onClose={() => setPaySupplier(null)}
          onConfirm={handleSupplierPayment}
        />
      )}
    </AppShell>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
        active
          ? 'bg-brand text-brand-foreground shadow-soft'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ label, t }: { label: string; t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <CheckCircle2 className="h-10 w-10 text-brand" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{t('no_debts')}</p>
    </div>
  )
}
