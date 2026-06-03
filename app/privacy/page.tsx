export const metadata = {
  title: 'Privacy Policy — MotoSnap',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 60px', fontFamily:"'Inter',sans-serif", color:'#1a1a1a', lineHeight: 1.75 }}>
      <a href="/" style={{ color:'#2a6644', fontWeight:700, textDecoration:'none', fontSize:14 }}>← Torna all&apos;app</a>

      <h1 style={{ fontWeight:800, fontSize:28, margin:'24px 0 4px' }}>Privacy Policy</h1>
      <p style={{ color:'#888', fontSize:13, marginBottom:28 }}>Ultima revisione: gennaio 2025 · Versione 1.0</p>

      <div style={{ background:'#f0f7f2', border:'1px solid #c8e0d0', borderRadius:12, padding:'14px 18px', marginBottom:32, fontSize:14 }}>
        <strong>In sintesi:</strong> usiamo i tuoi dati solo per far funzionare l&apos;app. Non vendiamo dati. Non usiamo cookie di profilazione. Puoi cancellare il tuo account in qualsiasi momento.
      </div>

      <Section title="1. Titolare del trattamento">
        <p><strong>MotoSnap</strong> — contatto privacy: <a href="mailto:privacy@motosnap.app">privacy@motosnap.app</a></p>
        <p>Per richieste GDPR usa oggetto <em>&quot;Richiesta GDPR — [tipo]&quot;</em>. Risponderemo entro 30 giorni (art. 12 GDPR).</p>
      </Section>

      <Section title="2. Dati raccolti e finalità">
        <DataTable rows={[
          ['Categoria','Dati','Finalità','Base giuridica'],
          ['Account','Email, nome, avatar','Identificazione e accesso','Contratto — art. 6.1.b'],
          ['Garage','Marca, modello, anno, km','Funzionalità garage','Contratto — art. 6.1.b'],
          ['Scansioni','Risultato AI (testo)','Storico e miglioramento','Legittimo interesse — art. 6.1.f'],
          ['Community','Post e risposte','Funzionalità community','Contratto — art. 6.1.b'],
          ['Utilizzo','N° scan, click affiliati','Statistiche anonime','Legittimo interesse — art. 6.1.f'],
          ['Tecnici','Cookie sessione, IP','Sicurezza e auth','Legittimo interesse — art. 6.1.f'],
        ]} />
        <p style={{ fontSize:13, color:'#666', marginTop:12 }}>⚠️ <strong>Le foto non vengono conservate.</strong> Vengono elaborate da Anthropic e scartate. Salviamo solo il risultato testuale.</p>
      </Section>

      <Section title="3. Dati che NON raccogliamo">
        <ul>
          <li>Dati di pagamento o carte di credito</li>
          <li>Dati biometrici o sanitari</li>
          <li>Geolocalizzazione precisa</li>
          <li>Tracking cross-site o comportamentale</li>
          <li>Comunicazioni private tra utenti</li>
        </ul>
      </Section>

      <Section title="4. Cookie">
        <p>Usiamo <strong>solo cookie tecnici</strong> necessari per l&apos;autenticazione:</p>
        <DataTable rows={[
          ['Cookie','Tipo','Durata','Scopo'],
          ['sb-[id]-auth-token','Tecnico di sessione','1 ora (rinnovabile)','Sessione autenticata Supabase'],
          ['sb-[id]-refresh-token','Tecnico persistente','30 giorni','Rinnovo automatico sessione'],
        ]} />
        <p style={{ fontSize:13, color:'#666', marginTop:10 }}>
          Non usiamo cookie di marketing o profilazione. Secondo le Linee Guida Garante del 10/06/2021 i cookie tecnici non richiedono consenso, ma forniamo questa informativa per trasparenza.
        </p>
      </Section>

      <Section title="5. Intelligenza Artificiale (Anthropic Claude)">
        <p>La scansione moto usa Claude di Anthropic Inc. (USA). Il flusso è:</p>
        <ol>
          <li>Foto compressa sul tuo dispositivo (max 1800px)</li>
          <li>Trasmissione cifrata HTTPS all&apos;API Anthropic</li>
          <li>Anthropic elabora e restituisce solo testo (marca, modello, ecc.)</li>
          <li>La foto non viene conservata né da noi né da Anthropic</li>
          <li>Salviamo il risultato testuale nel tuo profilo</li>
        </ol>
        <p style={{ fontSize:13, color:'#666', marginTop:8 }}>
          Il trasferimento USA avviene tramite Clausole Contrattuali Standard (SCC). 
          Privacy Anthropic: <a href="https://www.anthropic.com/privacy" target="_blank">anthropic.com/privacy</a>
        </p>
      </Section>

      <Section title="6. Sub-responsabili del trattamento">
        <DataTable rows={[
          ['Fornitore','Servizio','Sede','Garanzie'],
          ['Supabase Inc.','Database e auth','USA (server EU-West)','SCC + SOC 2 Type II'],
          ['Anthropic PBC','Elaborazione AI','USA','SCC'],
          ['Vercel Inc.','Hosting','USA (CDN EU)','SCC + SOC 2'],
          ['Google LLC','Login Google (opt.)','USA','SCC'],
          ['Apple Inc.','Login Apple (opt.)','USA','SCC'],
        ]} />
        <p style={{ fontSize:13, color:'#666', marginTop:10 }}>Nessun altro soggetto accede ai tuoi dati. Non vendiamo dati a terzi.</p>
      </Section>

      <Section title="7. Conservazione dei dati">
        <DataTable rows={[
          ['Tipo di dato','Conservazione'],
          ['Dati account','Fino a cancellazione + 30 giorni'],
          ['Garage e moto','Fino a cancellazione manuale o account'],
          ['Storico scansioni','12 mesi, poi anonimizzati'],
          ['Post community','Fino a cancellazione manuale o account'],
          ['Log API','90 giorni'],
          ['Log di accesso/sicurezza','30 giorni'],
        ]} />
      </Section>

      <Section title="8. I tuoi diritti GDPR (Artt. 15–22)">
        <ul>
          <li><strong>Accesso (art. 15):</strong> ricevere copia dei tuoi dati</li>
          <li><strong>Rettifica (art. 16):</strong> correggere dati inesatti</li>
          <li><strong>Cancellazione (art. 17):</strong> il &quot;diritto all&apos;oblio&quot;</li>
          <li><strong>Limitazione (art. 18):</strong> bloccare temporaneamente il trattamento</li>
          <li><strong>Portabilità (art. 20):</strong> esportare i dati in JSON</li>
          <li><strong>Opposizione (art. 21):</strong> opporti al legittimo interesse</li>
        </ul>
        <p style={{ marginTop:10 }}>
          Scrivi a <a href="mailto:privacy@motosnap.app"><strong>privacy@motosnap.app</strong></a> con oggetto &quot;Richiesta GDPR — [diritto]&quot;. Risponderemo entro 30 giorni.
        </p>
        <div style={{ background:'#f5f1eb', borderRadius:10, padding:'12px 14px', marginTop:12, fontSize:13, color:'#555' }}>
          Puoi presentare reclamo al <strong>Garante Privacy</strong>:<br/>
          Via Isonzo 21/b, 00198 Roma · <a href="https://www.garanteprivacy.it" target="_blank">garanteprivacy.it</a> · 06 69779001
        </div>
      </Section>

      <Section title="9. Sicurezza">
        <ul>
          <li>Tutte le comunicazioni cifrate HTTPS/TLS 1.3</li>
          <li>Password cifrate con bcrypt (mai memorizzate in chiaro)</li>
          <li>Row Level Security (RLS): ogni utente vede solo i propri dati</li>
          <li>Accesso admin limitato, autenticato e loggato</li>
          <li>Nessun dato di pagamento conservato</li>
        </ul>
      </Section>

      <Section title="10. Minori">
        <p>Il servizio è riservato a utenti di almeno <strong>16 anni</strong> (art. 8 GDPR; D.Lgs. 196/2003). I minori di 16 anni non possono registrarsi. Segnala eventuali account di minori a privacy@motosnap.app.</p>
      </Section>

      <Section title="11. Aggiornamenti">
        <p>Informeremo via email con 30 giorni di anticipo per modifiche sostanziali. La versione vigente è sempre su questa pagina.</p>
      </Section>

      <div style={{ borderTop:'1px solid #eee', paddingTop:20, marginTop:32, fontSize:12, color:'#aaa' }}>
        Privacy Policy v1.0 · MotoSnap · <a href="mailto:privacy@motosnap.app" style={{ color:'#2a6644' }}>privacy@motosnap.app</a>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:32 }}>
      <h2 style={{ fontWeight:700, fontSize:17, marginBottom:10, borderLeft:'3px solid #2a6644', paddingLeft:10, color:'#1a2e1a' }}>{title}</h2>
      <div style={{ fontSize:14, color:'#333', lineHeight:1.75 }}>{children}</div>
    </div>
  )
}

function DataTable({ rows }: { rows: string[][] }) {
  return (
    <div style={{ overflowX:'auto', borderRadius:10, border:'1px solid #e8e4dc', marginTop:8 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr>{rows[0].map((h,i) => <th key={i} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, background:'#f5f1eb', color:'#555', borderBottom:'1px solid #e8e4dc', whiteSpace:'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row,i) => (
            <tr key={i} style={{ borderBottom:'1px solid #f5f1eb' }}>
              {row.map((cell,j) => <td key={j} style={{ padding:'9px 12px', fontWeight:j===0?600:400, color:j===0?'#1a1a1a':'#555' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
