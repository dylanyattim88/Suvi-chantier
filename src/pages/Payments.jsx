import { useEffect, useMemo, useState } from 'react'
import { listPayments, listProjects } from '../lib/data'
import { formatAmount, formatDate, PAYMENT_METHODS } from '../lib/format'
import { Panel, Select, EmptyState } from '../components/ui'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [projects, setProjects] = useState([])
  const [projectFilter, setProjectFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pay, proj] = await Promise.all([listPayments(), listProjects()])
      setPayments(pay)
      setProjects(proj)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (projectFilter && p.project_id !== projectFilter) return false
      if (methodFilter && p.payment_method !== methodFilter) return false
      return true
    })
  }, [payments, projectFilter, methodFilter])

  const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
          02 — Paiements
        </p>
        <h2 className="text-[28px] font-extrabold mt-1">Registre des paiements</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-auto">
          <option value="">Tous les immeubles</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-auto">
          <option value="">Tous les modes de paiement</option>
          {Object.entries(PAYMENT_METHODS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-[var(--ink-soft)]">Chargement…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun paiement"
          description="Les paiements enregistrés sur tes chantiers apparaîtront ici."
        />
      ) : (
        <>
          <Panel className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[680px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Immeuble</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="px-4 py-3">{p.projects?.name}</td>
                    <td className="px-4 py-3">{p.suppliers?.name}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{p.phases?.name || '—'}</td>
                    <td className="px-4 py-3">{PAYMENT_METHODS[p.payment_method]}</td>
                    <td className="px-4 py-3 text-right font-mono-data font-semibold">
                      {formatAmount(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <p className="text-[14px] font-mono-data text-right font-semibold">
            Total : {formatAmount(total)}
          </p>
        </>
      )}
    </div>
  )
}
