import { convertFromXOF } from './currency'

export function formatAmount(valueXOF, displayCurrency = 'XOF') {
  const converted = convertFromXOF(valueXOF, displayCurrency)
  if (displayCurrency === 'EUR') {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(converted) + ' €'
    )
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(converted) + ' XOF'
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export const PHASE_STATUS = {
  a_venir: { label: 'À venir', color: 'var(--ink-soft)', bg: 'var(--paper-raised)' },
  en_cours: { label: 'En cours', color: 'var(--blueprint)', bg: 'var(--blueprint-soft)' },
  termine: { label: 'Terminée', color: 'var(--moss)', bg: 'var(--moss-soft)' },
  bloque: { label: 'Bloquée', color: 'var(--danger)', bg: '#f2dfda' },
}

export const PROJECT_STATUS = {
  planifie: { label: 'Planifié', color: 'var(--ink-soft)', bg: 'var(--paper-raised)' },
  en_cours: { label: 'En cours', color: 'var(--blueprint)', bg: 'var(--blueprint-soft)' },
  en_pause: { label: 'En pause', color: 'var(--ochre)', bg: 'var(--ochre-soft)' },
  termine: { label: 'Terminé', color: 'var(--moss)', bg: 'var(--moss-soft)' },
}

export const PAYMENT_METHODS = {
  cash: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement',
  mobile_money: 'Mobile money',
  autre: 'Autre',
}

export const MARCHE_OPTIONS = {
  M1: 'M1',
  M2: 'M2',
}

export const DEFAULT_TVA = 18
