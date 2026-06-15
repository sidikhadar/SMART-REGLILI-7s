'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { navForRole, type NavItem } from '@/lib/nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { BrandLogo } from '@/components/brand-logo'
import { Menu, X, Bell, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALERTS } from '@/lib/mock-data'

const GROUP_LABELS: Record<NavItem['group'], string> = {
  main: 'main_group',
  manage: 'manage_group',
  system: 'system_group',
}

export function AppTopbar({ title }: { title: string }) {
  const { role, t, logout, userName } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const items = navForRole(role)
  const groups: NavItem['group'][] = ['main', 'manage', 'system']
  const alertCount = ALERTS.filter((a) => a.level !== 'info').length

  function handleLogout() {
    setOpen(false)
    logout()
    router.push('/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('menu')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/alerts"
            aria-label={t('alerts')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </Link>
          <LanguageSwitcher className="hidden sm:inline-flex" />
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 flex w-[82%] max-w-xs flex-col bg-sidebar text-sidebar-foreground shadow-soft-lg animate-float-up">
            <div className="flex items-center justify-between px-4 py-4">
              <BrandLogo size={36} withText={false} />
              <span className="font-heading text-sm font-extrabold text-sidebar-accent-foreground">
                SMART REGLILI
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4">
              {groups.map((g) => {
                const groupItems = items.filter((i) => i.group === g)
                if (groupItems.length === 0) return null
                return (
                  <div key={g} className="mb-3">
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                      {t(GROUP_LABELS[g])}
                    </p>
                    <ul className="space-y-1">
                      {groupItems.map((item) => {
                        const active =
                          pathname === item.href ||
                          pathname.startsWith(item.href + '/')
                        const Icon = item.icon
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                                active
                                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              )}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              {t(item.key)}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </nav>

            <div className="border-t border-sidebar-border p-3">
              <LanguageSwitcher className="mb-3 w-full justify-center" />
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                  {userName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {role === 'caissier' ? t('role_caissier') : t('role_patron')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <LogOut className="h-5 w-5 flip-rtl" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
