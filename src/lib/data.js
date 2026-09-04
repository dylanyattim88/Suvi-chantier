import { supabase } from './supabase'

// ---------- Projets ----------
export async function listProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(id) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createProject(payload) {
  const { data, error } = await supabase.from('projects').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProject(id, payload) {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ---------- Étapes / phases ----------
export async function listPhases(projectId) {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export async function createPhase(payload) {
  const { data, error } = await supabase.from('phases').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updatePhase(id, payload) {
  const { data, error } = await supabase
    .from('phases')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePhase(id) {
  const { error } = await supabase.from('phases').delete().eq('id', id)
  if (error) throw error
}

// ---------- Fournisseurs ----------
export async function listSuppliers() {
  const { data, error } = await supabase.from('suppliers').select('*').order('name')
  if (error) throw error
  return data
}

export async function createSupplier(payload) {
  const { data, error } = await supabase.from('suppliers').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateSupplier(id, payload) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSupplier(id) {
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) throw error
}

// ---------- Paiements ----------
export async function listPayments({ projectId } = {}) {
  let query = supabase
    .from('payments')
    .select('*, projects(name), suppliers(name, trade), phases(name)')
    .order('payment_date', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createPayment(payload) {
  const { data, error } = await supabase.from('payments').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
}
