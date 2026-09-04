import { NavLink, Outlet } from 'react-router-dom'
import { useCurrency } from '../lib/currency'

const NAV = [
  { to: '/', label: 'Vue d\u2019ensemble', code: '00' },
  { to: '/projets', label: 'Immeubles', code: '01' },
  { to: '/paiements', label: 'Paiements', code: '02' },
  { to: '/fournisseurs', label: 'Fournisseurs', code: '03' },
]

export default function Layout() {
  const { displayCurrency, toggleCurrency } = useCurrency()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--line-strong)] bg-[var(--paper-raised)]">
        <div className="px-6 py-6 border-b border-[var(--line)]">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
            Carnet de chantier
          </p>
          <h1 className="text-[20px] font-extrabold leading-tight mt-1">BuildGest</h1>
        </div>
        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--ink)] text-[var(--paper-raised)]'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--paper)]'
                }`
              }
            >
              <span className="font-mono-data text-[12px] opacity-60">{item.code}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-[var(--line)]">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-2">
            Devise d'affichage
          </p>
          <button
            onClick={toggleCurrency}
            className="w-full flex items-center justify-between border border-[var(--line-strong)] px-3 py-2 text-[14px] font-semibold font-mono-data hover:border-[var(--ink)] transition-colors"
          >
            <span className={displayCurrency === 'XOF' ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}>
              XOF
            </span>
            <span className="text-[12px] text-[var(--ink-soft)]">⇄</span>
            <span className={displayCurrency === 'EUR' ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}>
              EUR
            </span>
          </button>
          <p className="text-[11px] text-[var(--ink-soft)] mt-1.5">1 € = 655,957 XOF</p>
        </div>

        <div className="hidden lg:block px-6 py-4 mt-2 border-t border-[var(--line)] text-[12px] text-[var(--ink-soft)]">
          Legende
          <div className="mt-2 flex flex-col gap-1.5">
            <LegendRow color="var(--blueprint)" label="Phase en cours" />
            <LegendRow color="var(--moss)" label="Phase terminée" />
            <LegendRow color="var(--danger)" label="Phase bloquée" />
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}
