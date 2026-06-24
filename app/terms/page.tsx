export const metadata = { title: 'Termini di Servizio — MotoShot AI' }

export default function TermsPage() {
  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'40px 20px 60px', fontFamily:"'Inter',sans-serif", color:'#1a1a1a', lineHeight:1.75 }}>
      <a href="/" style={{ color:'#E8431F', fontWeight:700, textDecoration:'none', fontSize:14 }}>← Torna all&apos;app</a>

      <h1 style={{ fontWeight:800, fontSize:28, margin:'24px 0 4px' }}>Termini di Servizio</h1>
      <p style={{ color:'#888', fontSize:13, marginBottom:32 }}>Ultima revisione: giugno 2025 · Versione 1.1</p>

      <Section title="1. Accettazione e requisiti">
        <p>Usando MotoShot AI accetti questi Termini e la nostra <a href="/privacy">Privacy Policy</a>. Se non accetti, non usare il servizio.</p>
        <p><strong>Requisiti:</strong></p>
        <ul>
          <li>Età minima 16 anni (o maggiore età nella tua giurisdizione)</li>
          <li>Account registrato con dati veritieri</li>
          <li>Residenza in un paese in cui il servizio è legalmente fruibile</li>
        </ul>
      </Section>

      <Section title="2. Descrizione del servizio">
        <p>MotoShot AI è un&apos;applicazione web che offre:</p>
        <ul>
          <li>Identificazione di motociclette tramite AI (Claude di Anthropic)</li>
          <li>Gestione garage personale con tracciamento km e manutenzione</li>
          <li>Community per motociclisti</li>
          <li>Suggerimenti di prodotti con link affiliati a negozi partner</li>
          <li>Quiz e news moto</li>
        </ul>
        <p>Il servizio è fornito &quot;così com&apos;è&quot;. <strong>L&apos;AI può fare errori di identificazione.</strong> Non utilizzare le indicazioni di manutenzione come unica fonte — consulta sempre il manuale del produttore o un meccanico qualificato.</p>
      </Section>

      <Section title="3. Account utente">
        <ul>
          <li>Sei responsabile della sicurezza delle tue credenziali</li>
          <li>Non condividere il tuo account con terzi</li>
          <li>Ci riserviamo di sospendere account inattivi da più di 24 mesi</li>
          <li>In caso di violazione sospetta, contattaci immediatamente</li>
        </ul>
      </Section>

      <Section title="4. Uso accettabile">
        <p>È vietato:</p>
        <ul>
          <li>Pubblicare contenuti offensivi, diffamatori, illegali o che violano diritti di terzi</li>
          <li>Inviare spam o messaggi commerciali non richiesti</li>
          <li>Tentare di accedere agli account di altri utenti</li>
          <li>Usare bot o strumenti automatizzati per accedere al servizio</li>
          <li>Aggirare i limiti di utilizzo (es. rate limiting sulle scansioni)</li>
          <li>Pubblicare contenuti che violano copyright, marchi o altri diritti IP</li>
          <li>Raccogliere dati di altri utenti senza consenso</li>
        </ul>
      </Section>

      <Section title="5. Contenuti della community">
        <p>Pubblicando contenuti su MotoShot AI:</p>
        <ul>
          <li>Dichiari di averne i diritti necessari</li>
          <li>Ci concedi una licenza non esclusiva per mostrare il contenuto nella piattaforma</li>
          <li>Rimani proprietario dei tuoi contenuti</li>
        </ul>
        <p>I moderatori possono rimuovere contenuti che violano questi Termini senza preavviso. In caso di violazione grave, l&apos;account può essere sospeso o bannato.</p>
      </Section>

      <Section title="6. AI e accuratezza">
        <ul>
          <li>L&apos;identificazione AI è indicativa e non garantita al 100%</li>
          <li>Gli intervalli di manutenzione forniti dall&apos;AI sono indicativi — verifica sempre il manuale ufficiale</li>
          <li>Non siamo responsabili per danni a persone o cose derivanti dall&apos;uso delle informazioni fornite dall&apos;AI</li>
          <li>MotoShot AI non è un servizio di consulenza meccanica professionale</li>
        </ul>
      </Section>

      <Section title="7. Prodotti e link affiliati">
        <ul>
          <li>I prodotti mostrati sono di negozi partner indipendenti</li>
          <li>MotoShot AI può ricevere commissioni su acquisti effettuati tramite i nostri link (programmi di affiliazione)</li>
          <li>I prezzi sono indicativi e possono variare — il prezzo definitivo è quello del negozio al momento dell&apos;acquisto</li>
          <li>Non siamo responsabili di: qualità dei prodotti, tempi di consegna, politiche di reso dei negozi partner</li>
          <li>I loghi dei negozi sono marchi dei rispettivi proprietari</li>
        </ul>
      </Section>

      <Section title="8. Proprietà intellettuale">
        <p>MotoShot AI, il logo, il design e il software sono di proprietà del Titolare e protetti da copyright. Non puoi:</p>
        <ul>
          <li>Copiare, riprodurre o distribuire il software dell&apos;app</li>
          <li>Fare reverse engineering</li>
          <li>Usare il marchio MotoShot AI senza autorizzazione scritta</li>
        </ul>
      </Section>

      <Section title="9. Limitazione di responsabilità">
        <p>Nei limiti consentiti dalla legge italiana, MotoShot AI non è responsabile per:</p>
        <ul>
          <li>Errori di identificazione dell&apos;AI</li>
          <li>Danni derivanti da interventi di manutenzione basati sulle informazioni dell&apos;app</li>
          <li>Perdita di dati per cause di forza maggiore</li>
          <li>Interruzioni temporanee del servizio (pianificate o non)</li>
          <li>Contenuti pubblicati da altri utenti nella community</li>
          <li>Transazioni economiche con negozi partner</li>
        </ul>
        <p>La responsabilità massima di MotoShot AI verso l&apos;utente è limitata all&apos;importo eventualmente pagato per il servizio negli ultimi 12 mesi.</p>
      </Section>

      <Section title="10. Sospensione e cancellazione">
        <p><strong>Da parte tua:</strong> puoi cancellare il tuo account in qualsiasi momento da Profilo → Elimina account, oppure richiedendolo a niars091@gmail.com o dalla pagina <a href="/elimina-account">motosnap.vercel.app/elimina-account</a>.</p>
        <p><strong>Da parte nostra:</strong> ci riserviamo di sospendere o cancellare account che violano questi Termini, previo avviso quando possibile.</p>
      </Section>

      <Section title="11. Modifiche al servizio e ai Termini">
        <ul>
          <li>Possiamo modificare o interrompere funzionalità con ragionevole preavviso</li>
          <li>Modifiche a questi Termini vengono comunicate via email con 30 giorni di anticipo</li>
          <li>Continuare a usare il servizio dopo le modifiche costituisce accettazione</li>
        </ul>
      </Section>

      <Section title="12. Legge applicabile e foro">
        <p>Questi Termini sono regolati dalla legge italiana. Per controversie che non si risolvono amichevolmente, è competente il Tribunale di <strong>Civitavecchia</strong>, salvo diversa disposizione obbligatoria di legge a tutela del consumatore.</p>
        <p style={{ fontSize:13, color:'#666', marginTop:8 }}>Per i consumatori UE: è disponibile la piattaforma ODR (Online Dispute Resolution) della Commissione Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" style={{ color:'#E8431F' }}>ec.europa.eu/consumers/odr</a></p>
      </Section>

      <Section title="13. Contatti">
        <p>
          Supporto: <a href="mailto:niars091@gmail.com" style={{ color:'#E8431F' }}>niars091@gmail.com</a><br/>
          Privacy/GDPR: <a href="mailto:niars091@gmail.com" style={{ color:'#E8431F' }}>niars091@gmail.com</a><br/>
          Segnalazioni abusi: <a href="mailto:niars091@gmail.com" style={{ color:'#E8431F' }}>niars091@gmail.com</a>
        </p>
      </Section>

      <div style={{ borderTop:'1px solid #eee', paddingTop:20, marginTop:32, fontSize:12, color:'#aaa' }}>
        Termini di Servizio v1.1 · MotoShot AI
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:32 }}>
      <h2 style={{ fontWeight:700, fontSize:17, marginBottom:10, borderLeft:'3px solid #E8431F', paddingLeft:10, color:'#2e1a14' }}>{title}</h2>
      <div style={{ fontSize:14, color:'#333', lineHeight:1.75 }}>{children}</div>
    </div>
  )
}
