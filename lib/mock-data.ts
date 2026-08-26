import type {
  Product,
  Sale,
  Client,
  Debt,
  Expense,
  Supplier,
  SupplierTransaction,
  Employee,
  Alert,
  Register,
  Warehouse,
  StockMovement,
} from './types'

const today = new Date()
function daysFromNow(d: number) {
  const date = new Date(today)
  date.setDate(date.getDate() + d)
  return date.toISOString().slice(0, 10)
}
function hoursAgo(h: number) {
  const date = new Date(today)
  date.setHours(date.getHours() - h)
  return date.toISOString()
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Lait Candia 1L',
    barcode: '6111035000123',
    category: 'alimentation',
    buyPrice: 28,
    sellPrice: 35,
    image: '/products/milk.png',
    lowStockThreshold: 12,
    lots: [
      { id: 'l1', quantity: 24, expiry: daysFromNow(40), number: 'LT-2401' },
      { id: 'l2', quantity: 6, expiry: daysFromNow(5), number: 'LT-2312' },
    ],
    variants: [
      { id: 'v-p1-unit', label: 'Unité', barcode: '6111035000123', price: 35, factor: 1 },
      { id: 'v-p1-pack', label: 'Pack', barcode: '6111035000124', price: 200, factor: 6 },
      { id: 'v-p1-carton', label: 'Carton', barcode: '6111035000125', price: 380, factor: 12 },
    ],
  },
  {
    id: 'p2',
    name: 'Riz Basmati 5kg',
    barcode: '6111035000456',
    category: 'alimentation',
    buyPrice: 320,
    sellPrice: 410,
    image: '/products/rice.png',
    lowStockThreshold: 8,
    lots: [{ id: 'l3', quantity: 32, number: 'RZ-88' }],
  },
  {
    id: 'p3',
    name: 'Crème Nivea 200ml',
    barcode: '4005900123456',
    category: 'cosmetique',
    buyPrice: 95,
    sellPrice: 140,
    tva: 20,
    image: '/products/cream.png',
    lowStockThreshold: 6,
    lots: [{ id: 'l4', quantity: 18, expiry: daysFromNow(220) }],
  },
  {
    id: 'p4',
    name: 'Paracétamol 500mg',
    barcode: '3400930000111',
    category: 'sante',
    buyPrice: 12,
    sellPrice: 25,
    image: '/products/paracetamol.png',
    lowStockThreshold: 20,
    lots: [
      { id: 'l5', quantity: 40, expiry: daysFromNow(18), number: 'PH-LOT-A' },
      { id: 'l6', quantity: 60, expiry: daysFromNow(400), number: 'PH-LOT-B' },
    ],
  },
  {
    id: 'p5',
    name: 'Coca-Cola 1.5L',
    barcode: '5449000000996',
    category: 'alimentation',
    buyPrice: 18,
    sellPrice: 30,
    image: '/products/cola.png',
    lowStockThreshold: 24,
    lots: [{ id: 'l7', quantity: 96, expiry: daysFromNow(120) }],
    variants: [
      { id: 'v-p5-unit', label: 'Unité', barcode: '5449000000996', price: 30, factor: 1 },
      { id: 'v-p5-pack', label: 'Pack', barcode: '5449000000997', price: 165, factor: 6 },
      { id: 'v-p5-carton', label: 'Carton', barcode: '5449000000998', price: 620, factor: 24 },
    ],
  },
  {
    id: 'p6',
    name: 'Savon Dove 100g',
    barcode: '8717163000222',
    category: 'cosmetique',
    buyPrice: 22,
    sellPrice: 40,
    tva: 20,
    image: '/products/soap.png',
    lowStockThreshold: 10,
    lots: [{ id: 'l8', quantity: 3 }],
  },
  {
    id: 'p7',
    name: 'Thé vert Sultan 200g',
    barcode: '6111035000789',
    category: 'alimentation',
    buyPrice: 45,
    sellPrice: 70,
    image: '/products/tea.png',
    lowStockThreshold: 15,
    lots: [{ id: 'l9', quantity: 50 }],
  },
  {
    id: 'p8',
    name: 'Huile Afia 1L',
    barcode: '6111035000990',
    category: 'alimentation',
    buyPrice: 60,
    sellPrice: 85,
    image: '/products/oil.png',
    lowStockThreshold: 12,
    lots: [{ id: 'l10', quantity: 28 }],
  },
]

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Ahmed Ould Salem', phone: '+222 22 33 44 55', totalDebt: 1605 },
  { id: 'c2', name: 'Fatimetou Mint Cheikh', phone: '+222 41 22 11 00', totalDebt: 320 },
  { id: 'c3', name: 'Mohamed Lemine', phone: '+222 36 99 88 77', totalDebt: 0 },
  { id: 'c4', name: 'Aïcha Mint Brahim', phone: '+222 30 12 34 56', totalDebt: 740 },
]

