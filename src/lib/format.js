export function formatAmount(value, currency = 'XOF') {
  const n = Number(value || 0)
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(n) + ' ' + currency
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
