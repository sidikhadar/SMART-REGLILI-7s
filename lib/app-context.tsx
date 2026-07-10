'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Lang,
  Role,
  Product,
  ProductVariant,
  PaymentMethod,
  Register,
} from './types'
import { translate, LANGS } from './i18n'
import { PRODUCTS, REGISTERS } from './mock-data'
import { baseVariant } from './stock-utils'

/**
 * Ligne de panier. L'identifiant `id` combine produit + variante :
 * un pack et une unité du même produit sont donc 2 lignes distinctes.
 * `factor` = nombre d'unités décomptées du stock par article vendu.
 */
export interface CartItem {
  id: string
  productId: string
  variantId: string
  name: string
  variantLabel: string
  qty: number
  unitPrice: number
  factor: number
}

interface AppState {
  lang: Lang
  dir: 'rtl' | 'ltr'
  role: Role | null
  userName: string
  setLang: (l: Lang) => void
  login: (role: Role, name?: string) => void
  switchRole: () => void
  logout: () => void
  t: (key: string) => string
  // cart
  cart: CartItem[]
  addToCart: (p: Product, variant?: ProductVariant) => void
  updateQty: (lineId: string, qty: number) => void
  removeFromCart: (lineId: string) => void
  clearCart: () => void
  cartTotal: number
  /** Total des unités décomptées du stock (qty × factor). */
  cartUnits: number
  // registers (multi-caisses)
  registers: Register[]
  activeRegister: string
  setActiveRegister: (id: string) => void
  addRegister: (name: string) => void
  removeRegister: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')
  const [role, setRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [registers, setRegisters] = useState<Register[]>(REGISTERS)
  const [activeRegister, setActiveRegisterState] = useState<string>(REGISTERS[0].id)

  // hydrate from localStorage (UI preference only, not data persistence)
  useEffect(() => {
    const savedLang = localStorage.getItem('sr_lang') as Lang | null
    if (savedLang && LANGS.some((l) => l.code === savedLang)) {
      setLangState(savedLang)
    }
    const savedRole = localStorage.getItem('sr_role') as Role | null
    const savedName = localStorage.getItem('sr_name')
    if (savedRole) setRole(savedRole)
    if (savedName) setUserName(savedName)
  }, [])

  const dir = useMemo<'rtl' | 'ltr'>(
    () => (lang === 'ar' ? 'rtl' : 'ltr'),
    [lang],
  )

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('sr_lang', l)
  }

  function login(r: Role, name?: string) {
    setRole(r)
    const finalName = name || (r === 'caissier' ? 'Caissier 1' : 'Sidi Mohamed')
    setUserName(finalName)
    localStorage.setItem('sr_role', r)
    localStorage.setItem('sr_name', finalName)
  }

  function switchRole() {
    const next: Role = role === 'caissier' ? 'patron' : 'caissier'
    const finalName = next === 'caissier' ? 'Caissier 1' : 'Sidi Mohamed'
    setRole(next)
    setUserName(finalName)
    localStorage.setItem('sr_role', next)
    localStorage.setItem('sr_name', finalName)
  }

  function logout() {
    setRole(null)
    setUserName('')
    localStorage.removeItem('sr_role')
    localStorage.removeItem('sr_name')
  }

  function addToCart(p: Product, variant?: ProductVariant) {
    // Sans variante explicite → variante de base (unité, factor 1)
    const v = variant ?? baseVariant(p)
    const lineId = `${p.id}:${v.id}`
    setCart((prev) => {
      const existing = prev.find((i) => i.id === lineId)
      if (existing) {
        return prev.map((i) =>
          i.id === lineId ? { ...i, qty: i.qty + 1 } : i,
        )
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: p.id,
          variantId: v.id,
          name: p.name,
          variantLabel: v.label,
          qty: 1,
          unitPrice: v.price,
          factor: v.factor,
        },
      ]
    })
  }

  function updateQty(lineId: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== lineId)
        : prev.map((i) => (i.id === lineId ? { ...i, qty } : i)),
    )
  }

  function removeFromCart(lineId: string) {
    setCart((prev) => prev.filter((i) => i.id !== lineId))
  }

  function clearCart() {
    setCart([])
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty * i.unitPrice, 0),
    [cart],
  )

  const cartUnits = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty * i.factor, 0),
    [cart],
  )

  function setActiveRegister(id: string) {
    setActiveRegisterState(id)
  }

  function addRegister(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setRegisters((prev) => [
      ...prev,
      { id: `r${Date.now()}`, name: trimmed, active: true },
    ])
  }

  function removeRegister(id: string) {
    setRegisters((prev) => {
      if (prev.length <= 1) return prev // garder au moins une caisse
      const next = prev.filter((r) => r.id !== id)
      if (activeRegister === id && next.length) {
        setActiveRegisterState(next[0].id)
      }
      return next
    })
  }

  const value: AppState = {
    lang,
    dir,
    role,
    userName,
    setLang,
    login,
    switchRole,
    logout,
    t: (key: string) => translate(lang, key),
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    cartUnits,
    registers,
    activeRegister,
    setActiveRegister,
    addRegister,
    removeRegister,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// re-export for convenience
export type { Product, ProductVariant, PaymentMethod, Register }
