import { createContext, useContext, useEffect, useState } from 'react'

export const EUR_TO_XOF = 655.957

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    return localStorage.getItem('buildgest_display_currency') || 'XOF'
  })

  useEffect(() => {
    localStorage.setItem('buildgest_display_currency', displayCurrency)
  }, [displayCurrency])

  function toggleCurrency() {
    setDisplayCurrency((c) => (c === 'XOF' ? 'EUR' : 'XOF'))
  }

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

// Toutes les valeurs sont stockées en base en XOF. Cette fonction convertit
// pour l'affichage uniquement, selon la devise choisie par l'utilisateur.
export function convertFromXOF(valueXOF, displayCurrency) {
  const n = Number(valueXOF || 0)
  if (displayCurrency === 'EUR') return n / EUR_TO_XOF
  return n
}