export const SALES: Sale[] = [
  {
    id: 's1',
    date: hoursAgo(1),
    items: [
      { productId: 'p1', name: 'Lait Candia 1L', qty: 3, unitPrice: 35 },
      { productId: 'p5', name: 'Coca-Cola 1.5L', qty: 2, unitPrice: 30 },
    ],
    total: 165,
    paid: 165,
    method: 'especes',
    cashier: 'Caissier 1',
    register: 'Caisse 1',
  },
  {
    id: 's2',
    date: hoursAgo(3),
    items: [{ productId: 'p2', name: 'Riz Basmati 5kg', qty: 1, unitPrice: 410 }],
    total: 410,
    paid: 410,
    method: 'bankily',
    cashier: 'Caissier 1',
    register: 'Caisse 1',
  },
  {
    id: 's3',
    date: hoursAgo(5),
    items: [
      { productId: 'p4', name: 'Paracétamol 500mg', qty: 4, unitPrice: 25 },
      { productId: 'p3', name: 'Crème Nivea 200ml', qty: 1, unitPrice: 140 },
    ],
    total: 240,
    paid: 1000,
    method: 'especes',
    cashier: 'Caissier 2',
    register: 'Caisse 2',
  },
  {
    id: 's4',
    date: hoursAgo(7),
    items: [{ productId: 'p8', name: 'Huile Afia 1L', qty: 5, unitPrice: 85 }],
    total: 2605,
    paid: 1000,
    method: 'partiel',
    cashier: 'Caissier 1',
    register: 'Caisse 1',
    clientId: 'c1',
  },
  {
    id: 's5',
    date: hoursAgo(26),
    items: [{ productId: 'p7', name: 'Thé vert Sultan 200g', qty: 6, unitPrice: 70 }],
    total: 420,
    paid: 420,
    method: 'sedad',
    cashier: 'Caissier 1',
    register: 'Caisse 1',
  },
]

export const DEBTS: Debt[] = [
  {
    id: 'd1',
    clientId: 'c1',
    clientName: 'Ahmed Ould Salem',
    amount: 1605,
    date: hoursAgo(7),
    saleId: 's4',
    status: 'open',
  },
  {
    id: 'd2',
    clientId: 'c2',
    clientName: 'Fatimetou Mint Cheikh',
    amount: 320,
    date: hoursAgo(50),
    status: 'open',
  },
  {
    id: 'd3',
    clientId: 'c4',
    clientName: 'Aïcha Mint Brahim',
    amount: 740,
    date: hoursAgo(80),
    status: 'open',
  },
]

