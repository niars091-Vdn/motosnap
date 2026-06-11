'use client';
import { useEffect, useState } from 'react';

export default function EliminaAccount() {
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'|'noauth'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    // Carica Supabase CDN dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  async function handleDelete() {
    if (!confirm('Sei assolutamente sicuro? Questa azione è IRREVERSIBILE.')) return;
    setStatus('loading');
    try {
      const sb = (window as any).supabase.createClient(
        'https://gcggrxyjovvulfgudsiq.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ2dyeHlqb3Z2dWxmZ3Vkc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODYyMzgsImV4cCI6MjA5MzA2MjIzOH0.03Y9KQ-Tf4Zee9uwPx8yTYTiHQHn9LPISSlgahqTeR0'
      );
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { setStatus('noauth'); return; }

      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + session.access_token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await sb.auth.signOut();
        setStatus('ok');
        setTimeout(() => window.location.href = '/', 3000);
      } else {
        throw new Error(data.error || 'Errore server');
      }
    } catch (e: any) {
      setErrMsg(e.message);
      setStatus('err');
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Inter+Tight:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06101e;color:#eaf2ff;font-family:'Inter',sans-serif;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{background:'#0d1a2e',border:'1px solid #1e2c44',borderRadius:24,padding:'32px 24px',maxWidth:400,width:'100%',textAlign:'center'}}>
        
        <img src="/logo-header.png.png" alt="MotoShot AI" style={{height:36,marginBottom:24,filter:'brightness(0) invert(1)'}} />
        
        <h1 style={{fontFamily:'Inter Tight',fontSize:22,fontWeight:800,marginBottom:10,color:'#eaf2ff'}}>
          Elimina il tuo account
        </h1>
        <p style={{fontSize:14,color:'#b6c4dc',lineHeight:1.65,marginBottom:20}}>
          Stai per eliminare definitivamente il tuo account MotoShot AI e tutti i dati associati.
        </p>

        <div style={{background:'rgba(232,67,31,.08)',border:'1px solid rgba(232,67,31,.25)',borderRadius:14,padding:'14px 16px',fontSize:13,color:'#F47B20',marginBottom:24,textAlign:'left',lineHeight:1.6}}>
          ⚠️ <strong>Azione irreversibile</strong><br/>
          Verranno eliminati: account, garage, preferenze e tutti i dati personali. Non sarà possibile recuperarli.
        </div>

        {status === 'ok' && (
          <div style={{background:'rgba(0,163,122,.1)',border:'1px solid rgba(0,163,122,.25)',borderRadius:12,padding:14,color:'#3fe0b5',fontSize:14,marginBottom:16}}>
            ✓ Account eliminato con successo. Reindirizzamento in corso…
          </div>
        )}
        {status === 'err' && (
          <div style={{background:'rgba(232,67,31,.08)',border:'1px solid rgba(232,67,31,.2)',borderRadius:12,padding:14,color:'#F47B20',fontSize:14,marginBottom:16}}>
            ❌ Errore: {errMsg}
          </div>
        )}
        {status === 'noauth' && (
          <div style={{background:'rgba(232,67,31,.08)',border:'1px solid rgba(232,67,31,.2)',borderRadius:12,padding:14,color:'#F47B20',fontSize:14,marginBottom:16}}>
            ⚠️ Non sei loggato. <a href="/login" style={{color:'#E8431F',fontWeight:700}}>Accedi prima</a> di eliminare l'account.
          </div>
        )}

        {status !== 'ok' && (
          <>
            <button
              onClick={handleDelete}
              disabled={status === 'loading'}
              style={{display:'block',width:'100%',padding:16,background:'#E8431F',color:'#fff',border:'none',borderRadius:14,fontFamily:'Inter Tight',fontSize:16,fontWeight:700,cursor:status==='loading'?'not-allowed':'pointer',opacity:status==='loading'?0.6:1,marginBottom:10,transition:'opacity .2s'}}
            >
              {status === 'loading' ? '⏳ Eliminazione in corso…' : '🗑️ Elimina il mio account'}
            </button>
            <button
              onClick={() => window.history.back()}
              style={{display:'block',width:'100%',padding:14,background:'transparent',border:'1.5px solid #1e2c44',color:'#b6c4dc',borderRadius:14,fontFamily:'Inter',fontSize:15,fontWeight:600,cursor:'pointer'}}
            >
              Annulla
            </button>
          </>
        )}

        <p style={{fontSize:11,color:'#7d8ca8',marginTop:20,lineHeight:1.6}}>
          Hai dubbi? Contattaci prima:{' '}
          <a href="mailto:niars091@gmail.com" style={{color:'#E8431F'}}>niars091@gmail.com</a>
        </p>
      </div>
    </>
  );
}
