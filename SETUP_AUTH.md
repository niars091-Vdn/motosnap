# 🔐 Guida configurazione OAuth — Google & Apple

---

## ✅ Email/Password (già funziona senza configurazione)

Su Supabase → Authentication → Providers → Email è abilitato di default.

---

## 🔵 Google OAuth (15 minuti)

### 1. Crea progetto Google Cloud

1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuovo progetto: **MotoSnap**
3. Menu → **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `MotoSnap`
   - User support email: la tua email
   - Authorized domains: `supabase.co`, `motosnap.vercel.app`
   - Salva e continua

### 2. Crea le credenziali OAuth

1. Menu → **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `MotoSnap Web`
5. **Authorized redirect URIs** — aggiungi:
   ```
   https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   (sostituisci `xxxxxxxxxxxx` con il tuo project ID Supabase)
6. Copia **Client ID** e **Client Secret**

### 3. Configura su Supabase

1. Supabase → **Authentication** → **Providers** → **Google**
2. Enable: ✅
3. Client ID: incolla qui
4. Client Secret: incolla qui
5. **Save**

✅ Fatto! Il pulsante "Continua con Google" funzionerà.

---

## 🍎 Apple OAuth (30 minuti — richiede account Apple Developer €99/anno)

### 1. Crea App ID su Apple Developer

1. Vai su [developer.apple.com](https://developer.apple.com) → **Certificates, IDs & Profiles**
2. **Identifiers** → **+** → **App IDs** → **App** → Continue
3. Description: `MotoSnap`
4. Bundle ID (Explicit): `com.motosnap.app`
5. Capabilities: spunta **Sign In with Apple** → Continue → Register

### 2. Crea Services ID (per web)

1. **Identifiers** → **+** → **Services IDs** → Continue
2. Description: `MotoSnap Web`
3. Identifier: `com.motosnap.web`
4. Enable: **Sign In with Apple** → Configure
   - Primary App ID: `com.motosnap.app`
   - Domains: `motosnap.vercel.app`
   - Return URLs:
     ```
     https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```
5. Continue → Register

### 3. Crea Private Key

1. **Keys** → **+**
2. Name: `MotoSnap Sign In Key`
3. Enable: **Sign In with Apple** → Configure → seleziona `com.motosnap.app`
4. Continue → Register → **Download** il file `.p8` (salvalo sicuro, scaricabile solo una volta!)
5. Annota il **Key ID** mostrato

### 4. Configura su Supabase

1. Supabase → **Authentication** → **Providers** → **Apple**
2. Enable: ✅
3. **Service ID (client_id)**: `com.motosnap.web`
4. **Team ID**: 10 caratteri visibili in alto a destra su developer.apple.com
5. **Key ID**: il Key ID annotato al passo 3
6. **Private Key**: apri il file `.p8` scaricato, copia tutto il contenuto incluso `-----BEGIN PRIVATE KEY-----`
7. **Save**

✅ Il pulsante "Continua con Apple" funzionerà.

---

## ✉️ Magic Link (email senza password)

Funziona automaticamente con Supabase.  
Personalizza il template email su:
**Supabase → Authentication → Email Templates → Magic Link**

Esempio template personalizzato:
```html
<h2>Accedi a MotoSnap 🏍️</h2>
<p>Clicca il link per accedere al tuo garage digitale:</p>
<a href="{{ .ConfirmationURL }}" style="background:#2a6644;color:#fff;padding:14px 28px;border-radius:100px;text-decoration:none;font-weight:700;">
  Accedi a MotoSnap
</a>
<p style="color:#999;font-size:12px;margin-top:20px">Link valido per 1 ora. Se non hai richiesto l'accesso, ignora questa email.</p>
```

---

## 🔄 Reset password

Funziona automaticamente. Il link nell'email reindirizza a `/reset-password` dove l'utente imposta la nuova password.

Personalizza il template su:
**Supabase → Authentication → Email Templates → Reset Password**

---

## Riepilogo provider supportati

| Provider | Setup | Costo |
|----------|-------|-------|
| Email/Password | ✅ Pronto | Gratis |
| Magic Link | ✅ Pronto | Gratis |
| Google | 15 min | Gratis |
| Apple | 30 min | €99/anno (Apple Developer) |
| GitHub | 10 min | Gratis |
| Facebook | 20 min | Gratis |

Per aggiungere GitHub o Facebook, il pattern è identico a Google:
su Supabase → Authentication → Providers → abilita e inserisci Client ID + Secret.