export const EXPENSES: Expense[] = [
  { id: 'e1', label: 'Loyer boutique', amount: 8000, category: 'Loyer', date: daysFromNow(-2) },
  { id: 'e2', label: 'Électricité', amount: 2400, category: 'Charges', date: daysFromNow(-4) },
  { id: 'e3', label: 'Transport marchandise', amount: 1200, category: 'Logistique', date: daysFromNow(-1) },
  { id: 'e4', label: 'Salaire caissier', amount: 15000, category: 'Salaires', date: daysFromNow(-6) },
]

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Grossiste Nouakchott', phone: '+222 45 25 36 14', balance: 12000 },
  { id: 'sup2', name: 'Import Maghreb', phone: '+222 22 11 33 44', balance: 0 },
  { id: 'sup3', name: 'Pharma Distrib', phone: '+222 36 78 90 12', balance: 4500 },
]

  /**
   * Historique des mouvements par fournisseur.
   * Les `balanceAfter` sont chaînés dans l'ordre chronologique et le dernier
   * mouvement de chaque fournisseur correspond à son `balance` actuel.
   */
  export const SUPPLIER_TRANSACTIONS: SupplierTransaction[] = [
  // Grossiste Nouakchott — solde final 12 000
  { id: 'stx1', supplierId: 'sup1', type: 'purchase', amount: 18000, date: hoursAgo(24 * 26), balanceAfter: 18000 },
  { id: 'stx2', supplierId: 'sup1', type: 'payment', amount: 10000, date: hoursAgo(24 * 19), balanceAfter: 8000 },
  { id: 'stx3', supplierId: 'sup1', type: 'purchase', amount: 9500, date: hoursAgo(24 * 8), balanceAfter: 17500 },
  { id: 'stx4', supplierId: 'sup1', type: 'payment', amount: 5500, date: hoursAgo(24 * 3), balanceAfter: 12000 },

  // Import Maghreb — soldé
  { id: 'stx5', supplierId: 'sup2', type: 'purchase', amount: 7400, date: hoursAgo(24 * 21), balanceAfter: 7400 },
  { id: 'stx6', supplierId: 'sup2', type: 'payment', amount: 4000, date: hoursAgo(24 * 14), balanceAfter: 3400 },
  { id: 'stx7', supplierId: 'sup2', type: 'payment', amount: 3400, date: hoursAgo(24 * 5), balanceAfter: 0 },

  // Pharma Distrib — solde final 4 500
  { id: 'stx8', supplierId: 'sup3', type: 'purchase', amount: 6200, date: hoursAgo(24 * 17), balanceAfter: 6200 },
  { id: 'stx9', supplierId: 'sup3', type: 'payment', amount: 3200, date: hoursAgo(24 * 11), balanceAfter: 3000 },
  { id: 'stx10', supplierId: 'sup3', type: 'purchase', amount: 4300, date: hoursAgo(24 * 6), balanceAfter: 7300 },
  { id: 'stx11', supplierId: 'sup3', type: 'payment', amount: 2800, date: hoursAgo(24 * 2), balanceAfter: 4500 },
  ]

  export const WAREHOUSES: Warehouse[] = [
  { id: 'wh1', name: 'Boutique principale', location: 'Nouakchott — Centre', productCount: 8, units: 262, value: 42600, fillPercent: 78, main: true },
  { id: 'wh2', name: 'Dépôt Ksar', location: 'Nouakchott — Ksar', productCount: 5, units: 140, value: 21800, fillPercent: 54, main: false },
  { id: 'wh3', name: 'Réserve Arafat', location: 'Nouakchott — Arafat', productCount: 3, units: 60, value: 8400, fillPercent: 31, main: false },
]

/**
 * Mouvements de stock par entrepôt, cohérents avec la répartition initiale
 * des lots : les entrées `add` correspondent aux réceptions de marchandise,
 * les `transfer_out`/`transfer_in` s'appairent entre deux entrepôts.
 */
