import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCurrency } from '../lib/currency'

const NAV = [
  { to: '/', label: 'Tableau de bord', code: '00' },
  { to: '/projets', label: 'Immeubles', code: '01' },
  { to: '/paiements', label: 'Paiements', code: '02' },
  { to: '/fournisseurs', label: 'Fournisseurs', code: '03' },
]

const PAGE_SUBTITLES = {
  '/': "Vue d'ensemble",
}

const TODAY = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export default function Layout() {
  const location = useLocation()
  const current = NAV.find((n) => (n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)))

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--line-strong)] bg-[var(--paper-raised)]">
        <div className="px-6 py-6 border-b border-[var(--line)] flex items-center gap-3">
          <div
            className="w-10 h-10 shrink-0 flex items-center justify-center text-[20px]"
            style={{ backgroundColor: 'var(--rust)' }}
          >
            🏗️
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold leading-tight">BuildGest</h1>
            <p className="text-[11px] text-[var(--ink-soft)] leading-tight">Gestion de chantier</p>
          </div>
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
        <TopBar title={current?.label} subtitle={PAGE_SUBTITLES[location.pathname]} />
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function TopBar({ title, subtitle }) {
  const { displayCurrency, setDisplayCurrency } = useCurrency()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 lg:px-10 py-4 border-b border-[var(--line-strong)] bg-[var(--paper-raised)]">
      <h2 className="text-[17px] font-bold">
        {title}
        {subtitle && <span className="text-[var(--ink-soft)] font-normal"> — {subtitle}</span>}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex border border-[var(--line-strong)]">
          <button
            onClick={() => setDisplayCurrency('XOF')}
            className={`px-3 py-1.5 text-[13px] font-semibold font-mono-data transition-colors ${
              displayCurrency === 'XOF'
                ? 'bg-[var(--rust)] text-[var(--paper-raised)]'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            FCFA
          </button>
          <button
            onClick={() => setDisplayCurrency('EUR')}
            className={`px-3 py-1.5 text-[13px] font-semibold font-mono-data transition-colors ${
              displayCurrency === 'EUR'
                ? 'bg-[var(--rust)] text-[var(--paper-raised)]'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            EUR
          </button>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1.5 text-[13px] border border-[var(--line)] text-[var(--ink-soft)] capitalize">
          {TODAY}
        </span>
      </div>
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
