'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Stats {
  total_users: number
  new_users_week: number
  total_scans: number
  scans_today: number
  scans_week: number
  total_bikes: number
  total_posts: number
  cost_30d: number
  affiliate_clicks_week: number
}

interface TopBike  { brand: string; model: string; scans: number; avg_confidence: number }
interface RecentScan { brand: string; model: string; confidence: number; scan_date: string; profiles: { display_name: string } }
interface RecentUser { id: string; email: string; display_name: string; scan_count: number; created_at: string; role: string }

const GREEN = '#2a6644'
const LIGHT = '#eef0ec'

export default function Dashboard() {
  const router   = useRouter()
  const supabase = createClient()
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [topBikes,    setTopBikes]    = useState<TopBike[]>([])
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [costByDay,   setCostByDay]   = useState<{ created_at: string; cost_usd: number }[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<'overview' | 'scans' | 'users' | 'bikes'>('overview')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        setStats(d.stats); setTopBikes(d.topBikes); setRecentScans(d.recentScans)
        setRecentUsers(d.recentUsers); setCostByDay(d.costByDay)
      })
      .catch(err => { if (err === 403 || err === 401) router.push('/') })
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: LIGHT, fontFamily: 'sans-serif', color: '#666' }}>
      Caricamento dashboard…
    </div>
  )

  // Cost chart: sum by day
  const costMap: Record<string, number> = {}
  costByDay.forEach(r => {
    const day = r.created_at?.slice(0, 10) || ''
    costMap[day] = (costMap[day] || 0) + (r.cost_usd || 0)
  })
  const costDays = Object.entries(costMap).slice(-14)
  const maxCost  = Math.max(...costDays.map(([, v]) => v), 0.001)

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, fontFamily: "'Inter', 'Rajdhani', sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="32" height="32" viewBox="0 0 200 200" fill="none">
            <rect width="200" height="200" rx="44" fill={GREEN}/>
            <g stroke="#e8dfc8" strokeWidth="6" strokeLinecap="round" fill="none">
              <circle cx="100" cy="90" r="62"/>
              <line x1="100" y1="28" x2="62" y2="152"/><line x1="100" y1="28" x2="138" y2="152"/>
              <line x1="38" y1="90" x2="152" y2="62"/><line x1="38" y1="90" x2="145" y2="128"/>
              <line x1="162" y1="90" x2="55" y2="62"/><line x1="162" y1="90" x2="55" y2="128"/>
            </g>
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2e1a', letterSpacing: '-.01em' }}>MotoSnap</div>
            <div style={{ fontSize: 10, color: '#8a9a8a', letterSpacing: '.1em', textTransform: 'uppercase' }}>Admin Dashboard</div>
          </div>
        </div>
        <button onClick={logout} style={{ padding: '7px 16px', background: '#f0ece4', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555' }}>
          Esci
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['overview', 'scans', 'users', 'bikes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid', borderColor: tab === t ? GREEN : '#ddd', background: tab === t ? GREEN : '#fff', color: tab === t ? '#fff' : '#555', cursor: 'pointer', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', transition: 'all .2s' }}>
              {t === 'overview' ? '📊 Overview' : t === 'scans' ? '📷 Scansioni' : t === 'users' ? '👥 Utenti' : '🏍️ Moto'}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && stats && (
          <>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Utenti totali',       value: stats.total_users,            sub: `+${stats.new_users_week} questa settimana`,    icon: '👥', accent: false },
                { label: 'Scansioni oggi',       value: stats.scans_today,            sub: `${stats.scans_week} negli ultimi 7gg`,          icon: '📷', accent: true  },
                { label: 'Scansioni totali',     value: stats.total_scans,            sub: 'Dall\'inizio',                                  icon: '🔍', accent: false },
                { label: 'Moto in garage',       value: stats.total_bikes,            sub: 'Totale database',                               icon: '🏍️', accent: false },
                { label: 'Post community',       value: stats.total_posts,            sub: 'Visibili',                                      icon: '💬', accent: false },
                { label: 'Click affiliati /7gg', value: stats.affiliate_clicks_week,  sub: 'Vai ai negozi',                                 icon: '🛍️', accent: false },
                { label: 'Costo AI 30gg',        value: `€${(stats.cost_30d * 0.92).toFixed(2)}`, sub: 'Claude API (tua chiave = €0)',      icon: '🤖', accent: false },
              ].map((k, i) => (
                <div key={i} style={{ background: k.accent ? GREEN : '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.07)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: k.accent ? '#fff' : '#1a2e1a', letterSpacing: '-.02em', lineHeight: 1 }}>{k.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: k.accent ? 'rgba(255,255,255,.75)' : '#8a9a8a', marginTop: 5, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k.label}</div>
                  <div style={{ fontSize: 11, color: k.accent ? 'rgba(255,255,255,.55)' : '#aaa', marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Cost chart */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.06)', marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a', marginBottom: 16, letterSpacing: '-.01em' }}>💰 Costo API — ultimi 14 giorni</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
                {costDays.map(([day, val]) => (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', background: GREEN, borderRadius: 4, height: `${Math.max(4, (val / maxCost) * 72)}px`, opacity: .85 }} title={`€${val.toFixed(4)}`} />
                    <span style={{ fontSize: 8, color: '#aaa', transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>{day.slice(5)}</span>
                  </div>
                ))}
                {costDays.length === 0 && <div style={{ color: '#aaa', fontSize: 13 }}>Nessun dato ancora</div>}
              </div>
            </div>

            {/* Top bikes */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.06)' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a', marginBottom: 16 }}>🏆 Moto più scansionate</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e8e4dc' }}>
                    {['#', 'Marca', 'Modello', 'Scansioni', 'Confidenza media'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: '#8a9a8a', letterSpacing: '.1em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topBikes.slice(0, 10).map((b, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0ece4' }}>
                      <td style={{ padding: '10px', color: '#aaa', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{b.brand}</td>
                      <td style={{ padding: '10px', color: '#555' }}>{b.model}</td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ background: GREEN, borderRadius: 4, height: 16, width: `${Math.max(20, (b.scans / (topBikes[0]?.scans || 1)) * 100)}px`, opacity: .75 }} />
                          <span style={{ fontWeight: 700, color: GREEN }}>{b.scans}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 700, color: b.avg_confidence >= 80 ? '#2a7a40' : '#e67020' }}>{Math.round(b.avg_confidence)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── SCANSIONI RECENTI ── */}
        {tab === 'scans' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.06)' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a', marginBottom: 16 }}>📷 Ultime scansioni</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e8e4dc' }}>
                  {['Utente', 'Marca', 'Modello', 'Confidenza', 'Data'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: '#8a9a8a', letterSpacing: '.1em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentScans.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0ece4', transition: 'background .15s' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#555' }}>{s.profiles?.display_name || '—'}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{s.brand || '—'}</td>
                    <td style={{ padding: '10px', color: '#555' }}>{s.model || '—'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: (s.confidence || 0) >= 80 ? 'rgba(42,122,64,.1)' : 'rgba(230,112,32,.1)', color: (s.confidence || 0) >= 80 ? '#2a7a40' : '#e67020', padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>
                        {s.confidence || 0}%
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#aaa', fontSize: 12 }}>{new Date(s.scan_date).toLocaleString('it-IT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── UTENTI ── */}
        {tab === 'users' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.06)' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a', marginBottom: 16 }}>👥 Utenti recenti</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e8e4dc' }}>
                  {['Nome', 'Email', 'Ruolo', 'Scansioni', 'Registrato'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: '#8a9a8a', letterSpacing: '.1em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0ece4' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{u.display_name || '—'}</td>
                    <td style={{ padding: '10px', color: '#555', fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: u.role === 'admin' ? 'rgba(42,102,68,.1)' : '#f5f1eb', color: u.role === 'admin' ? GREEN : '#888', padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, color: GREEN }}>{u.scan_count}</td>
                    <td style={{ padding: '10px', color: '#aaa', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('it-IT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TOP BIKES (tab) ── */}
        {tab === 'bikes' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 0 #d8d2ca, 0 6px 20px rgba(0,0,0,.06)' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a', marginBottom: 16 }}>🏍️ Classifica moto scansionate</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {topBikes.map((b, i) => (
                <div key={i} style={{ background: i < 3 ? GREEN : '#f5f1eb', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: i < 3 ? 'rgba(255,255,255,.35)' : '#ddd', lineHeight: 1, marginBottom: 4 }}>#{i + 1}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: i < 3 ? '#fff' : '#1a2e1a', letterSpacing: '-.01em' }}>{b.brand}</div>
                  <div style={{ fontSize: 13, color: i < 3 ? 'rgba(255,255,255,.75)' : '#666', marginTop: 2 }}>{b.model}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? 'rgba(255,255,255,.65)' : '#aaa' }}>{b.scans} scan</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? 'rgba(255,255,255,.85)' : '#2a7a40' }}>{Math.round(b.avg_confidence)}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

