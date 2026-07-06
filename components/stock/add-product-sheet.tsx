'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  X,
  ScanLine,
  Sparkles,
  HeartPulse,
  PencilLine,
  Search,
  Loader2,
  Camera,
  Check,
  Layers,
  Plus,
  Trash2,
  Boxes,
} from 'lucide-react'
import type { Product, ProductCategory, ProductVariant } from '@/lib/types'
import { lookupBarcode, productMargin, type LookupSource } from '@/lib/stock-utils'
import { cn } from '@/lib/utils'
import { InlineScanner } from '@/components/inline-scanner'

type Method = LookupSource | 'manual'

const METHODS: { id: Method; labelKey: string; icon: typeof ScanLine }[] = [
  { id: 'off', labelKey: 'source_off', icon: ScanLine },
  { id: 'obf', labelKey: 'source_obf', icon: Sparkles },
  { id: 'sante', labelKey: 'source_sante', icon: HeartPulse },
  { id: 'manual', labelKey: 'manual_creation', icon: PencilLine },
]

const CATEGORIES: ProductCategory[] = ['alimentation', 'cosmetique', 'sante', 'autre']

/** Variante éditable dans le formulaire (avant conversion en ProductVariant). */
interface EditVariant {
  id: string
  label: string
  barcode: string
  price: string
  factor: string
}

/** Préréglages rapides de variantes (facteur = nb d'unités). */
const VARIANT_PRESETS: { labelKey: string; label: string; factor: number }[] = [
  { labelKey: 'variant_pack', label: 'Pack', factor: 6 },
  { labelKey: 'variant_carton', label: 'Carton', factor: 24 },
  { labelKey: 'variant_palette', label: 'Palette', factor: 480 },
]

