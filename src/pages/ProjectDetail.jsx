import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getProject,
  listPhases,
  createPhase,
  updatePhase,
  listSuppliers,
  listPayments,
  createPayment,
  deletePayment,
} from '../lib/data'
import { formatAmount, formatDate, PHASE_STATUS, PROJECT_STATUS, PAYMENT_METHODS, MARCHE_OPTIONS } from '../lib/format'
import { useCurrency } from '../lib/currency'
import { Badge, Panel, Button, Modal, Field, Input, TextArea } from '../components/ui'
import PaymentForm from '../components/PaymentForm'

const emptyPhase = { name: '', planned_start: '', planned_end: '', notes: '' }

export default function ProjectDetail() {
  const { id } = useParams()
  const { displayCurrency } = useCurrency()
  const [project, setProject] = useState(null)
  const [phases, setPhases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [phaseModal, setPhaseModal] = useState(false)
  const [phaseForm, setPhaseForm] = useState(emptyPhase)
  const [paymentModal, setPaymentModal] = useState(false)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const [proj, ph, sup, pay] = await Promise.all([
      getProject(id),
      listPhases(id),
      listSuppliers(),
      listPayments({ projectId: id }),
    ])
    setProject(proj)
    setPhases(ph)
    setSuppliers(sup)
    setPayments(pay)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAddPhase(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createPhase({
        project_id: id,
        name: phaseForm.name,
        order_index: phases.length,
        planned_start: phaseForm.planned_start || null,
        planned_end: phaseForm.planned_end || null,
        notes: phaseForm.notes,
      })
      setPhaseForm(emptyPhase)
      setPhaseModal(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function cyclePhaseStatus(phase) {
    const order = ['a_venir', 'en_cours', 'termine']
    const next = order[(order.indexOf(phase.status) + 1) % order.length]
    await updatePhase(phase.id, {
      status: next,
      actual_start:
        next === 'en_cours' && !phase.actual_start
          ? new Date().toISOString().slice(0, 10)
          : phase.actual_start,
      actual_end: next === 'termine' ? new Date().toISOString().slice(0, 10) : phase.actual_end,
    })
    await refresh()
  }

  async function handleAddPayment(payload) {
    setSaving(true)
    try {
      await createPayment(payload)
      setPaymentModal(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  if (loading || !project) return <p className="text-[var(--ink-soft)]">Chargement…</p>

  const spent = payments.reduce((s, p) => s + Number(p.amount || 0), 0)
  const budget = Number(project.total_budget || 0)
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/projets" className="text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)]">
          ← Tous les immeubles
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h2 className="text-[28px] font-extrabold">{project.name}</h2>
            <p className="text-[14px] text-[var(--ink-soft)]">
              {project.city || project.address || 'Localisation non renseignée'}
            </p>
          </div>
          <Badge {...PROJECT_STATUS[project.status]} />
        </div>
      </div>

      <Panel className="p-5">
        <div className="flex justify-between text-[14px] font-mono-data mb-2">
          <span className="font-semibold">{formatAmount(spent, displayCurrency)} payé</span>
          <span className="text-[var(--ink-soft)]">
            Budget {formatAmount(budget, displayCurrency)}
          </span>
        </div>
        <div className="h-2.5 bg-[var(--paper)] border border-[var(--line-strong)]">
          <div
            className="h-full"
            style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--danger)' : 'var(--rust)' }}
          />
        </div>
        <p className="text-[13px] text-[var(--ink-soft)] mt-2">
          {pct}% du budget engagé · {formatAmount(Math.max(0, budget - spent), displayCurrency)} restants
        </p>
      </Panel>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
            Étapes de construction
          </h3>
          <Button variant="secondary" onClick={() => setPhaseModal(true)}>
            + Ajouter une étape
          </Button>
        </div>

        {phases.length === 0 ? (
          <p className="text-[14px] text-[var(--ink-soft)]">
            Aucune étape définie. Ajoute les grandes phases du chantier (fondations, gros œuvre, toiture…).
          </p>
        ) : (
          <ol className="flex flex-col gap-0">
            {phases.map((phase, i) => (
              <li key={phase.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => cyclePhaseStatus(phase)}
                    className="w-8 h-8 shrink-0 flex items-center justify-center font-mono-data text-[13px] font-semibold border"
                    style={{
                      borderColor: PHASE_STATUS[phase.status].color,
                      color: PHASE_STATUS[phase.status].color,
                      backgroundColor: PHASE_STATUS[phase.status].bg,
                    }}
                    title="Cliquer pour changer le statut"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                  {i < phases.length - 1 && (
                    <div className="w-px flex-1 min-h-6 bg-[var(--line-strong)]" />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[15px]">{phase.name}</p>
                    <Badge {...PHASE_STATUS[phase.status]} />
                  </div>
                  <p className="text-[13px] text-[var(--ink-soft)] mt-0.5">
                    Prévu {formatDate(phase.planned_start)} → {formatDate(phase.planned_end)}
                    {phase.actual_end && ` · Terminée le ${formatDate(phase.actual_end)}`}
                  </p>
                  {phase.notes && <p className="text-[13px] mt-1">{phase.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
            Paiements fournisseurs
          </h3>
          <Button variant="secondary" onClick={() => setPaymentModal(true)}>
            + Ajouter un paiement
          </Button>
        </div>

        {payments.length === 0 ? (
          <p className="text-[14px] text-[var(--ink-soft)]">Aucun paiement enregistré pour ce chantier.</p>
        ) : (
          <Panel className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[860px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                  <th className="px-4 py-3">Date</th>
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
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="px-4 py-3">
                      {p.suppliers?.name}
                      {p.suppliers?.trade && (
                        <span className="text-[var(--ink-soft)]"> · {p.suppliers.trade}</span>
                      )}
                    </td>
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
        )}
      </section>

      <Modal open={phaseModal} onClose={() => setPhaseModal(false)} title="Nouvelle étape">
        <form onSubmit={handleAddPhase} className="flex flex-col gap-4">
          <Field label="Nom de l'étape">
            <Input
              required
              value={phaseForm.name}
              onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
              placeholder="Ex : Fondations"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début prévu">
              <Input
                type="date"
                value={phaseForm.planned_start}
                onChange={(e) => setPhaseForm({ ...phaseForm, planned_start: e.target.value })}
              />
            </Field>
            <Field label="Fin prévue">
              <Input
                type="date"
                value={phaseForm.planned_end}
                onChange={(e) => setPhaseForm({ ...phaseForm, planned_end: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea
              value={phaseForm.notes}
              onChange={(e) => setPhaseForm({ ...phaseForm, notes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setPhaseModal(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Nouveau paiement">
        <PaymentForm
          suppliers={suppliers}
          phases={phases}
          onSubmit={(payload) => handleAddPayment({ ...payload, project_id: id })}
          onCancel={() => setPaymentModal(false)}
          saving={saving}
        />
      </Modal>
    </div>
  )
}
