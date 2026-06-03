import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabase } from '@/lib/supabase'

// GET /api/garage → list user's bikes
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/garage → add bike (with AI maintenance fetch)
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { brand, model, year, category, displacement, confidence, description, km, last_service_km } = body

  if (!brand || !model) {
    return NextResponse.json({ error: 'brand and model required' }, { status: 400 })
  }

  // Fetch AI maintenance data
  let maintData = null
  try {
    const { data: profile } = await supabase.from('profiles').select('api_key').eq('id', user.id).single()
    const apiKey = profile?.api_key || process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const client = new Anthropic({ apiKey })
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Intervalli manutenzione reali per ${brand} ${model} ${year || ''}. SOLO array JSON:
[{"ic":"🛢️","name":"Cambio olio","km":12000,"note":"10W40 JASO MA2"},
{"ic":"🔗","name":"Catena","km":10000,"note":""},
{"ic":"🔴","name":"Pastiglie ant.","km":20000,"note":""},
{"ic":"💨","name":"Filtro aria","km":12000,"note":""},
{"ic":"🛞","name":"Pneumatici","km":12000,"note":""},
{"ic":"🕯️","name":"Candele","km":24000,"note":""},
{"ic":"🧴","name":"Liquido freni","km":0,"note":"ogni 2 anni"}]`,
        }],
      })
      const txt = msg.content.map(b => b.type === 'text' ? b.text : '').join('').trim()
      const m = txt.match(/\[[\s\S]*\]/)
      if (m) maintData = JSON.parse(m[0])

      // Log cost
      const cu = (msg.usage.input_tokens / 1e6) * 3 + (msg.usage.output_tokens / 1e6) * 15
      await supabase.from('api_usage').insert({ user_id: user.id, endpoint: 'maintenance', input_tokens: msg.usage.input_tokens, output_tokens: msg.usage.output_tokens, cost_usd: cu, model: 'claude-sonnet-4-6' })
    }
  } catch (e) { console.warn('Maintenance AI failed:', e) }

  const { data, error } = await supabase.from('bikes').insert({
    user_id: user.id, brand, model, year, category, displacement, confidence, description,
    km: km || 0, last_service_km: last_service_km || 0,
    maint_data: maintData,
    maint_fetched_at: maintData ? new Date().toISOString() : null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/garage → update bike km
export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, km } = await req.json()
  if (!id || km === undefined) return NextResponse.json({ error: 'id and km required' }, { status: 400 })

  const { data, error } = await supabase
    .from('bikes').update({ km }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/garage?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase.from('bikes').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
