export type AdLang = 'fr' | 'ar'

type Localized = Record<AdLang, string>

export interface AdScene {
  id: string
  kind: 'brand' | 'screen' | 'outro'
  image?: string
  step?: number
  title: Localized
  caption: Localized
  voice: Localized
  minMs: number
}

export const SCENES: AdScene[] = [
  {
    id: 'intro',
    kind: 'brand',
    title: { fr: 'Fini le cahier de comptes', ar: 'وداعاً لدفتر الحسابات' },
    caption: {
      fr: 'Votre boutique mérite mieux.',
      ar: 'متجرك يستحق الأفضل.',
    },
    voice: {
      fr: 'Vous êtes commerçant ? Fini le cahier et les calculs à la main. Découvrez Smart Reglili.',
      ar: 'هل أنت تاجر؟ وداعاً للدفتر والحساب باليد. اكتشف سمارت رقليلي.',
    },
    minMs: 5000,
  },
  {
    id: 'caisse',
    kind: 'screen',
    image: '/demo/caisse.png',
    step: 1,
    title: { fr: 'Ouvrez la caisse', ar: 'افتح الصندوق' },
    caption: {
      fr: 'Touchez un produit pour l’ajouter à la vente.',
      ar: 'المس المنتج لإضافته إلى البيع.',
    },
    voice: {
      fr: 'Étape un : ouvrez la caisse et touchez vos produits pour les ajouter.',
      ar: 'الخطوة الأولى: افتح الصندوق والمس منتجاتك لإضافتها.',
    },
    minMs: 5000,
  },
  {
    id: 'panier',
    kind: 'screen',
    image: '/demo/panier.png',
    step: 2,
    title: { fr: 'Le total se calcule seul', ar: 'المجموع يُحسب تلقائياً' },
    caption: {
      fr: 'Vérifiez le panier, puis touchez « Valider la vente ».',
      ar: 'راجع السلة ثم المس «تأكيد البيع».',
    },
    voice: {
      fr: 'Étape deux : le total se calcule tout seul. Touchez valider la vente.',
      ar: 'الخطوة الثانية: المجموع يُحسب وحده. المس تأكيد البيع.',
    },
    minMs: 5000,
  },
  {
    id: 'transfert',
    kind: 'screen',
    image: '/demo/transfert.png',
    step: 3,
    title: { fr: 'Encaissez comme vous voulez', ar: 'استلم المال كما تريد' },
    caption: {
      fr: 'Espèces ou transfert : Bankily, Sedad, Masrivi, Click…',
      ar: 'نقداً أو تحويل: بنكيلي، سداد، مصرفي، كليك…',
    },
    voice: {
      fr: 'Étape trois : encaissez en espèces ou par transfert. Bankily, Sedad, Masrivi, Click : choisissez l’application.',
      ar: 'الخطوة الثالثة: استلم نقداً أو بالتحويل. بنكيلي، سداد، مصرفي، كليك: اختر التطبيق.',
    },
    minMs: 6000,
  },
  {
    id: 'stock',
    kind: 'screen',
    image: '/demo/stock.png',
    step: 4,
    title: { fr: 'Votre stock, en direct', ar: 'مخزونك مباشرة' },
    caption: {
      fr: 'Chaque vente met le stock à jour automatiquement.',
      ar: 'كل بيع يحدّث المخزون تلقائياً.',
    },
    voice: {
      fr: 'Étape quatre : chaque vente met votre stock à jour, automatiquement.',
      ar: 'الخطوة الرابعة: كل بيع يحدّث مخزونك تلقائياً.',
    },
    minMs: 5000,
  },
  {
    id: 'commande',
    kind: 'screen',
    image: '/demo/commande.png',
    step: 5,
    title: { fr: 'Stock bas ? Commandez', ar: 'المخزون قليل؟ اطلب' },
    caption: {
      fr: 'Un bon de commande envoyé au fournisseur par WhatsApp.',
      ar: 'طلبية تُرسل إلى المورد عبر واتساب.',
    },
    voice: {
      fr: 'Étape cinq : stock bas ? Smart Reglili vous alerte. Envoyez le bon de commande au fournisseur par WhatsApp.',
      ar: 'الخطوة الخامسة: المخزون قليل؟ سمارت رقليلي ينبهك. أرسل الطلبية إلى المورد عبر واتساب.',
    },
    minMs: 6000,
  },
  {
    id: 'dashboard',
    kind: 'screen',
    image: '/demo/dashboard.png',
    step: 6,
    title: { fr: 'Vos chiffres, chaque jour', ar: 'أرقامك كل يوم' },
    caption: {
      fr: 'Ventes, bénéfices et trésorerie en un coup d’œil.',
      ar: 'المبيعات والأرباح والخزينة في لمحة.',
    },
    voice: {
      fr: 'Étape six : suivez vos ventes, vos bénéfices et votre trésorerie, chaque jour.',
      ar: 'الخطوة السادسة: تابع مبيعاتك وأرباحك وخزينتك كل يوم.',
    },
    minMs: 5000,
  },
  {
    id: 'outro',
    kind: 'outro',
    title: { fr: 'Smart Reglili', ar: 'سمارت رقليلي' },
    caption: {
      fr: 'Gérez · Contrôlez · Développez',
      ar: 'أدِر · راقب · طوّر',
    },
    voice: {
      fr: 'Smart Reglili. Votre stock, notre intelligence. Commencez dès aujourd’hui.',
      ar: 'سمارت رقليلي. مخزونك، ذكاؤنا. ابدأ اليوم.',
    },
    minMs: 6000,
  },
]
