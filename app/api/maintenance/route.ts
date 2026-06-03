import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabase } from '@/lib/supabase'

const DEFAULT_MAINT = [
  { ic: '🛢️', name: 'Cambio olio', km: 6000,  note: '' },
  { ic: '🔗', name: 'Catena',       km: 10000, note: '' },
  { ic: '🔴', name: 'Pastiglie',    km: 20000, note: '' },
  { ic: '💨', name: 'Filtro aria',  km: 12000, note: '' },
  { ic: '🛞', name: 'Pneumatici',   km: 12000, note: '' },
]

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { brand, model, year } = await req.json()
    if (!brand || !model) return NextResponse.json({ maint: DEFAULT_MAINT })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ maint: DEFAULT_MAINT })

    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Intervalli manutenzione reali per ${brand} ${model} ${year || ''}. SOLO array JSON:\n[{"ic":"🛢️","name":"Cambio olio","km":12000,"note":"10W40 JASO MA2"},{"ic":"🔗","name":"Catena","km":10000,"note":""},{"ic":"🔴","name":"Pastiglie ant.","km":20000,"note":""},{"ic":"💨","name":"Filtro aria","km":12000,"note":""},{"ic":"🛞","name":"Pneumatici","km":12000,"note":""},{"ic":"🕯️","name":"Candele","km":24000,"note":""},{"ic":"🧴","name":"Liquido freni","km":0,"note":"ogni 2 anni"}]`,
      }],
    })

    const txt = msg.content.map((b: any) => b.type === 'text' ? b.text : '').join('').trim()
    const m = txt.match(/\[[\s\S]*\]/)
    const maint = m ? JSON.parse(m[0]) : DEFAULT_MAINT

    supabase.from('api_usage').insert({
      user_id: user.id, endpoint: 'maintenance',
      input_tokens: msg.usage.input_tokens,
      output_tokens: msg.usage.output_tokens,
      cost_usd: (msg.usage.input_tokens / 1e6) * 3 + (msg.usage.output_tokens / 1e6) * 15,
      model: 'claude-sonnet-4-6',
    }).then(() => {})

    return NextResponse.json({ maint })
  } catch {
    return NextResponse.json({ maint: DEFAULT_MAINT })
  }
}
