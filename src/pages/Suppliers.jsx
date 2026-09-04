import { useEffect, useMemo, useState } from 'react'
import { listSuppliers, createSupplier, deleteSupplier, listPayments } from '../lib/data'
import { formatAmount, DEFAULT_TVA } from '../lib/format'
import { useCurrency } from '../lib/currency'
import { Panel, Button, Modal, Field, Input, TextArea, EmptyState } from '../components/ui'

const emptyForm = {
  name: '',
  trade: '',
  contact_name: '',
  phone: '',
  marche_montant_ht: '',
  marche_tva_taux: String(DEFAULT_TVA),
  notes: '',
}

export default function Suppliers() {
  const { displayCurrency } = useCurrency()
  const [suppliers, setSuppliers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    const [sup, pay] = await Promise.all([listSuppliers(), listPayments()])
    setSuppliers(sup)
    setPayments(pay)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const paidBySupplier = useMemo(() => {
    const map = {}
    for (const p of payments) {
      map[p.supplier_id] = (map[p.supplier_id] || 0) + Number(p.amount || 0)
    }
    return map
  }, [payments])

  const ht = Number(form.marche_montant_ht || 0)
  const tva = Number(form.marche_tva_taux || 0)
  const ttc = ht + ht * (tva / 100)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createSupplier({
        name: form.name,
        trade: form.trade,
        contact_name: form.contact_name,
        phone: form.phone,
        marche_montant_ht: form.marche_montant_ht ? ht : null,
        marche_tva_taux: form.marche_montant_ht ? tva : null,
        marche_montant_ttc: form.marche_montant_ht ? ttc : null,
        notes: form.notes,
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
          <table className="w-full text-[14px] min-w-[820px]">
            <thead>
              <tr className="border-b border-[var(--line-strong)] text-left text-[12px] uppercase tracking-wide text-[var(--ink-soft)]">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Corps de métier</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Marché TTC</th>
                <th className="px-4 py-3 text-right">Payé</th>
                <th className="px-4 py-3 text-right">Reste dû</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => {
                const paid = paidBySupplier[s.id] || 0
                const marche = Number(s.marche_montant_ttc || 0)
                const remaining = marche > 0 ? marche - paid : null
                return (
                  <tr key={s.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{s.trade || '—'}</td>
                    <td className="px-4 py-3">
                      {s.contact_name || '—'}
                      {s.phone && <span className="text-[var(--ink-soft)]"> · {s.phone}</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data">
                      {marche > 0 ? formatAmount(marche, displayCurrency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data">
                      {formatAmount(paid, displayCurrency)}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono-data font-semibold"
                      style={{ color: remaining != null && remaining < 0 ? 'var(--danger)' : undefined }}
                    >
                      {remaining != null ? formatAmount(remaining, displayCurrency) : '—'}
                    </td>
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
                )
              })}
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

          <div className="pt-2 border-t border-[var(--line)]">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-3">
              Marché attribué (optionnel)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Montant HT">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.marche_montant_ht}
                  onChange={(e) => setForm({ ...form, marche_montant_ht: e.target.value })}
                />
              </Field>
              <Field label="TVA (%)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.marche_tva_taux}
                  onChange={(e) => setForm({ ...form, marche_tva_taux: e.target.value })}
                />
              </Field>
            </div>
            {form.marche_montant_ht && (
              <p className="text-[13px] font-mono-data font-semibold mt-2">
                Montant TTC : {formatAmount(ttc, displayCurrency)}
              </p>
            )}
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
