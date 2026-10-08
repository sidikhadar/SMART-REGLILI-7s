import type { Metadata } from 'next'
import { AdPlayer } from '@/components/pub/ad-player'

export const metadata: Metadata = {
  title: 'Publicité — Smart Reglili',
  description: 'Découvrez Smart Reglili en une minute : caisse, transferts, stock, commandes et chiffres.',
}

export default function PubPage() {
  return <AdPlayer />
}