export function AddProductSheet({
  t,
  onClose,
  onSave,
}: {
  t: (k: string) => string
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [method, setMethod] = useState<Method | null>(null)
  const [barcode, setBarcode] = useState('')
  const [searching, setSearching] = useState(false)
  const [lookupMsg, setLookupMsg] = useState<'found' | 'notfound' | null>(null)
  const [scanning, setScanning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // champs du formulaire
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ProductCategory>('alimentation')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [tva, setTva] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expiry, setExpiry] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [posology, setPosology] = useState('')
  const [image, setImage] = useState<string | undefined>()
  // Variantes de vente supplémentaires (pack, carton, palette...). L'unité de
  // base est implicite (prix de vente / code-barres ci-dessus, facteur 1).
  const [variants, setVariants] = useState<EditVariant[]>([])

  const margin =
    buyPrice && sellPrice ? productMargin(Number(buyPrice), Number(sellPrice)) : null
  const showForm = method === 'manual' || lookupMsg === 'found'
  const canSave = name.trim() && Number(sellPrice) > 0

  async function runLookup(code?: string) {
    const bc = (code ?? barcode).trim()
    const src = method && method !== 'manual' ? method : 'off'
    if (!bc) return
    setSearching(true)
    setLookupMsg(null)
    const res = await lookupBarcode(bc, src)
    setSearching(false)
    if (res.found) {
      setName(res.name || '')
      if (res.category) setCategory(res.category)
      if (res.vat) setTva(String(res.vat))
      if (res.posology) setPosology(res.posology)
      if (res.lotNumber) setLotNumber(res.lotNumber)
      if (res.image) setImage(res.image)
      setLookupMsg('found')
    } else {
      setLookupMsg('notfound')
    }
  }

  // code détecté par la caméra → on remplit, on ferme le scanner puis on recherche
  function handleScanDetected(code: string) {
    setBarcode(code)
    setScanning(false)
    void runLookup(code)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImage(URL.createObjectURL(file))
  }

  function addVariant(preset?: { label: string; factor: number }) {
    setVariants((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}-${prev.length}`,
        label: preset?.label ?? '',
        barcode: '',
        price: '',
        factor: preset ? String(preset.factor) : '',
      },
    ])
  }

  function updateVariant(id: string, patch: Partial<EditVariant>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  function save() {
    if (!canSave) return
    const qty = Number(quantity) || 0

    // Construit les variantes de vente. L'unité de base est toujours en 1ère
    // position (facteur 1). Le stock reste géré en unités.
    const validExtra = variants.filter(
      (v) => v.label.trim() && Number(v.factor) > 0 && Number(v.price) > 0,
    )
    const productVariants: ProductVariant[] | undefined = validExtra.length
      ? [
          {
            id: 'unit',
            label: 'Unité',
            barcode: barcode.trim() || undefined,
            price: Number(sellPrice) || 0,
            factor: 1,
          },
          ...validExtra.map((v, i) => ({
            id: `v-${Date.now()}-${i}`,
            label: v.label.trim(),
            barcode: v.barcode.trim() || undefined,
            price: Number(v.price) || 0,
            factor: Number(v.factor) || 1,
          })),
        ]
      : undefined

    const product: Product = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      category,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      tva: tva ? Number(tva) : undefined,
      image,
      lowStockThreshold: 5,
      lots: [
        {
          id: `lot-${Date.now()}`,
          quantity: qty,
          expiry: expiry || undefined,
          number: lotNumber || undefined,
        },
      ],
      variants: productVariants,
    }
    onSave(product)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 sm:p-4">
      <div className="max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-b-3xl bg-card p-5 shadow-soft-lg sm:max-h-[92dvh] sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('add_product_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Choix de la méthode */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethod(m.id)
                  setLookupMsg(null)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all active:scale-95',
                  method === m.id
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-start">{t(m.labelKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Recherche par code-barres */}
        {method && method !== 'manual' && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">
              {t('barcode')}
            </label>
            <div className="flex gap-2">
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                inputMode="numeric"
                placeholder={t('enter_barcode')}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setScanning((v) => !v)}
                aria-label={t('use_camera')}
                aria-pressed={scanning}
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-xl px-4',
                  scanning
                    ? 'bg-navy text-navy-foreground'
                    : 'bg-brand text-brand-foreground',
                )}
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => runLookup()}
                disabled={searching || !barcode.trim()}
                className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-navy px-4 text-sm font-semibold text-navy-foreground disabled:opacity-50"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Scanner intégré (rectangle démarrer/arrêter) */}
            {scanning && (
              <div className="mt-2">
                <InlineScanner t={t} onDetected={handleScanDetected} autoStart />
              </div>
            )}
            {searching && (
              <p className="mt-2 text-xs text-muted-foreground">{t('searching')}</p>
            )}
            {lookupMsg === 'found' && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-brand">
                <Check className="h-3.5 w-3.5" /> {t('product_found')}
              </p>
            )}
            {lookupMsg === 'notfound' && (
              <p className="mt-2 text-xs font-medium text-destructive">
                {t('product_not_found')}
              </p>
            )}
          </div>
        )}

        {/* Formulaire produit */}
        {showForm && (
          <div className="space-y-3">
            {/* Photo */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                {image ? (
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={name || 'product'}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t('photo')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </div>

            <Field label={t('product_name')}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
              />
            </Field>

            <Field label={t('category')}>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      category === c
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {t(`cat_${c}`)}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('buy_price')}>
                <input
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </Field>
              <Field label={t('sell_price')}>
                <input
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </Field>
            </div>

            {margin !== null && (
              <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-2 text-sm">
                <span className="text-accent-foreground/80">{t('margin')}</span>
                <span className="font-heading font-bold text-brand">{margin}%</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('quantity')}>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </Field>
              <Field label={t('vat')}>
                <input
                  value={tva}
                  onChange={(e) => setTva(e.target.value)}
                  inputMode="numeric"
                  placeholder="%"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base tabular-nums text-foreground outline-none focus:border-brand"
                />
              </Field>
            </div>

            {/* Section dédiée au lot : n° de lot + date d'expiration regroupés */}
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Layers className="h-4 w-4 text-brand" />
                {t('lot')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('lot_number')}>
                  <input
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="LOT-2026"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                  />
                </Field>
                <Field label={t('expiry_optional')}>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground outline-none focus:border-brand"
                  />
                </Field>
              </div>
            </div>

            {/* Variantes de vente : packs, cartons, palettes (stock géré en unités) */}
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Boxes className="h-4 w-4 text-brand" />
                {t('sale_units')}
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{t('sale_units_hint')}</p>

              {/* Unité de base (implicite, non modifiable) */}
              <div className="mb-2 flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{t('unit')}</span>
                <span className="text-xs text-muted-foreground">
                  ×1 · {sellPrice ? `${sellPrice} ${t('mru')}` : '—'}
                </span>
              </div>

              {/* Variantes personnalisées */}
              <div className="space-y-2">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-border bg-background p-2.5"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        value={v.label}
                        onChange={(e) => updateVariant(v.id, { label: e.target.value })}
                        placeholder={t('variant_name')}
                        className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        aria-label={t('delete')}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="block">
                        <span className="mb-0.5 block text-[11px] text-muted-foreground">
                          {t('units_per')}
                        </span>
                        <input
                          value={v.factor}
                          onChange={(e) => updateVariant(v.id, { factor: e.target.value })}
                          inputMode="numeric"
                          placeholder="6"
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm tabular-nums text-foreground outline-none focus:border-brand"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[11px] text-muted-foreground">
                          {t('sell_price')}
                        </span>
                        <input
                          value={v.price}
                          onChange={(e) => updateVariant(v.id, { price: e.target.value })}
                          inputMode="numeric"
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm tabular-nums text-foreground outline-none focus:border-brand"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-0.5 block text-[11px] text-muted-foreground">
                          {t('barcode')}
                        </span>
                        <input
                          value={v.barcode}
                          onChange={(e) => updateVariant(v.id, { barcode: e.target.value })}
                          inputMode="numeric"
                          placeholder="—"
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm tabular-nums text-foreground outline-none focus:border-brand"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ajout rapide via préréglages + variante personnalisée */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {VARIANT_PRESETS.map((p) => (
                  <button
                    key={p.labelKey}
                    type="button"
                    onClick={() => addVariant({ label: t(p.labelKey), factor: p.factor })}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:bg-brand/5"
                  >
                    <Plus className="h-3.5 w-3.5 text-brand" />
                    {t(p.labelKey)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addVariant()}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-brand hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('variant_custom')}
                </button>
              </div>
            </div>

            {(category === 'sante' || posology) && (
              <Field label={t('posology')}>
                <input
                  value={posology}
                  onChange={(e) => setPosology(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-brand"
                />
              </Field>
            )}

            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {t('save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
