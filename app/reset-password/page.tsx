'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  const handleReset = async () => {
    if (password.length < 8)      { setError('Password minimo 8 caratteri'); return }
    if (password !== password2)   { setError('Le password non coincidono'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('✅ Password aggiornata!')
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#eef0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: '#1a2e1a', marginBottom: 6, textAlign: 'center' }}>🔒 Nuova password</h1>
        <p style={{ fontSize: 13, color: '#6a8a6a', textAlign: 'center', marginBottom: 24 }}>Scegli una nuova password per il tuo account</p>
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 0 #d0cec6, 0 8px 32px rgba(0,0,0,.08)' }}>
          {['Nuova password', 'Ripeti password'].map((ph, i) => (
            <input key={i} type="password" placeholder={ph}
              value={i === 0 ? password : password2}
              onChange={e => i === 0 ? setPassword(e.target.value) : setPassword2(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: '13px 14px', background: '#f5f1eb', border: '1.5px solid #dddad4', borderRadius: 12, fontSize: 14, fontWeight: 500, outline: 'none' }} />
          ))}
          {error   && <div style={{ marginBottom: 10, color: '#b03020', fontSize: 12, fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ marginBottom: 10, color: '#1a7a40', fontSize: 12, fontWeight: 600 }}>{success}</div>}
          <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '15px 0', background: '#2a6644', color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer', fontWeight: 800, fontSize: 15 }}>
            {loading ? '…' : 'Aggiorna password'}
          </button>
        </div>
      </div>
    </div>
  )
}
