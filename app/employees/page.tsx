'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/lib/app-context'
import { EMPLOYEES, REGISTERS } from '@/lib/mock-data'
import type { Employee, Role } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Plus,
  UserCog,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Crown,
  ScanLine,
} from 'lucide-react'

export default function EmployeesPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Employee[]>(EMPLOYEES)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('caissier')
  const [register, setRegister] = useState<string>(REGISTERS[0]?.name ?? '')
  const [toDelete, setToDelete] = useState<Employee | null>(null)

  const activeCount = useMemo(
    () => items.filter((e) => e.active).length,
    [items],
  )

  function addEmployee() {
    const n = name.trim()
    if (!n) return
    setItems((prev) => [
      {
        id: `emp-${Date.now()}`,
        name: n,
        role,
        register: role === 'caissier' ? register || undefined : undefined,
        active: true,
      },
      ...prev,
    ])
    setName('')
    setRole('caissier')
    setRegister(REGISTERS[0]?.name ?? '')
    setOpen(false)
  }

  function toggleActive(id: string) {
    setItems((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)),
    )
  }

  return (
    <AppShell title={t('employees')}>
      {/* En-tête : total + bouton ajouter */}
      <div className="mb-4 rounded-3xl border border-navy/25 bg-navy/5 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/15 text-navy">
                <UserCog className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {t('employees')}
              </p>
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold tabular-nums text-foreground">
              {activeCount}
              <span className="text-base font-medium text-muted-foreground">
                {' '}
                / {items.length} {t('emp_active').toLowerCase()}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 font-semibold text-brand-foreground shadow-soft transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('emp_add')}</span>
          </button>
        </div>
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {items.length} {t('emp_count')}
      </p>

      {/* Liste */}
      <div className="space-y-3">
        {items.map((e) => {
          const isBoss = e.role === 'patron'
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                      isBoss
                        ? 'bg-brand/15 text-brand'
                        : 'bg-navy/10 text-navy',
                    )}
                  >
                    {isBoss ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <UserCog className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {e.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {isBoss ? t('role_patron') : t('role_caissier')}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    e.active
                      ? 'bg-brand/10 text-brand'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {e.active ? t('emp_active') : t('emp_inactive')}
                </span>
              </div>

              {/* Caisse assignée */}
              {!isBoss && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                  <ScanLine className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('emp_register')} :
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {e.register ?? t('emp_none_register')}
                  </span>
                </div>
              )}

              {/* Actions (jamais sur le patron) */}
              {!isBoss && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(e.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {e.active ? t('emp_inactive') : t('emp_active')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(e)}
                    aria-label={t('delete')}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal ajout */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            dir={dir}
            className="mt-6 w-full max-w-md animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-foreground">
                {t('emp_add')}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('emp_name')}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('emp_role')}
                </label>
                <div className="flex gap-2">
                  {(['caissier', 'patron'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                        role === r
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {r === 'patron' ? t('role_patron') : t('role_caissier')}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'caissier' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t('emp_register')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REGISTERS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegister(r.name)}
                        className={cn(
                          'rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
                          register === r.name
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addEmployee}
              disabled={!name.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setToDelete(null)}
        >
          <div
            dir={dir}
            className="w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 text-center shadow-soft-lg"
            onClick={(ev) => ev.stopPropagation()}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-foreground">
              {t('delete')}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{toDelete.name}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-2xl border border-border bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
                  setToDelete(null)
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-destructive py-3 font-semibold text-destructive-foreground transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <Trash2 className="h-5 w-5" />
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