export const STOCK_MOVEMENTS: StockMovement[] = [
  // --- Boutique principale (wh1) : réceptions initiales ---
  { id: 'mv1', warehouseId: 'wh1', productId: 'p1', type: 'add', quantity: 30, date: hoursAgo(196), note: 'Réception LT-2401' },
  { id: 'mv2', warehouseId: 'wh1', productId: 'p2', type: 'add', quantity: 32, date: hoursAgo(192), note: 'Réception RZ-88' },
  { id: 'mv3', warehouseId: 'wh1', productId: 'p5', type: 'add', quantity: 48, date: hoursAgo(188) },
  { id: 'mv4', warehouseId: 'wh1', productId: 'p7', type: 'add', quantity: 60, date: hoursAgo(180) },
  { id: 'mv5', warehouseId: 'wh1', productId: 'p3', type: 'add', quantity: 18, date: hoursAgo(172) },
  { id: 'mv6', warehouseId: 'wh1', productId: 'p8', type: 'add', quantity: 28, date: hoursAgo(168) },
  { id: 'mv7', warehouseId: 'wh1', productId: 'p4', type: 'add', quantity: 14, date: hoursAgo(160), note: 'Réception PH-LOT-A' },
  { id: 'mv8', warehouseId: 'wh1', productId: 'p6', type: 'add', quantity: 40, date: hoursAgo(150) },

  // --- Dépôt Ksar (wh2) : reçoit une partie depuis la boutique ---
  { id: 'mv9', warehouseId: 'wh2', productId: 'p2', type: 'add', quantity: 20, date: hoursAgo(144), note: 'Réception directe' },
  { id: 'mv10', warehouseId: 'wh2', productId: 'p5', type: 'add', quantity: 30, date: hoursAgo(140) },
  { id: 'mv11', warehouseId: 'wh1', productId: 'p7', type: 'transfer_out', quantity: 40, date: hoursAgo(120), note: 'Vers Dépôt Ksar' },
  { id: 'mv12', warehouseId: 'wh2', productId: 'p7', type: 'transfer_in', quantity: 40, date: hoursAgo(120), note: 'Depuis Boutique principale' },
  { id: 'mv13', warehouseId: 'wh1', productId: 'p8', type: 'transfer_out', quantity: 30, date: hoursAgo(96), note: 'Vers Dépôt Ksar' },
  { id: 'mv14', warehouseId: 'wh2', productId: 'p8', type: 'transfer_in', quantity: 30, date: hoursAgo(96), note: 'Depuis Boutique principale' },
  { id: 'mv15', warehouseId: 'wh2', productId: 'p1', type: 'add', quantity: 20, date: hoursAgo(72), note: 'Réception LT-2312' },

  // --- Réserve Arafat (wh3) ---
  { id: 'mv16', warehouseId: 'wh3', productId: 'p4', type: 'add', quantity: 30, date: hoursAgo(90), note: 'Réception PH-LOT-B' },
  { id: 'mv17', warehouseId: 'wh1', productId: 'p6', type: 'transfer_out', quantity: 20, date: hoursAgo(60), note: 'Vers Réserve Arafat' },
  { id: 'mv18', warehouseId: 'wh3', productId: 'p6', type: 'transfer_in', quantity: 20, date: hoursAgo(60), note: 'Depuis Boutique principale' },
  { id: 'mv19', warehouseId: 'wh3', productId: 'p3', type: 'add', quantity: 12, date: hoursAgo(48) },
  { id: 'mv20', warehouseId: 'wh3', productId: 'p3', type: 'remove', quantity: 2, date: hoursAgo(30), note: 'Casse' },

  // --- Ajustements récents ---
  { id: 'mv21', warehouseId: 'wh1', productId: 'p6', type: 'remove', quantity: 3, date: hoursAgo(20), note: 'Inventaire — écart' },
  { id: 'mv22', warehouseId: 'wh2', productId: 'p5', type: 'remove', quantity: 4, date: hoursAgo(12), note: 'Bouteilles cassées' },
  { id: 'mv23', warehouseId: 'wh1', productId: 'p1', type: 'add', quantity: 6, date: hoursAgo(5), note: 'Complément livraison' },
]

