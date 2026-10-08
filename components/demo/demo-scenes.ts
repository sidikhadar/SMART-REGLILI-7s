export type DemoScene =
  | {
      kind: 'brand'
      id: string
      duration: number
      title: string
      subtitle: string
      cta?: string
    }
  | {
      kind: 'screen'
      id: string
      duration: number
      image: string
      alt: string
      title: string
      subtitle: string
      tap: { x: number; y: number }
    }

export const DEMO_SCENES: DemoScene[] = [
  {
    kind: 'brand',
    id: 'intro',
    duration: 3500,
    title: 'Votre boutique, enfin sous contrôle.',
    subtitle: 'Caisse, stock et finances dans votre téléphone.',
  },
  {
    kind: 'screen',
    id: 'caisse',
    duration: 4500,
    image: '/demo/caisse.png',
    alt: 'Écran Caisse de Smart Reglili avec la liste des produits',
    title: 'Ouvrez la caisse',
    subtitle: 'Touchez un produit ou scannez son code-barres.',
    tap: { x: 26, y: 30 },
  },
  {
    kind: 'screen',
    id: 'panier',
    duration: 4500,
    image: '/demo/panier.png',
    alt: 'Panier avec deux articles et un total de 155 MRU',
    title: 'Le total se calcule seul',
    subtitle: 'Ajustez avec + et −, puis touchez « Valider la vente ».',
    tap: { x: 50, y: 82 },
  },
  {
    kind: 'screen',
    id: 'transfert',
    duration: 5000,
    image: '/demo/transfert.png',
    alt: 'Choix de l’application de transfert : Bankily, Sedad, BIK, Click, Masrivi, Amanety',
    title: 'Encaissez comme vos clients paient',
    subtitle: 'Espèces, dette, ou transfert Bankily, Sedad, Masrivi, Click…',
    tap: { x: 22, y: 60 },
  },
  {
    kind: 'screen',
    id: 'stock',
    duration: 4500,
    image: '/demo/stock.png',
    alt: 'Écran Stock avec quantités, marges et dates d’expiration',
    title: 'Suivez votre stock',
    subtitle: 'Quantités, marges et dates d’expiration en un coup d’œil.',
    tap: { x: 26, y: 26.5 },
  },
  {
    kind: 'screen',
    id: 'commande',
    duration: 5000,
    image: '/demo/commande.png',
    alt: 'Bon de commande fournisseur créé depuis une alerte de stock bas',
    title: 'Plus jamais en rupture',
    subtitle: 'Une alerte, un bon de commande envoyé au fournisseur sur WhatsApp.',
    tap: { x: 50, y: 65 },
  },
  {
    kind: 'screen',
    id: 'dashboard',
    duration: 4500,
    image: '/demo/dashboard.png',
    alt: 'Tableau de bord avec ventes du jour, bénéfice et dettes en cours',
    title: 'Vos chiffres en direct',
    subtitle: 'Ventes, bénéfice et dettes du jour, où que vous soyez.',
    tap: { x: 27, y: 27 },
  },
  {
    kind: 'brand',
    id: 'outro',
    duration: 5500,
    title: 'Smart Reglili',
    subtitle: 'Votre stock, notre intelligence.',
    cta: 'Essayez gratuitement',
  },
]

export const DEMO_STEP_COUNT = DEMO_SCENES.filter((s) => s.kind === 'screen').length
