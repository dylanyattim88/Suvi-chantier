import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getProject,
  listPhases,
  createPhase,
  updatePhase,
  deletePhase,
  listSuppliers,
  listPayments,
  createPayment,
  deletePayment,
} from '../lib/data'
import { formatAmount, formatDate, PHASE_STATUS, PROJECT_STATUS, PAYMENT_METHODS } from '../lib/format'
import { Badge, Panel, Button, Modal, Field, Input, Select, TextArea } from '../components/ui'

const emptyPhase = { name: '', planned_start: '', planned_end: '', notes: '' }
const emptyPayment = {
  supplier_id: '',
  phase_id: '',
  amount: '',
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'cash',
  reference: '',
  notes: '',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [phases, setPhases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [phaseModal, setPhaseModal] = useState(false)
  const [phaseForm, setPhaseForm] = useState(emptyPhase)
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState(emptyPayment)
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
      actual_start: next === 'en_cours' && !phase.actual_start ? new Date().toISOString().slice(0, 10) : phase.actual_start,
      actual_end: next === 'termine' ? new Date().toISOString().slice(0, 10) : phase.actual_end,
    })
    await refresh()
  }

  async function handleAddPayment(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createPayment({
        project_id: id,
        supplier_id: paymentForm.supplier_id,
        phase_id: paymentForm.phase_id || null,
        amount: Number(paymentForm.amount),
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
      })
      setPaymentForm(emptyPayment)
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
          <span className="font-semibold">{formatAmount(spent, project.currency)} payé</span>
          <span className="text-[var(--ink-soft)]">
            Budget {formatAmount(budget, project.currency)}
          </span>
        </div>
        <div className="h-2.5 bg-[var(--paper)] border border-[var(--line-strong)]">
          <div
            className="h-full"
            style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--danger)' : 'var(--rust)' }}
          />
        </div>
        <p className="text-[13px] text-[var(--ink-soft)] mt-2">
          {pct}% du budget engagé · {formatAmount(Math.max(0, budget - spent), project.currency)} restants
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
            <table className="w-full text-[14px] min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Montant</th>
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
                    <td className="px-4 py-3">{PAYMENT_METHODS[p.payment_method]}</td>
                    <td className="px-4 py-3 text-right font-mono-data font-semibold">
                      {formatAmount(p.amount, project.currency)}
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
        <form onSubmit={handleAddPayment} className="flex flex-col gap-4">
          <Field label="Fournisseur">
            <Select
              required
              value={paymentForm.supplier_id}
              onChange={(e) => setPaymentForm({ ...paymentForm, supplier_id: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          {suppliers.length === 0 && (
            <p className="text-[13px] text-[var(--ink-soft)] -mt-2">
              Aucun fournisseur pour l'instant — <Link to="/fournisseurs" className="underline">ajoute-en un</Link> d'abord.
            </p>
          )}
          <Field label="Étape liée (optionnel)">
            <Select
              value={paymentForm.phase_id}
              onChange={(e) => setPaymentForm({ ...paymentForm, phase_id: e.target.value })}
            >
              <option value="">Aucune</option>
              {phases.map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant">
              <Input
                type="number"
                min="0"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                required
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Mode de paiement">
            <Select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
            >
              {Object.entries(PAYMENT_METHODS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Référence (n° chèque, réf. virement…)">
            <Input
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
            />
          </Field>
          <Field label="Notes">
            <TextArea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setPaymentModal(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving || suppliers.length === 0}>
              {saving ? 'Enregistrement…' : 'Enregistrer le paiement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
