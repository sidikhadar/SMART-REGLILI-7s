export type Role = 'patron' | 'caissier' | 'owner'

export type Lang = 'ar' | 'fr' | 'en'

export type PaymentMethod =
  | 'especes'
  | 'bankily'
  | 'sedad'
  | 'bik'
  | 'click'
  | 'masrivi'
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

/**
 * Variante de vente d'un produit (Unité, Pack, Carton, Palette, personnalisée).
 * Le stock réel est toujours stocké en unités : `factor` = nombre d'unités
 * contenues dans cette variante (Unité = 1, Pack de 6 = 6, Carton de 24 = 24...).
 * Chaque variante possède son propre code-barres et son propre prix de vente.
 */
export interface ProductVariant {
  id: string
  label: string
  barcode?: string
  price: number
  factor: number
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
  /**
   * Seuil d'alerte péremption : quantité restante en dessous de laquelle on
   * n'alerte PAS sur une date d'expiration proche (ex: inutile d'alerter pour
   * 2 unités, mais oui pour un carton entier). Défaut 0 = alerter quelle que
   * soit la quantité si non renseigné.
   */
  expiryAlertThreshold?: number
  /** Emplacement physique en boutique (ex: "Rayon 3 - Case B2"). */
  location?: string
  /** Variantes de vente. La 1ère est l'unité de base (factor 1). */
  variants?: ProductVariant[]
}

export interface SaleItem {
  productId: string
  name: string
  qty: number
  unitPrice: number
  /** Libellé de la variante vendue (ex: "Pack ×24"). */
  variantLabel?: string
  /** Nombre d'unités par variante (pour le décompte du stock en unités). */
  factor?: number
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
  /** Compte de paiement utilisé pour régler la dépense. Défaut : espèces. */
  method?: PaymentMethod
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  balance: number
}

/**
 * Mouvement sur le compte d'un fournisseur.
 * - `purchase` : achat de marchandise → augmente le solde dû.
 * - `payment`  : règlement au fournisseur → diminue le solde dû.
 * `balanceAfter` est le solde restant dû après l'opération.
 */
export interface SupplierTransaction {
  id: string
  supplierId: string
  amount: number
  date: string // ISO datetime
  type: 'payment' | 'purchase'
  balanceAfter: number
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

/**
 * Mouvement de stock dans un entrepôt.
 * - `add`          : entrée de marchandise (réception, ajout manuel, inventaire +).
 * - `remove`       : sortie (casse, perte, retrait manuel, inventaire −).
 * - `transfer_in`  : reçu depuis un autre entrepôt.
 * - `transfer_out` : envoyé vers un autre entrepôt.
 */
export interface StockMovement {
  id: string
  warehouseId: string
  productId: string
  type: 'add' | 'remove' | 'transfer_in' | 'transfer_out'
  quantity: number
  date: string // ISO datetime
  note?: string
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
