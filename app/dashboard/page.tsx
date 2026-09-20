'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  TrendingUp,
  Wallet,
  Package,
  CreditCard,
  ArrowRight,
  Plus,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Users,
} from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { StatCard } from '@/components/stat-card'
import { SalesChart } from '@/components/sales-chart'
import {
  PRODUCTS,
  SALES,
  DEBTS,
  PAYMENT_TOTALS,
  ALERTS,
} from '@/lib/mock-data'
import { formatMRU, formatTime, productStock } from '@/lib/format'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { TopProductsSheet } from '@/components/dashboard/top-products-sheet'
import { buildInvoices } from '@/lib/invoice-utils'
import { cn } from '@/lib/utils'

const SHOP_NAME = 'SMART REGLILI'

export default function DashboardPage() {
  const { t, lang, dir, userName, role, addToCart } = useApp()
  const router = useRouter()
  const isCaissier = role === 'caissier'

  // Ajoute un top produit au panier de la caisse puis ouvre la page Caisse
  function sendToCaisse(productId: string) {
    const p = PRODUCTS.find((x) => x.id === productId)
    if (!p) return
    addToCart(p) // quantité initialisée à 1 (ou +1 si déjà présent)
    router.push('/caisse')
  }

  // ----- Calculs dérivés des données -----
  const todaySales = SALES.filter((s) => {
    const d = new Date(s.date)
    return Date.now() - d.getTime() < 24 * 3600 * 1000
  })
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0)
  const todayProfit = Math.round(todayTotal * 0.24)
  const clientsServed = todaySales.length
  const openDebts = DEBTS.filter((d) => d.status === 'open').reduce((s, d) => s + d.amount, 0)
  const stockValue = PRODUCTS.reduce(
    (sum, p) => sum + productStock(p.lots) * p.buyPrice,
    0,
  )

  // top produits (par quantité vendue dans les ventes)
  const qtyByProduct = new Map<string, number>()
  SALES.forEach((s) =>
    s.items.forEach((it) => {
      qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) || 0) + it.qty)
    }),
  )
  const topProducts = [...qtyByProduct.entries()]
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id)!, qty }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 2)
  const maxQty = Math.max(...topProducts.map((x) => x.qty), 1)

  // paiements (on retire les valeurs nulles)
  const payments = Object.entries(PAYMENT_TOTALS).filter(([, v]) => v > 0)
  const paymentMax = Math.max(...payments.map(([, v]) => v), 1)

  const recentSales = [...SALES].slice(0, 4)

  // Tickets : on retrouve la facture par son id (identique à sale.id)
  const invoices = useMemo(() => buildInvoices(), [])
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const selectedInvoice = invoices.find((i) => i.id === selectedSaleId) ?? null
  const [showTopProducts, setShowTopProducts] = useState(false)

  return (
    <AppShell title={t('dashboard')}>
      {/* En-tête de bienvenue */}
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          {t('dashboard')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {userName ? `${userName} · ` : ''}
          {new Date().toLocaleDateString(
            lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR',
            { weekday: 'long', day: 'numeric', month: 'long' },
          )}
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t('todays_sales')}
          value={formatMRU(todayTotal)}
          unit={t('currency')}
          icon={TrendingUp}
          tone="brand"
          trend={{ value: '+12%', up: true }}
        />
        {isCaissier ? (
          <StatCard
            label={t('clients_served')}
            value={String(clientsServed)}
            icon={Users}
            tone="navy"
            trend={{ value: '+5', up: true }}
          />
        ) : (
          <StatCard
            label={t('profit')}
            value={formatMRU(todayProfit)}
            unit={t('currency')}
            icon={Wallet}
            tone="navy"
            trend={{ value: '+8%', up: true }}
          />
        )}
        <StatCard
          label={t('products_count')}
          value={String(PRODUCTS.length)}
          icon={Package}
          tone="brand"
        />
        <StatCard
          label={t('open_debts')}
          value={formatMRU(openDebts)}
          unit={t('currency')}
          icon={CreditCard}
          tone="danger"
          trend={{ value: '-3%', up: false }}
        />
      </div>

      {/* Graphique + paiements */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">{t('sales_chart')}</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" /> {t('ventes')}
              </span>
              {!isCaissier && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy" /> {t('profit')}
                </span>
              )}
            </div>
          </div>
          <SalesChart showProfit={!isCaissier} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-heading text-base font-bold text-foreground">{t('by_payment')}</h2>
          <ul className="space-y-3">
            {payments.map(([method, value]) => (
              <li key={method}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{t(`pay_${method}`)}</span>
                  <span className="tabular-nums text-muted-foreground">{formatMRU(value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(value / paymentMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Top produits + ventes récentes */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">{t('top_products')}</h2>
            <button
              type="button"
              onClick={() => setShowTopProducts(true)}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {t('view_all')} <ArrowRight className="h-3.5 w-3.5 flip-rtl" />
            </button>
          </div>
          <ul className="space-y-3">
            {topProducts.map(({ product, qty }, i) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => sendToCaisse(product.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-1 text-start transition-colors hover:bg-muted"
                  title={t('add_to_cart')}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-brand">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {qty} {t('units_sold')}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(qty / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">{t('recent_sales')}</h2>
            <Link
              href="/sales"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {t('view_all')} <ArrowRight className="h-3.5 w-3.5 flip-rtl" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentSales.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedSaleId(s.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl py-2.5 text-start transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-brand">
                      <ShoppingCart className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.items.length} {t('products_count').toLowerCase()} · {s.cashier}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatTime(s.date, lang)} ·{' '}
                        {t(`pay_${s.method}`)}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                      {formatMRU(s.total)} {t('currency')}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flip-rtl" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Alertes + actions rapides */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">{t('alerts')}</h2>
            <Link
              href="/alerts"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {t('view_all')} <ArrowRight className="h-3.5 w-3.5 flip-rtl" />
            </Link>
          </div>
          <ul className="space-y-2">
            {ALERTS.slice(0, 4).map((a) => (
              <li
                key={a.id}
                className={cn(
                  'flex items-start gap-2 rounded-xl border p-3 text-sm',
                  a.level === 'danger'
                    ? 'border-destructive/20 bg-destructive/5 text-destructive'
                    : a.level === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-border bg-muted/40 text-foreground',
                )}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-snug">{a.message}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-heading text-base font-bold text-foreground">
            {t('quick_actions')}
          </h2>
          <div className="space-y-2">
            <Link
              href="/caisse"
              className="flex items-center gap-3 rounded-xl bg-brand px-4 py-3 font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <ShoppingCart className="h-5 w-5" /> {t('new_sale')}
            </Link>
            <Link
              href="/stock"
              className="flex items-center gap-3 rounded-xl border-2 border-brand/40 px-4 py-3 font-semibold text-brand transition-colors hover:bg-brand/5"
            >
              <Plus className="h-5 w-5" /> {t('add_product')}
            </Link>
            <div className="mt-3 rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t('stock_value')}</p>
              <p className="mt-0.5 font-heading text-xl font-extrabold text-foreground">
                {formatMRU(stockValue)}{' '}
                <span className="text-sm font-semibold text-muted-foreground">{t('currency')}</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Ticket de la vente sélectionnée (lecture seule) */}
      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          shopName={SHOP_NAME}
          t={t}
          lang={lang}
          onClose={() => setSelectedSaleId(null)}
        />
      )}

      {/* Tous les produits classés par ventes */}
      {showTopProducts && (
        <TopProductsSheet
          products={PRODUCTS}
          sales={SALES}
          t={t}
          dir={dir}
          onClose={() => setShowTopProducts(false)}
        />
      )}
    </AppShell>
  )
}
