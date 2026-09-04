-- Schéma pour le suivi de construction multi-immeubles
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor)

create extension if not exists "pgcrypto";

-- 1. Projets (immeubles)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  total_budget numeric(14,2) not null default 0,
  currency text not null default 'XOF',
  start_date date,
  target_end_date date,
  status text not null default 'en_cours' check (status in ('planifie','en_cours','en_pause','termine')),
  notes text,
  created_at timestamptz not null default now()
);

-- 2. Étapes de construction (phases), propres à chaque projet
create table if not exists phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  status text not null default 'a_venir' check (status in ('a_venir','en_cours','termine','bloque')),
  planned_start date,
  planned_end date,
  actual_start date,
  actual_end date,
  notes text,
  created_at timestamptz not null default now()
);

-- 3. Fournisseurs / prestataires
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text, -- corps de métier: maçonnerie, électricité, plomberie, ferraillage...
  contact_name text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- 4. Paiements aux fournisseurs
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  phase_id uuid references phases(id) on delete set null,
  supplier_id uuid not null references suppliers(id) on delete restrict,
  amount numeric(14,2) not null,
  payment_date date not null default current_date,
  payment_method text not null check (payment_method in ('cash','cheque','virement','mobile_money','autre')),
  reference text, -- numéro de chèque, référence de virement, etc.
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_phases_project on phases(project_id);
create index if not exists idx_payments_project on payments(project_id);
create index if not exists idx_payments_supplier on payments(supplier_id);
create index if not exists idx_payments_phase on payments(phase_id);

-- Active l'accès public en lecture/écriture via la clé anon (même logique que ImmoGest :
-- lien partagé, pas d'authentification). À restreindre plus tard si besoin d'un vrai login.
alter table projects enable row level security;
alter table phases enable row level security;
alter table suppliers enable row level security;
alter table payments enable row level security;

create policy "public full access" on projects for all using (true) with check (true);
create policy "public full access" on phases for all using (true) with check (true);
create policy "public full access" on suppliers for all using (true) with check (true);
create policy "public full access" on payments for all using (true) with check (true);
