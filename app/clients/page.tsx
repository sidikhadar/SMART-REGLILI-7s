'use client'

import { useMemo, useState } from 'react'
import { Search, UserPlus, Phone, ChevronRight, MessageCircle } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import { AppShell } from '@/components/app-shell'
import { AddClientSheet } from '@/components/clients/add-client-sheet'
import { ClientDetailSheet } from '@/components/clients/client-detail-sheet'
import { CLIENTS, SALES } from '@/lib/mock-data'
import { formatMRU } from '@/lib/format'
import { whatsappReminderUrl } from '@/lib/clients-utils'
import type { Client } from '@/lib/types'

export default function ClientsPage() {
  const { t, lang } = useApp()
  const [clients, setClients] = useState<Client[]>(CLIENTS)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')),
    )
  }, [clients, query])

  function handleAdd(c: Client) {
    setClients((prev) => [c, ...prev])
    setAddOpen(false)
  }

  return (
    <AppShell title={t('clients')}>
      {/* Action ajouter */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99]"
      >
        <UserPlus className="h-4 w-4" />
        {t('add_client')}
      </button>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_client')}
          className="w-full rounded-xl border border-border bg-card py-3 ps-11 pe-4 text-base text-foreground shadow-soft outline-none focus:border-brand"
        />
      </div>

      {/* Liste clients */}
      <div className="space-y-2.5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft"
          >
            <button
              type="button"
              onClick={() => setSelected(c)}
              className="flex min-w-0 flex-1 items-center gap-3 text-start"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-extrabold text-brand">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{c.name}</p>
                {c.phone && (
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </p>
                )}
              </div>
              <div className="text-end">
                <p className="text-[11px] text-muted-foreground">{t('current_debt')}</p>
                <p
                  className={`font-heading text-sm font-extrabold tabular-nums ${
                    c.totalDebt > 0 ? 'text-destructive' : 'text-brand'
                  }`}
                >
                  {formatMRU(c.totalDebt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
            </button>
            {c.totalDebt > 0 && c.phone && (
              <a
                href={whatsappReminderUrl(c.phone, c.name, c.totalDebt)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('send_reminder')}
                onClick={(e) => e.stopPropagation()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors hover:bg-brand/20"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('no_clients')}
          </p>
        )}
      </div>

      {addOpen && (
        <AddClientSheet t={t} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      )}
      {selected && (
        <ClientDetailSheet
          client={selected}
          sales={SALES}
          t={t}
          lang={lang}
          onClose={() => setSelected(null)}
        />
      )}
    </AppShell>
  )
}
