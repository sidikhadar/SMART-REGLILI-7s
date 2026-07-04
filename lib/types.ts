export type Role = 'patron' | 'caissier' | 'owner'

export type Lang = 'ar' | 'fr' | 'en'

export type PaymentMethod =
  | 'especes'
  | 'bankily'
  | 'sedad'
  | 'bik'
  | 'click'
  | 'masrivi'
  | 'bamis'
  | 'amanety'
  | 'credit'
  | 'partiel'

export interface Register {
  id: string
  name: string
  active: boolean
}

export type ProductCategory =
  | 'alimentation'
  | 'cosmetique'
  | 'sante'
  | 'autre'

export interface Lot {
  id: string
  quantity: number
  expiry?: string // ISO date
  number?: string
}

export interface Product {
  id: string
  name: string
  barcode?: string
  category: ProductCategory
  buyPrice: number
  sellPrice: number
  tva?: number
  image?: string
  lots: Lot[]
  lowStockThreshold: number
}

export interface SaleItem {
  productId: string
  name: string
  qty: number
  unitPrice: number
}

export interface Sale {
  id: string
  date: string // ISO datetime
  items: SaleItem[]
  total: number
  paid: number
  method: PaymentMethod
  cashier: string
  register: string
  clientId?: string
}

export interface Client {
  id: string
  name: string
  phone?: string
  totalDebt: number
}

export interface Debt {
  id: string
  clientId: string
  clientName: string
  amount: number
  date: string
  saleId?: string
  status: 'open' | 'paid'
}

export interface Expense {
  id: string
  label: string
  amount: number
  category: string
  date: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  balance: number
}

export interface Warehouse {
  id: string
  name: string
  location: string
  productCount: number
  units: number
  value: number
  fillPercent: number
  main: boolean
}

export interface Employee {
  id: string
  name: string
  role: Role
  register?: string
  active: boolean
  phone?: string
  email?: string
  password?: string
}

export interface Alert {
  id: string
  type: 'stock' | 'expiry' | 'debt' | 'return'
  level: 'info' | 'warning' | 'danger'
  message: string
  date: string
}
