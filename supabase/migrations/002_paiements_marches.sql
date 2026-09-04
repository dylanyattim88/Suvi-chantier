-- Migration : à exécuter une seule fois dans le SQL Editor de Supabase
-- (pour une base BuildGest existante, créée avant l'ajout de ces champs)

alter table payments add column if not exists montant_ht numeric(14,2);
alter table payments add column if not exists tva_taux numeric(5,2) default 18;
alter table payments add column if not exists marche text check (marche in ('M1','M2'));

alter table suppliers add column if not exists marche_montant_ht numeric(14,2);
alter table suppliers add column if not exists marche_tva_taux numeric(5,2) default 18;
alter table suppliers add column if not exists marche_montant_ttc numeric(14,2);
