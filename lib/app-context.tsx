'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang, Role, Product, PaymentMethod, Register } from './types'
import { translate, LANGS } from './i18n'
import { PRODUCTS, REGISTERS } from './mock-data'

export interface CartItem {
  productId: string
  name: string
  qty: number
  unitPrice: number
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
  addToCart: (p: Product) => void
  updateQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartTotal: number
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

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, qty: i.qty + 1 } : i,
        )
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, qty: 1, unitPrice: p.sellPrice },
      ]
    })
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clearCart() {
    setCart([])
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty * i.unitPrice, 0),
    [cart],
  )

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
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// re-export for convenience
export type { Product, PaymentMethod }
