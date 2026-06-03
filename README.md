# 🏍️ MotoSnap — Guida al deploy completo

App per identificare moto con AI, gestire il garage, community e prodotti affiliati.

---

## Stack

| Layer      | Tecnologia                       |
|------------|----------------------------------|
| Frontend   | Next.js 15, React 19, Tailwind v4|
| Auth       | Supabase Auth (email + Google)   |
| Database   | Supabase (PostgreSQL + RLS)      |
| AI         | Claude claude-sonnet-4-6 (Anthropic)    |
| Hosting    | Vercel (frontend + API routes)   |
| Analytics  | Vercel Analytics                 |

---

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**
2. Scegli regione `eu-west-1` (Irlanda) per utenti italiani
3. Annota:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key`     → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Esegui le migrazioni

Nel **SQL Editor** di Supabase, incolla ed esegui il file:

```
supabase/migrations/001_schema.sql
```

Crea tutte le tabelle, RLS policies, trigger e view.

### Abilita Google OAuth (opzionale)

1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. Crea OAuth 2.0 credentials
3. Redirect URI: `https://xxxx.supabase.co/auth/v1/callback`
4. Su Supabase → Auth → Providers → Google → incolla Client ID e Secret

---

## 2. Crea il progetto Vercel

1. Vai su [vercel.com](https://vercel.com) → **New Project**
2. Importa da GitHub (push prima il repo)
3. Framework: **Next.js** (auto-detect)

### Variabili d'ambiente su Vercel

Vai su **Settings → Environment Variables** e aggiungi:

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
SUPABASE_SERVICE_ROLE_KEY         = eyJ...
ANTHROPIC_API_KEY                 = sk-ant-api03-... (opzionale)
NEXT_PUBLIC_APP_URL               = https://motosnap.vercel.app
```

---

## 3. Installa e avvia in locale

```bash
# Installa dipendenze
pnpm install

# Copia variabili
cp .env.example .env.local
# → Edita .env.local con i tuoi valori

# Avvia
pnpm dev
# → http://localhost:3000
```

---

## 4. Crea il primo admin

Dopo aver registrato il tuo account, vai su Supabase SQL Editor e promuovilo:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tua@email.com';
```

La dashboard admin è su: `/dashboard`

---

## 5. Struttura file

```
motosnap/
├── app/
│   ├── page.tsx                  ← App principale (SPA mobile)
│   ├── login/page.tsx            ← Login / Registrazione
│   ├── dashboard/page.tsx        ← Admin dashboard
│   ├── api/
│   │   ├── scan/route.ts         ← POST: analisi AI foto moto
│   │   ├── garage/route.ts       ← CRUD garage
│   │   ├── community/route.ts    ← CRUD post community
│   │   ├── community/like/route.ts
│   │   ├── affiliate/route.ts    ← Track click + redirect
│   │   ├── admin/stats/route.ts  ← Statistiche admin
│   │   └── auth/callback/route.ts
├── components/
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── HelmetLogo.tsx
│   ├── NotifPanel.tsx
│   ├── ProductGrid.tsx
│   ├── SectionHeader.tsx
│   └── screens/
│       ├── ScanScreen.tsx
│       ├── GarageScreen.tsx
│       ├── CommunityScreen.tsx
│       ├── ScopriScreen.tsx
│       └── ProfiloScreen.tsx
├── hooks/
│   └── useAppState.ts
├── lib/
│   ├── supabase.ts               ← Client browser + server + admin
│   ├── database.types.ts         ← Tipi TypeScript dal DB
│   ├── data.ts                   ← Dati statici (prodotti, quiz, ecc.)
│   └── utils.ts
├── middleware.ts                 ← Auth guard + security headers
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 001_schema.sql        ← Schema completo
├── .env.example                  ← Template variabili
└── vercel.json                   ← Config deploy
```

---

## 6. Flusso utente

```
Apri app → Login/Register (Supabase Auth)
           ↓
        Home (Scan)
        ├── Foto moto → POST /api/scan → Claude AI → risultato
        ├── Conferma → POST /api/garage → salva + fetch manutenzione AI
        ├── Prodotti → click → POST /api/affiliate → redirect shop
        └── Community → GET/POST /api/community
           ↓
        Admin → /dashboard (role=admin richiesto)
        ├── KPI: utenti, scan, costo AI, affiliate click
        ├── Tabella scansioni recenti
        ├── Tabella utenti
        └── Classifica moto + grafico costi
```

---

## 7. Monetizzazione

- **Affiliazioni**: ogni click su "Vai al negozio" è tracciato in `affiliate_clicks`. Registrati ai programmi di:
  - [Megamoto](https://www.megamoto.it/affiliazione)
  - [Louis Moto](https://www.louis-moto.it/partner)
  - [Amazon Associates](https://affiliate-program.amazon.it)
- **Chiave AI**: ogni utente usa la propria chiave Anthropic → costo = €0 per te
- **Premium** (futuro): abbonamento per garage illimitato, alert prezzi, ecc.

---

## 8. Comandi utili

```bash
# Genera tipi TypeScript da Supabase (dopo modifiche DB)
pnpm db:types

# Push migrazioni su Supabase locale
pnpm db:push

# Build produzione
pnpm build
```

---

## Supporto

Apri una issue su GitHub o scrivi a: support@motosnap.app
