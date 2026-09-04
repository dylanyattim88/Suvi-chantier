import { useEffect, useMemo, useState } from 'react'
import {
  listPayments,
  listProjects,
  listSuppliers,
  listPhases,
  createPayment,
  deletePayment,
} from '../lib/data'
import { formatAmount, formatDate, PAYMENT_METHODS, MARCHE_OPTIONS } from '../lib/format'
import { useCurrency } from '../lib/currency'
import { Panel, Select, EmptyState, Button, Modal } from '../components/ui'
import PaymentForm from '../components/PaymentForm'

export default function Payments() {
  const { displayCurrency } = useCurrency()
  const [payments, setPayments] = useState([])
  const [projects, setProjects] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [phasesForSelectedProject, setPhasesForSelectedProject] = useState([])
  const [projectFilter, setProjectFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const [pay, proj, sup] = await Promise.all([listPayments(), listProjects(), listSuppliers()])
    setPayments(pay)
    setProjects(proj)
    setSuppliers(sup)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleProjectChangeInForm(projectId) {
    if (!projectId) {
      setPhasesForSelectedProject([])
      return
    }
    setPhasesForSelectedProject(await listPhases(projectId))
  }

  async function handleAddPayment(payload) {
    setSaving(true)
    try {
      await createPayment(payload)
      setModalOpen(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
            02 — Paiements
          </p>
          <h2 className="text-[28px] font-extrabold mt-1">Registre des paiements</h2>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={projects.length === 0}>
          + Nouveau paiement
        </Button>
      </div>

      {projects.length === 0 && (
        <p className="text-[14px] text-[var(--ink-soft)]">
          Crée d'abord un immeuble pour pouvoir enregistrer un paiement.
        </p>
      )}

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
            <table className="w-full text-[14px] min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Immeuble</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Marché</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">Montant TTC</th>
                  <th className="px-4 py-3">Observation</th>
                  <th className="px-4 py-3" />
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
                    <td className="px-4 py-3 text-[var(--ink-soft)]">
                      {p.marche ? MARCHE_OPTIONS[p.marche] : '—'}
                    </td>
                    <td className="px-4 py-3">{PAYMENT_METHODS[p.payment_method]}</td>
                    <td className="px-4 py-3 text-right font-mono-data">
                      {p.montant_ht != null ? formatAmount(p.montant_ht, displayCurrency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-[var(--ink-soft)]">
                      {p.montant_ht != null
                        ? formatAmount((p.amount || 0) - p.montant_ht, displayCurrency)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data font-semibold">
                      {formatAmount(p.amount, displayCurrency)}
                    </td>
                    <td className="px-4 py-3 text-[var(--ink-soft)] max-w-[180px] truncate">
                      {p.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          await deletePayment(p.id)
                          refresh()
                        }}
                        className="text-[var(--ink-soft)] hover:text-[var(--danger)] text-[13px]"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <p className="text-[14px] font-mono-data text-right font-semibold">
            Total : {formatAmount(total, displayCurrency)}
          </p>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau paiement">
        <PaymentForm
          projects={projects}
          suppliers={suppliers}
          phases={phasesForSelectedProject}
          onProjectChange={handleProjectChangeInForm}
          onSubmit={handleAddPayment}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>
    </div>
  )
}
