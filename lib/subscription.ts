'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Gestion de l'abonnement SMART REGLILI (démo front-only, via localStorage).
 *
 * Modèle :
 * - Chaque commerce dispose d'un essai gratuit de 14 jours au premier lancement.
 * - Passé l'essai, l'accès est bloqué tant que l'abonnement n'est pas activé.
 * - L'activation est faite par l'administrateur (panel /admin) qui bascule un
 *   drapeau et fixe une date d'expiration. L'utilisateur clique « Vérifier mon
 *   paiement » pour relire cet état.
 *
 * Dans une vraie application, ces informations viendraient du backend
 * (table `subscriptions`) et non de localStorage.
 */

export const TRIAL_DAYS = 14
export const PRICE_MRU = 500 // prix mensuel

const K_TRIAL_START = 'sr_trial_start'
const K_ACTIVE = 'sr_sub_active'
const K_EXPIRY = 'sr_sub_expiry'

export type SubStatus = 'trial' | 'active' | 'expired'

export interface SubscriptionState {
  status: SubStatus
  /** Jours restants (essai ou abonnement). */
  daysLeft: number
  /** true si l'accès à l'app doit être bloqué. */
  blocked: boolean
  trialStart: string | null
  expiry: string | null
  /**
   * false pendant le rendu serveur et le premier rendu client.
   * Le localStorage n'existe pas côté serveur : lire l'état trop tôt
   * provoquerait une erreur d'hydratation React.
   */
  ready: boolean
}

/** État neutre identique côté serveur et au premier rendu client. */
const INITIAL_STATE: SubscriptionState = {
  status: 'trial',
  daysLeft: TRIAL_DAYS,
  blocked: false,
  trialStart: null,
  expiry: null,
  ready: false,
}

const DAY_MS = 24 * 60 * 60 * 1000

function todayStart(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function diffDays(fromIso: string): number {
  const from = new Date(fromIso)
  from.setHours(0, 0, 0, 0)
  return Math.floor((todayStart() - from.getTime()) / DAY_MS)
}

function daysUntil(iso: string): number {
  const to = new Date(iso)
  to.setHours(0, 0, 0, 0)
  return Math.ceil((to.getTime() - todayStart()) / DAY_MS)
}

/** Lit l'état brut depuis localStorage (safe SSR). */
function read(): SubscriptionState {
  if (typeof window === 'undefined') return INITIAL_STATE

  // Initialise le début d'essai au premier accès.
  let trialStart = localStorage.getItem(K_TRIAL_START)
  if (!trialStart) {
    trialStart = new Date().toISOString()
    localStorage.setItem(K_TRIAL_START, trialStart)
  }

  const active = localStorage.getItem(K_ACTIVE) === 'true'
  const expiry = localStorage.getItem(K_EXPIRY)

  // Abonnement payant actif ?
  if (active && expiry) {
    const left = daysUntil(expiry)
    if (left >= 0) {
      return { status: 'active', daysLeft: left, blocked: false, trialStart, expiry, ready: true }
    }
    // Abonnement expiré
    return { status: 'expired', daysLeft: 0, blocked: true, trialStart, expiry, ready: true }
  }

  // Sinon, période d'essai
  const used = diffDays(trialStart)
  const left = TRIAL_DAYS - used
  if (left > 0) {
    return { status: 'trial', daysLeft: left, blocked: false, trialStart, expiry: null, ready: true }
  }
  return { status: 'expired', daysLeft: 0, blocked: true, trialStart, expiry: null, ready: true }
}

/** Hook réactif d'abonnement, se resynchronise au focus et sur événement custom. */
export function useSubscription() {
  // On part d'un état neutre identique au serveur, puis on lit le
  // localStorage après le montage pour éviter toute erreur d'hydratation.
  const [state, setState] = useState<SubscriptionState>(INITIAL_STATE)

  const refresh = useCallback(() => setState(read()), [])

  useEffect(() => {
    refresh()
    const onFocus = () => refresh()
    const onCustom = () => refresh()
    window.addEventListener('focus', onFocus)
    window.addEventListener('sr-sub-changed', onCustom)
    window.addEventListener('storage', onCustom)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('sr-sub-changed', onCustom)
      window.removeEventListener('storage', onCustom)
    }
  }, [refresh])

  return { ...state, refresh }
}

/** Active l'abonnement pour N mois (utilisé par le panel admin). */
export function activateSubscription(months = 1) {
  const expiry = new Date(Date.now() + months * 30 * DAY_MS).toISOString()
  localStorage.setItem(K_ACTIVE, 'true')
  localStorage.setItem(K_EXPIRY, expiry)
  window.dispatchEvent(new Event('sr-sub-changed'))
}

/** Désactive l'abonnement (utilisé par le panel admin). */
export function deactivateSubscription() {
  localStorage.setItem(K_ACTIVE, 'false')
  localStorage.removeItem(K_EXPIRY)
  window.dispatchEvent(new Event('sr-sub-changed'))
}

/** Force l'expiration de l'essai (utile pour tester le blocage). */
export function expireTrial() {
  const past = new Date(Date.now() - (TRIAL_DAYS + 1) * DAY_MS).toISOString()
  localStorage.setItem(K_TRIAL_START, past)
  localStorage.setItem(K_ACTIVE, 'false')
  localStorage.removeItem(K_EXPIRY)
  window.dispatchEvent(new Event('sr-sub-changed'))
}

/** Réinitialise l'essai (repart à 14 jours). */
export function resetTrial() {
  localStorage.setItem(K_TRIAL_START, new Date().toISOString())
  localStorage.setItem(K_ACTIVE, 'false')
  localStorage.removeItem(K_EXPIRY)
  window.dispatchEvent(new Event('sr-sub-changed'))
}