export const EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Sidi Mohamed', role: 'patron', active: true, phone: '37 16 20 07', email: 'contact@reglili.com' },
  { id: 'emp2', name: 'Caissier 1', role: 'caissier', register: 'Caisse 1', active: true, phone: '46 12 34 56', email: 'caissier1@reglili.com', password: 'caisse123' },
  { id: 'emp3', name: 'Caissier 2', role: 'caissier', register: 'Caisse 2', active: true, phone: '46 78 90 12', email: 'caissier2@reglili.com', password: 'caisse456' },
]

export const ALERTS: Alert[] = [
  { id: 'a1', type: 'stock', level: 'danger', message: 'Savon Dove 100g — stock critique (3 restants)', date: hoursAgo(2) },
  { id: 'a2', type: 'expiry', level: 'danger', message: 'Coca-Cola 1.5L — expire dans 2 jours', date: hoursAgo(4) },
  { id: 'a3', type: 'expiry', level: 'warning', message: 'Lait Candia 1L (LT-2312) — expire dans 5 jours', date: hoursAgo(6) },
  { id: 'a4', type: 'debt', level: 'info', message: 'Nouvelle dette de 1 605 MRU — Ahmed Ould Salem', date: hoursAgo(7) },
  { id: 'a5', type: 'expiry', level: 'warning', message: 'Paracétamol 500mg (PH-LOT-A) — expire dans 18 jours', date: hoursAgo(8) },
]

export const PAYMENT_TOTALS: Record<string, number> = {
  especes: 9450,
  bankily: 6200,
  sedad: 2100,
  bik: 1750,
  click: 980,
  masrivi: 540,
  bamis: 0,
  credit: 2665,
  partiel: 1000,
}

export const SALES_LAST_7_DAYS = [
  { day: 'Lun', ventes: 4200, benefice: 980 },
  { day: 'Mar', ventes: 5100, benefice: 1240 },
  { day: 'Mer', ventes: 3800, benefice: 870 },
  { day: 'Jeu', ventes: 6300, benefice: 1560 },
  { day: 'Ven', ventes: 7400, benefice: 1820 },
  { day: 'Sam', ventes: 8900, benefice: 2240 },
  { day: 'Dim', ventes: 5600, benefice: 1330 },
]

// --- Caisses (toutes partagent le même stock) ---
export const REGISTERS: Register[] = [
  { id: 'r1', name: 'Caisse 1', active: true },
  { id: 'r2', name: 'Caisse 2', active: true },
]

// --- Historique de ventes sur 1 an (données fictives déterministes) ---
export interface DailyPoint {
  date: string // YYYY-MM-DD
  total: number
  profit: number
  r1: number
  r2: number
}

// pseudo-aléatoire déterministe pour des données stables entre les rendus
function seeded(n: number): number {
  const x = Math.sin(n * 9973.13) * 43758.5453
  return x - Math.floor(x)
}

export const DAILY_SALES: DailyPoint[] = (() => {
  const out: DailyPoint[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  // 0 = dimanche ... 6 = samedi (week-ends plus actifs en Mauritanie : jeu/ven/sam)
  const weekdayFactor = [0.9, 0.85, 0.9, 0.95, 1.2, 1.4, 1.15]
  for (let i = 364; i >= 0; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const month = d.getMonth()
    const seasonal = 1 + 0.14 * Math.sin((month / 12) * Math.PI * 2)
    const growth = 1 + (364 - i) / 364 * 0.25 // légère croissance sur l'année
    const noise = 0.78 + seeded(i + 1) * 0.5
    const total = Math.round(6200 * weekdayFactor[dow] * seasonal * growth * noise)
    const r1 = Math.round(total * (0.52 + seeded(i + 100) * 0.12))
    const r2 = total - r1
    const profit = Math.round(total * (0.21 + seeded(i + 200) * 0.07))
    out.push({ date: d.toISOString().slice(0, 10), total, profit, r1, r2 })
  }
  return out
})()
