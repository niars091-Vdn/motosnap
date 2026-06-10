'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Tab = 'login' | 'register' | 'magic'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [tab,      setTab]      = useState<Tab>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState<string | null>(null)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleLogin = async () => {
    reset(); setLoading('email')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(null)
    if (error) { setError(friendlyError(error.message)); return }
    if (data.session) {
      window.location.href = '/app.html.html'
    } else {
      setError('Login fallito. Riprova.')
    }
}

  const handleRegister = async () => {
    reset()
    if (!name.trim()) { setError('Inserisci il tuo nome'); return }
    if (password.length < 8) { setError('Password minimo 8 caratteri'); return }
    setLoading('email')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    setLoading(null)
    if (error) { setError(friendlyError(error.message)); return }
    setSuccess("✅ Controlla la tua email per confermare l'account!")
  }

  const handleMagicLink = async () => {
    reset(); setLoading('magic')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })
    setLoading(null)
    if (error) { setError(friendlyError(error.message)); return }
    setSuccess('✅ Link inviato! Controlla la tua email per accedere.')
  }

  const handleGoogle = async () => {
    reset(); setLoading('google')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  const handleApple = async () => {
    reset(); setLoading('apple')
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Inserisci prima la tua email'); return }
    reset(); setLoading('reset')
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/api/auth/callback?next=/reset-password`,
    })
    setLoading(null)
    setSuccess('✅ Email per il reset inviata!')
  }

const canSubmit = tab === 'magic'
  ? email.includes('@')
  : email.includes('@') && password.length >= 6
  
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#eef2f7 0%,#e3eaf3 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Inter',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/motoshot-logo-completo.png" alt="MotoShot AI"
            style={{ width: 240, maxWidth: '80%', height: 'auto', margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 13, color: '#6b7e94', letterSpacing: '.04em' }}>Il tuo garage digitale</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 24,
          boxShadow: '0 2px 0 #d4dfec, 0 12px 40px rgba(10,30,60,.1)',
          overflow: 'hidden',
        }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eef2f7' }}>
            {([
              { id: 'login'    as Tab, label: 'Accedi' },
              { id: 'register' as Tab, label: 'Registrati' },
              { id: 'magic'    as Tab, label: '✉️ Link' },
            ]).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); reset() }} style={{
                flex: 1, padding: '13px 4px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12, letterSpacing: '.04em', background: 'transparent',
                color: tab === t.id ? '#E8431F' : '#aaa',
                borderBottom: `2.5px solid ${tab === t.id ? '#E8431F' : 'transparent'}`,
                transition: 'all .2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 22px 24px' }}>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <SocialBtn onClick={handleGoogle} loading={loading === 'google'} label="Google"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              />
              <SocialBtn onClick={handleApple} loading={loading === 'apple'} label="Apple" dark
                icon={
                  <svg width="14" height="17" viewBox="0 0 814 1000" fill="white">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.2-57.3-155.5-127.5C46.7 790.7 0 663 0 541.8c0-207.5 133.4-317.1 264.8-317.1 69.9 0 127.9 45.6 172 45.6 42.1 0 108.2-48 186.4-48 30.5 0 110.8 2.6 173.4 106.9zm-244-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                  </svg>
                }
              />
            </div>

            <Divider label="oppure con email" />

            {tab === 'register' && (
              <Field placeholder="Il tuo nome" value={name} onChange={setName} type="text" autoComplete="name" />
            )}
            <Field placeholder="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
            {tab !== 'magic' && (
              <Field
                placeholder={tab === 'login' ? 'Password' : 'Password (min 8 caratteri)'}
                value={password} onChange={setPassword} type="password"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            )}

            {tab === 'magic' && (
              <p style={{ fontSize: 12, color: '#6b7e94', margin: '0 0 14px', lineHeight: 1.6, fontWeight: 500 }}>
                Ricevi un link via email — nessuna password. Perfetto da mobile 📱
              </p>
            )}

            {error   && <Alert type="error"   msg={error} />}
            {success && <Alert type="success" msg={success} />}

            <button
              onClick={tab === 'login' ? handleLogin : tab === 'register' ? handleRegister : handleMagicLink}
              disabled={!canSubmit || !!loading}
              style={{
                width: '100%', padding: '15px 0', marginTop: 4,
                background: canSubmit && !loading ? '#E8431F' : '#cbb5ac',
                color: '#fff', border: 'none', borderRadius: 100,
                cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 800, fontSize: 15, letterSpacing: '.04em',
                transition: 'all .2s',
                boxShadow: canSubmit && !loading ? '0 4px 18px rgba(232,67,31,.28)' : 'none',
              }}
            >
              {loading === 'email' || loading === 'magic' ? '…'
                : tab === 'login'    ? 'Accedi'
                : tab === 'register' ? 'Crea account'
                : 'Invia link magico ✉️'}
            </button>

            {tab === 'login' && (
              <button onClick={handleForgotPassword}
                style={{ width: '100%', marginTop: 10, padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7e94', fontWeight: 600 }}>
                {loading === 'reset' ? '…' : 'Password dimenticata?'}
              </button>
            )}

            {tab === 'register' && (
              <p style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                Registrandoti accetti i{' '}
                <a href="/terms" style={{ color: '#E8431F' }}>Termini</a> e la{' '}
                <a href="/privacy" style={{ color: '#E8431F' }}>Privacy Policy</a>
              </p>
            )}
          </div>
        </div>

        {/* Torna all'app senza login */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="/app.html.html" style={{ fontSize: 13, color: '#6b7e94', fontWeight: 600, textDecoration: 'none' }}>
            ← Continua senza accedere
          </a>
        </div>

      </div>
    </div>
  )
}

/* ── Sub-components ── */

function SocialBtn({ onClick, loading, icon, label, dark }: {
  onClick: () => void; loading: boolean; icon: React.ReactNode; label: string; dark?: boolean
}) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      padding: '12px 0', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
      background: dark ? '#000' : '#fff', color: dark ? '#fff' : '#333',
      border: `1.5px solid ${dark ? '#000' : '#e0dbd2'}`,
      fontWeight: 700, fontSize: 13, letterSpacing: '.03em',
      opacity: loading ? .6 : 1, transition: 'all .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,.07)',
    }}>
      {loading ? '…' : icon}
      {!loading && label}
    </button>
  )
}

function Field({ placeholder, value, onChange, type, autoComplete }: {
  placeholder: string; value: string; onChange: (v: string) => void; type: string; autoComplete?: string
}) {
  return (
    <input
      placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      type={type} autoComplete={autoComplete}
      style={{
        display: 'block', width: '100%', marginBottom: 10, padding: '13px 14px',
        background: '#f5f7fa', border: '1.5px solid #d4dfec', borderRadius: 12,
        fontSize: 14, fontWeight: 500, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit',
      }}
      onFocus={e => e.target.style.borderColor = '#E8431F'}
      onBlur={e => e.target.style.borderColor = '#d4dfec'}
    />
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ flex: 1, height: 1, background: '#eef2f7' }} />
      <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#eef2f7' }} />
    </div>
  )
}

function Alert({ type, msg }: { type: 'error' | 'success'; msg: string }) {
  const e = type === 'error'
  return (
    <div style={{
      marginBottom: 12, padding: '10px 13px', borderRadius: 10,
      background: e ? 'rgba(200,50,50,.07)' : 'rgba(0,163,122,.07)',
      border: `1px solid ${e ? 'rgba(200,50,50,.2)' : 'rgba(0,163,122,.2)'}`,
      color: e ? '#b03020' : '#00a37a', fontSize: 13, fontWeight: 600, lineHeight: 1.5,
    }}>{msg}</div>
  )
}

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '❌ Email o password errati'
  if (msg.includes('Email not confirmed'))        return '📧 Conferma prima la tua email'
  if (msg.includes('User already registered'))    return '⚠️ Email già registrata — prova ad accedere'
  if (msg.includes('Password should be'))         return '🔒 Password troppo corta (min 8 caratteri)'
  if (msg.includes('rate limit'))                 return '⏳ Troppi tentativi — aspetta qualche minuto'
  return msg
}
