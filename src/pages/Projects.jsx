import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects, createProject } from '../lib/data'
import { formatAmount, PROJECT_STATUS } from '../lib/format'
import { useCurrency } from '../lib/currency'
import { Badge, Panel, Button, Modal, Field, Input, Select, TextArea, EmptyState } from '../components/ui'

const emptyForm = {
  name: '',
  city: '',
  address: '',
  total_budget: '',
  currency: 'XOF',
  start_date: '',
  target_end_date: '',
  status: 'planifie',
  notes: '',
}

export default function Projects() {
  const { displayCurrency } = useCurrency()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setProjects(await listProjects())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createProject({
        ...form,
        total_budget: Number(form.total_budget || 0),
        start_date: form.start_date || null,
        target_end_date: form.target_end_date || null,
      })
      setForm(emptyForm)
      setOpen(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--rust)]">
            01 — Immeubles
          </p>
          <h2 className="text-[28px] font-extrabold mt-1">Chantiers en cours</h2>
        </div>
        <Button onClick={() => setOpen(true)}>+ Nouvel immeuble</Button>
      </div>

      {loading ? (
        <p className="text-[var(--ink-soft)]">Chargement…</p>
      ) : projects.length === 0 ? (
        <EmptyState
          title="Aucun immeuble enregistré"
          description="Crée ton premier chantier avec son budget global pour commencer le suivi."
          action={<Button onClick={() => setOpen(true)}>+ Nouvel immeuble</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/projets/${p.id}`}>
              <Panel className="p-5 h-full hover:border-[var(--ink)] transition-colors flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-bold">{p.name}</h3>
                  <Badge {...PROJECT_STATUS[p.status]} />
                </div>
                <p className="text-[13px] text-[var(--ink-soft)]">
                  {p.city || p.address || 'Localisation non renseignée'}
                </p>
                <p className="font-mono-data text-[15px] font-semibold mt-auto">
                  {formatAmount(p.total_budget, displayCurrency)}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvel immeuble">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nom du projet">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Résidence Almadies"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville">
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Dakar"
              />
            </Field>
            <Field label="Statut">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {Object.entries(PROJECT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Adresse">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="Budget total (XOF)">
            <Input
              type="number"
              min="0"
              required
              value={form.total_budget}
              onChange={(e) => setForm({ ...form, total_budget: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début prévu">
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </Field>
            <Field label="Fin visée">
              <Input
                type="date"
                value={form.target_end_date}
                onChange={(e) => setForm({ ...form, target_end_date: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Créer l\u2019immeuble'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
