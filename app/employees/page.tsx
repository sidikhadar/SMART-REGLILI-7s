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
  Phone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'

export default function EmployeesPage() {
  const { t, dir } = useApp()

  const [items, setItems] = useState<Employee[]>(EMPLOYEES)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('caissier')
  const [register, setRegister] = useState<string>(REGISTERS[0]?.name ?? '')
  const [toDelete, setToDelete] = useState<Employee | null>(null)
  const [toReset, setToReset] = useState<Employee | null>(null)
  const [showPw, setShowPw] = useState<Record<string, boolean>>({})

  const activeCount = useMemo(() => items.filter((e) => e.active).length, [items])

  function resetForm() {
    setName('')
    setPhone('')
    setEmail('')
    setPassword('')
    setRole('caissier')
    setRegister(REGISTERS[0]?.name ?? '')
  }

  function addEmployee() {
    const n = name.trim()
    if (!n) return
    const isCaissier = role === 'caissier'
    setItems((prev) => [
      {
        id: `emp-${Date.now()}`,
        name: n,
        role,
        register: isCaissier ? register || undefined : undefined,
        active: true,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        password: isCaissier ? password.trim() || undefined : undefined,
      },
      ...prev,
    ])
    resetForm()
    setOpen(false)
  }

  function toggleActive(id: string) {
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)))
  }

  const canAdd = name.trim() && (role === 'patron' || (email.trim() && password.trim()))

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
              <p className="text-sm font-medium text-muted-foreground">{t('employees')}</p>
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
          const pwVisible = showPw[e.id]
          return (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                      isBoss ? 'bg-brand/15 text-brand' : 'bg-navy/10 text-navy',
                    )}
                  >
                    {isBoss ? <Crown className="h-5 w-5" /> : <UserCog className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{e.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {isBoss ? t('role_patron') : t('role_caissier')}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    e.active ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {e.active ? t('emp_active') : t('emp_inactive')}
                </span>
              </div>

              {/* Caisse assignée */}
              {!isBoss && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                  <ScanLine className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('emp_register')} :</span>
                  <span className="text-sm font-semibold text-foreground">
                    {e.register ?? t('emp_none_register')}
                  </span>
                </div>
              )}

              {/* Identifiants de connexion (caissier) */}
              {!isBoss && (e.email || e.password) && (
                <div className="mt-2 rounded-xl border border-border bg-background p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t('emp_credentials')}
                  </p>
                  <div className="space-y-1.5">
                    {e.phone && (
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {e.phone}
                      </p>
                    )}
                    {e.email && (
                      <p className="flex items-center gap-2 truncate text-sm text-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {e.email}
                      </p>
                    )}
                    {e.password && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-mono">
                          {pwVisible ? e.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowPw((prev) => ({ ...prev, [e.id]: !prev[e.id] }))
                          }
                          aria-label={t('emp_password')}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {pwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions (jamais sur le patron) */}
              {!isBoss && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(e.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {e.active ? t('emp_inactive') : t('emp_active')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToReset(e)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden xs:inline">{t('emp_reset_password')}</span>
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
              <h3 className="font-heading text-lg font-extrabold text-foreground">{t('emp_add')}</h3>
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

              <ModalField label={t('emp_name')} icon={UserCog} value={name} onChange={setName} autoFocus />
              <ModalField label={t('emp_phone')} icon={Phone} value={phone} onChange={setPhone} inputMode="tel" />

              {role === 'caissier' && (
                <>
                  <ModalField label={t('emp_email')} icon={Mail} value={email} onChange={setEmail} />
                  <ModalField
                    label={t('emp_password')}
                    icon={KeyRound}
                    value={password}
                    onChange={setPassword}
                    placeholder={t('emp_password_placeholder')}
                  />

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

                  <p className="rounded-xl bg-brand/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    {t('emp_credentials_note')}
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={addEmployee}
              disabled={!canAdd}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Réinitialisation mot de passe */}
      {toReset && (
        <ResetPasswordModal
          employee={toReset}
          onClose={() => setToReset(null)}
          onConfirm={(pw) => {
            setItems((prev) =>
              prev.map((x) => (x.id === toReset.id ? { ...x, password: pw } : x)),
            )
            setShowPw((prev) => ({ ...prev, [toReset.id]: true }))
            setToReset(null)
          }}
        />
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
            <h3 className="mt-3 font-heading text-lg font-extrabold text-foreground">{t('delete')}</h3>
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

/* ---------- Champ de la modale ---------- */
function ModalField({
  label,
  icon: Icon,
  value,
  onChange,
  inputMode,
  placeholder,
  autoFocus,
}: {
  label: string
  icon: typeof UserCog
  value: string
  onChange: (v: string) => void
  inputMode?: 'tel' | 'text'
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <span className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-brand">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </span>
    </div>
  )
}

/* ---------- Modale de réinitialisation du mot de passe ---------- */
function ResetPasswordModal({
  employee,
  onClose,
  onConfirm,
}: {
  employee: Employee
  onClose: () => void
  onConfirm: (pw: string) => void
}) {
  const { t, dir } = useApp()
  const [pw, setPw] = useState('')
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.trim().length < 4) return
    setDone(true)
    setTimeout(() => onConfirm(pw.trim()), 1000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="mt-10 w-full max-w-sm animate-slide-in-up rounded-3xl bg-card p-5 shadow-soft-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
            <RefreshCw className="h-5 w-5 text-brand" />
            {t('emp_reset_password')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Check className="h-7 w-7" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{t('emp_password_reset_done')}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-muted-foreground">{employee.name}</p>
            <ModalField
              label={t('emp_new_password')}
              icon={KeyRound}
              value={pw}
              onChange={setPw}
              placeholder={t('emp_password_placeholder')}
              autoFocus
            />
            <p className="rounded-xl bg-brand/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              {t('emp_credentials_note')}
            </p>
            <button
              type="submit"
              disabled={pw.trim().length < 4}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('validate')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
