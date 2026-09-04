# Suivi Construction

Suivi de l'avancement de chantiers (par étapes), des paiements aux fournisseurs
(cash, chèque, virement, mobile money) et du budget, pour un ou plusieurs
immeubles. Même logique que ImmoGest : React/Vite + Supabase, pas de
compte/login — le lien se partage tel quel.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → New project.
2. Une fois le projet créé, ouvre **SQL Editor** → colle le contenu de
   `supabase/schema.sql` → Run. Ça crée les 4 tables (`projects`, `phases`,
   `suppliers`, `payments`) avec accès public en lecture/écriture (comme
   ImmoGest, via la clé anonyme — pas d'authentification pour l'instant).
3. Va dans **Project Settings → API** et récupère :
   - `Project URL`
   - `anon public key`

## 2. Configurer le projet en local

```bash
npm install
cp .env.example .env.local
```

Renseigne dans `.env.local` :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

```bash
npm run dev
```

## 3. Déployer sur Vercel

1. Pousse ce dossier sur un repo GitHub (ex : `suivi-chantier`).
2. Sur [vercel.com](https://vercel.com) → New Project → importe le repo.
3. Dans les Environment Variables de Vercel, ajoute `VITE_SUPABASE_URL` et
   `VITE_SUPABASE_ANON_KEY` (les mêmes que ton `.env.local`).
4. Deploy. Le lien Vercel se partage exactement comme immogest-nine.vercel.app.

## Structure des données

- **Immeubles (`projects`)** : nom, ville/adresse, budget total, devise,
  dates, statut.
- **Étapes (`phases`)** : rattachées à un immeuble, ordonnées, avec un statut
  (à venir / en cours / terminée / bloquée) — cliquer sur le numéro d'une
  étape fait avancer son statut.
- **Fournisseurs (`suppliers`)** : nom, corps de métier, contact.
- **Paiements (`payments`)** : montant, date, mode de paiement (cash, chèque,
  virement, mobile money), fournisseur, immeuble, étape liée (optionnelle),
  référence (n° de chèque, réf. de virement...).

## Pistes d'évolution

- Multi-devise / conversion automatique si des paiements sont en EUR/USD.
- Export du registre de paiements en Excel/PDF.
- Comptes utilisateurs si tu veux restreindre l'accès (actuellement ouvert à
  qui a le lien, comme ImmoGest).
- Photos de chantier par étape (upload vers Supabase Storage).
