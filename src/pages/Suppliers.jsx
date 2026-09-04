import { useEffect, useState } from 'react'
import { listSuppliers, createSupplier, deleteSupplier } from '../lib/data'
import { Panel, Button, Modal, Field, Input, TextArea, EmptyState } from '../components/ui'

const emptyForm = { name: '', trade: '', contact_name: '', phone: '', notes: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setSuppliers(await listSuppliers())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createSupplier(form)
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
            03 — Fournisseurs
          </p>
          <h2 className="text-[28px] font-extrabold mt-1">Fournisseurs & prestataires</h2>
        </div>
        <Button onClick={() => setOpen(true)}>+ Nouveau fournisseur</Button>
      </div>

      {loading ? (
        <p className="text-[var(--ink-soft)]">Chargement…</p>
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="Aucun fournisseur"
          description="Ajoute les entreprises et artisans que tu paies sur tes chantiers."
          action={<Button onClick={() => setOpen(true)}>+ Nouveau fournisseur</Button>}
        />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-[14px] min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Corps de métier</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{s.trade || '—'}</td>
                  <td className="px-4 py-3">{s.contact_name || '—'}</td>
                  <td className="px-4 py-3 font-mono-data">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={async () => {
                        await deleteSupplier(s.id)
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau fournisseur">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nom">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Ets Diop Matériaux"
            />
          </Field>
          <Field label="Corps de métier">
            <Input
              value={form.trade}
              onChange={(e) => setForm({ ...form, trade: e.target.value })}
              placeholder="Maçonnerie, électricité, ferraillage…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact">
              <Input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </Field>
            <Field label="Téléphone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              {saving ? 'Enregistrement…' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
