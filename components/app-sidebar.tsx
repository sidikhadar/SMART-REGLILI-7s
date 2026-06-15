'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { navForRole, type NavItem } from '@/lib/nav'
import { BrandMark } from '@/components/brand-logo'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const GROUP_LABELS: Record<NavItem['group'], string> = {
  main: 'main_group',
  manage: 'manage_group',
  system: 'system_group',
}

export function AppSidebar() {
  const { role, t, logout, userName } = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const items = navForRole(role)

  const groups: NavItem['group'][] = ['main', 'manage', 'system']

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandMark size={40} />
        <div className="leading-tight">
          <p className="font-heading text-sm font-extrabold text-sidebar-accent-foreground">
            SMART REGLILI
          </p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
            {t('slogan')}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => {
          const groupItems = items.filter((i) => i.group === g)
          if (groupItems.length === 0) return null
          return (
            <div key={g} className="mb-4">
              <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
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
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{t(item.key)}</span>
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
    </aside>
  )
}
