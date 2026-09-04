import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, Input, Select, TextArea, Button } from './ui'
import { PAYMENT_METHODS, MARCHE_OPTIONS, DEFAULT_TVA } from '../lib/format'

const empty = {
  project_id: '',
  supplier_id: '',
  phase_id: '',
  montant_ht: '',
  tva_taux: String(DEFAULT_TVA),
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'cash',
  marche: '',
  reference: '',
  notes: '',
}

export default function PaymentForm({
  projects, // pass null/undefined to hide the project selector (already scoped to one project)
  suppliers,
  phases, // phases for the currently selected project
  onProjectChange, // called when the project selector changes (global page only)
  onSubmit,
  onCancel,
  saving,
}) {
  const [form, setForm] = useState(empty)

  const ht = Number(form.montant_ht || 0)
  const tva = Number(form.tva_taux || 0)
  const ttc = useMemo(() => ht + ht * (tva / 100), [ht, tva])
  const tvaMontant = useMemo(() => ht * (tva / 100), [ht, tva])

  useEffect(() => {
    if (projects && !form.project_id && projects.length > 0) {
      setForm((f) => ({ ...f, project_id: projects[0].id }))
      onProjectChange?.(projects[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      project_id: form.project_id,
      supplier_id: form.supplier_id,
      phase_id: form.phase_id || null,
      amount: ttc,
      montant_ht: ht,
      tva_taux: tva,
      marche: form.marche || null,
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      reference: form.reference,
      notes: form.notes,
    })
  }

  const supplierMissing = suppliers.length === 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {projects && (
        <Field label="Immeuble">
          <Select
            required
            value={form.project_id}
            onChange={(e) => {
              setForm({ ...form, project_id: e.target.value, phase_id: '' })
              onProjectChange?.(e.target.value)
            }}
          >
            <option value="">Sélectionner…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Fournisseur">
        <Select
          required
          value={form.supplier_id}
          onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
        >
          <option value="">Sélectionner…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      {supplierMissing && (
        <p className="text-[13px] text-[var(--ink-soft)] -mt-2">
          Aucun fournisseur pour l'instant —{' '}
          <Link to="/fournisseurs" className="underline">
            ajoute-en un
          </Link>{' '}
          d'abord.
        </p>
      )}

      <Field label="Étape liée (optionnel)">
        <Select
          value={form.phase_id}
          onChange={(e) => setForm({ ...form, phase_id: e.target.value })}
          disabled={!phases || phases.length === 0}
        >
          <option value="">Aucune</option>
          {(phases || []).map((ph) => (
            <option key={ph.id} value={ph.id}>
              {ph.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Montant HT">
          <Input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.montant_ht}
            onChange={(e) => setForm({ ...form, montant_ht: e.target.value })}
          />
        </Field>
        <Field label="TVA (%)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.tva_taux}
            onChange={(e) => setForm({ ...form, tva_taux: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 -mt-1">
        <p className="text-[13px] text-[var(--ink-soft)] font-mono-data">
          TVA : {tvaMontant.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
        </p>
        <p className="text-[13px] font-semibold font-mono-data">
          Montant TTC : {ttc.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date du paiement">
          <Input
            type="date"
            required
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          />
        </Field>
        <Field label="Type de règlement">
          <Select
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          >
            {Object.entries(PAYMENT_METHODS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Marché" hint="Distinction interne M1 / M2">
        <Select value={form.marche} onChange={(e) => setForm({ ...form, marche: e.target.value })}>
          <option value="">—</option>
          {Object.entries(MARCHE_OPTIONS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Référence (n° chèque, réf. virement…)">
        <Input
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
        />
      </Field>

      <Field label="Observation">
        <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </Field>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving || supplierMissing || (projects && !form.project_id)}>
          {saving ? 'Enregistrement…' : 'Enregistrer le paiement'}
        </Button>
      </div>
    </form>
  )
}
