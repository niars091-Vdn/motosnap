# ✅ Checklist completa — MotoSnap go-live

Spunta ogni voce prima di considerarti online.

---

## 🗄️ Supabase (Database)

- [ ] Progetto creato su supabase.com
- [ ] Regione selezionata: `eu-west-1` (Irlanda) per latenza bassa con utenti italiani
- [ ] Migrazione eseguita: `supabase/migrations/001_schema.sql` incollata nel SQL Editor
- [ ] Verificato che le tabelle esistono: `profiles`, `bikes`, `scans`, `community_posts`, ecc.
- [ ] RLS abilitato (verificabile: ogni tabella ha l'icona lucchetto su Supabase)
- [ ] Email templates personalizzati (Authentication → Email Templates)
  - [ ] Conferma email
  - [ ] Magic Link
  - [ ] Reset password
- [ ] SMTP personalizzato configurato (opzionale ma consigliato per evitare spam)
  - Usa Resend.com (gratuito fino a 100 email/giorno) o SendGrid
  - Supabase → Project Settings → Auth → SMTP Settings

---

## 🔐 Autenticazione

- [ ] Email/Password: abilitato (default ✅)
- [ ] Magic Link: abilitato (default ✅)
- [ ] **Google OAuth**: configurato (vedi SETUP_AUTH.md)
  - [ ] Client ID inserito su Supabase
  - [ ] Client Secret inserito su Supabase
  - [ ] Redirect URI aggiunto su Google Cloud Console
- [ ] **Apple OAuth**: configurato (opzionale, vedi SETUP_AUTH.md)
- [ ] URL di redirect aggiornati con dominio reale in Supabase → Auth → URL Configuration
  - Site URL: `https://motosnap.app`
  - Redirect URLs: `https://motosnap.app/api/auth/callback`

---

## 🌐 Dominio

- [ ] Dominio acquistato (Namecheap / Cloudflare / Aruba)
  - Suggerito: `motosnap.app` o `getmotosnap.com` (~€10-15/anno)
- [ ] Dominio collegato a Vercel (Vercel → Project → Settings → Domains)
- [ ] SSL attivo (automatico su Vercel ✅)
- [ ] `NEXT_PUBLIC_APP_URL` aggiornato con il dominio reale

---

## ▲ Vercel (Hosting)

- [ ] Progetto importato da GitHub
- [ ] Framework: Next.js (auto-rilevato)
- [ ] **Variabili d'ambiente** aggiunte (Settings → Environment Variables):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `ANTHROPIC_API_KEY` (opzionale)
- [ ] Deploy riuscito (build verde ✅)
- [ ] Dominio custom collegato

---

## 🖼️ Icone e assets

- [ ] Icone PWA generate: `node scripts/generate-icons.mjs`
  - Richiede: `npm install sharp` una volta
- [ ] `public/icons/` contiene tutti i PNG (72, 96, 128, 144, 152, 180, 192, 384, 512)
- [ ] `public/favicon.ico` presente
- [ ] `public/og-image.png` creata (1200×630px — per i link share su WhatsApp/social)
  - Puoi crearla con Figma, Canva o chiedila a me!
- [ ] `public/screenshots/scan.png` e `garage.png` (per il manifest PWA, opzionale)

---

## 👤 Admin

- [ ] Registrato il tuo account sull'app
- [ ] Promosso ad admin via SQL:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'tua@email.com';
  ```
- [ ] Dashboard funzionante su `https://motosnap.app/dashboard`

---

## ⚖️ Legale (obbligatorio in EU)

- [ ] Privacy Policy pubblicata su `/privacy` ✅ (già creata)
- [ ] Termini di Servizio pubblicati su `/terms` ✅ (già creati)
- [ ] Link a Privacy e Termini visibili nella pagina di registrazione ✅
- [ ] Cookie banner (opzionale se usi solo cookie tecnici — il tuo caso)
  - Usiamo solo cookie di sessione → non serve consenso cookie in Italia
- [ ] Email di contatto funzionante: `support@motosnap.app` / `privacy@motosnap.app`
  - Crea alias su Improvmx.com (gratis) che forwards alla tua email

---

## 🧪 Test prima del lancio

- [ ] Registrazione nuovo account funziona
- [ ] Login con email/password funziona
- [ ] Login con Google funziona
- [ ] Magic Link funziona (controlla anche spam)
- [ ] Reset password funziona
- [ ] Scansione AI funziona (aggiungi la tua chiave Anthropic in Profilo)
- [ ] Aggiunta moto al garage funziona
- [ ] Community: post e like funzionano
- [ ] Dashboard admin accessibile
- [ ] App installabile come PWA (Chrome → "Aggiungi alla schermata Home")
- [ ] Test su iPhone Safari (importante: Apple è strict sulla PWA)

---

## 📊 Analytics e monitoring

- [ ] Vercel Analytics attivo (gratuito, già integrato nel codice ✅)
- [ ] Supabase → Reports per query lente
- [ ] Imposta alert su Vercel per errori 5xx (Settings → Notifications)

---

## 🚀 Lancio

- [ ] Post su Reddit /r/moto, /r/motociclismo
- [ ] Post su forum italiani (MotoBB.it, Supersportivo.it)
- [ ] Pagina Instagram creata
- [ ] Product Hunt (opzionale ma efficace)

---

## Costi mensili stimati a regime

| Servizio    | Gratis fino a | Poi         |
|-------------|---------------|-------------|
| Supabase    | 50.000 utenti | $25/mese    |
| Vercel      | Uso personale | $20/mese    |
| Anthropic   | €0 (chiave utente) | €0 sempre |
| Dominio     | —             | ~€12/anno   |
| **Totale**  | **€0/mese**   | **~€45/mese** solo con migliaia di utenti attivi |
