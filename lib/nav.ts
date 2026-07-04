import type { Role } from './types'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ScanLine,
  Users,
  HandCoins,
  Receipt,
  Warehouse,
  UserCog,
  Truck,
  FileText,
  Sparkles,
  Wallet,
  Bell,
  CreditCard,
  Settings,
  ShieldCheck,
  RotateCcw,
  Store,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  key: string
  icon: LucideIcon
  roles: Role[]
  group: 'main' | 'manage' | 'system'
  /** shown in the mobile bottom bar */
  bottom?: boolean
}

const ALL: Role[] = ['patron', 'owner', 'caissier']
const BOSS: Role[] = ['patron', 'owner']
const CAISS: Role[] = ['caissier']

export const NAV_ITEMS: NavItem[] = [
  // --- Principal ---
  { href: '/dashboard', key: 'dashboard', icon: LayoutDashboard, roles: ALL, group: 'main', bottom: true },
  { href: '/caisse', key: 'caisse', icon: ShoppingCart, roles: CAISS, group: 'main', bottom: true },
  { href: '/scanner', key: 'scanner', icon: ScanLine, roles: CAISS, group: 'main', bottom: true },
  { href: '/stock', key: 'stock', icon: Package, roles: ALL, group: 'main', bottom: true },
  { href: '/alerts', key: 'alerts', icon: Bell, roles: ALL, group: 'main', bottom: true },

  // --- Gestion ---
  { href: '/clients', key: 'clients', icon: Users, roles: ALL, group: 'manage' },
  { href: '/debts', key: 'debts', icon: HandCoins, roles: ALL, group: 'manage' },
  { href: '/returns', key: 'product_return', icon: RotateCcw, roles: ALL, group: 'manage' },
  { href: '/expenses', key: 'expenses', icon: Receipt, roles: BOSS, group: 'manage' },
  { href: '/suppliers', key: 'suppliers', icon: Truck, roles: BOSS, group: 'manage' },
  { href: '/warehouses', key: 'warehouses', icon: Warehouse, roles: BOSS, group: 'manage' },
  { href: '/employees', key: 'employees', icon: UserCog, roles: BOSS, group: 'manage' },
  { href: '/invoices', key: 'invoices', icon: FileText, roles: BOSS, group: 'manage' },

  // --- Système ---
  { href: '/finances', key: 'finances', icon: Wallet, roles: BOSS, group: 'system' },
  { href: '/registers', key: 'multi_register', icon: Store, roles: BOSS, group: 'system' },
  { href: '/ai-reports', key: 'ai_reports', icon: Sparkles, roles: BOSS, group: 'system' },
  { href: '/subscription', key: 'subscription', icon: CreditCard, roles: BOSS, group: 'system' },
  { href: '/admin', key: 'admin', icon: ShieldCheck, roles: ['owner'], group: 'system' },
  { href: '/settings', key: 'settings', icon: Settings, roles: ALL, group: 'system' },
]

export function navForRole(role: Role | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter((i) => i.roles.includes(role))
}

export function bottomNavForRole(role: Role | null): NavItem[] {
  return navForRole(role)
    .filter((i) => i.bottom)
    .slice(0, 5)
}
