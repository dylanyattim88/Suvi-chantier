import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects, listPayments, listPhases } from '../lib/data'
import { formatAmount, PROJECT_STATUS } from '../lib/format'
import { useCurrency } from '../lib/currency'
import { Badge, Panel, EmptyState, Button } from '../components/ui'

export default function Dashboard() {
  const { displayCurrency } = useCurrency()
  const [state, setState] = useState({ loading: true, projects: [], payments: [] })

  useEffect(() => {
    let alive = true
    async function load() {
      const [projects, payments] = await Promise.all([listProjects(), listPayments()])
      const phasesByProject = {}
      for (const p of projects) {
        phasesByProject[p.id] = await listPhases(p.id)
      }
      if (alive) setState({ loading: false, projects, payments, phasesByProject })
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  if (state.loading) return <p className="text-[var(--ink-soft)]">Chargement…</p>

  const { projects, payments, phasesByProject } = state

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Aucun immeuble pour l’instant"
        description="Ajoute ton premier chantier pour commencer à suivre son avancement et ses paiements."
        action={
          <Link to="/projets">
            <Button>Ajouter un immeuble</Button>
          </Link>
        }
      />
    )
  }

  const totalBudget = projects.reduce((s, p) => s + Number(p.total_budget || 0), 0)
  const totalSpent = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-[28px] font-extrabold">Tous les chantiers</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line-strong)] border border-[var(--line-strong)]">
        <Stat label="Immeubles suivis" value={projects.length} />
        <Stat label="Budget total engagé" value={formatAmount(totalBudget, displayCurrency)} mono />
        <Stat label="Total payé aux fournisseurs" value={formatAmount(totalSpent, displayCurrency)} mono />
      </div>

      <div className="flex flex-col gap-4">
        {projects.map((project) => {
          const spent = payments
            .filter((p) => p.project_id === project.id)
            .reduce((s, p) => s + Number(p.amount || 0), 0)
          const budget = Number(project.total_budget || 0)
          const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
          const phases = (phasesByProject && phasesByProject[project.id]) || []
          const done = phases.filter((ph) => ph.status === 'termine').length

          return (
            <Link key={project.id} to={`/projets/${project.id}`}>
              <Panel className="p-5 hover:border-[var(--ink)] transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[18px] font-bold">{project.name}</h3>
                    <p className="text-[13px] text-[var(--ink-soft)]">
                      {project.city || project.address || 'Localisation non renseignée'}
                    </p>
                  </div>
                  <Badge {...PROJECT_STATUS[project.status]} />
                </div>

                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex justify-between text-[13px] font-mono-data">
                    <span>{formatAmount(spent, displayCurrency)} payé</span>
                    <span className="text-[var(--ink-soft)]">
                      / {formatAmount(budget, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--paper)] border border-[var(--line-strong)]">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 100 ? 'var(--danger)' : 'var(--rust)',
                      }}
                    />
                  </div>
                </div>

                {phases.length > 0 && (
                  <p className="text-[13px] text-[var(--ink-soft)]">
                    {done} / {phases.length} étapes terminées
                  </p>
                )}
              </Panel>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, mono }) {
  return (
    <div className="bg-[var(--paper-raised)] p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        {label}
      </p>
      <p className={`text-[22px] font-extrabold mt-1 ${mono ? 'font-mono-data' : ''}`}>{value}</p>
    </div>
  )
}
