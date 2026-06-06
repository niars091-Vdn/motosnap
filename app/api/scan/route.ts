import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { adminClient } from '@/lib/supabase'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + hour })
    return true
  }
  if (entry.count >= 50) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Troppo veloce! Max 50 scansioni all\'ora.' }, { status: 429 })
    }

    const body = await req.json()
    const image = body.image || body.image_base64
    if (!image) {
      return NextResponse.json({ error: 'Immagine mancante.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Servizio non disponibile.' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          {
            type: 'text',
            text: `Identifica questa moto. SOLO JSON valido senza testo extra.
Se sicuro (confidence>=80): {"found":true,"brand":"MARCA","model":"Modello","year":"anno","category":"Naked|Sportiva|Enduro|Cruiser|Touring|Scrambler|Adventure|Scooter","displacement":"cilindrata","confidence":88,"description":"2 frasi in italiano.","alternatives":[]}
Se incerto (confidence<80): includi alternatives con fino a 2 opzioni nello stesso schema (senza alternatives annidate).
Se non è una moto: {"found":false,"reason":"spiegazione"}`,
          },
        ],
      }],
    })

    const txt = message.content.map(b => b.type === 'text' ? b.text : '').join('').trim()
    const match = txt.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'Risposta non valida. Riprova con foto più nitida.' }, { status: 500 })
    }

    const result = JSON.parse(match[0])

    // ── Log costo AI per la dashboard (sempre, anche se non trova la moto)
    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens
    const costUsd = (inputTokens / 1_000_000) * 3.0 + (outputTokens / 1_000_000) * 15.0

    adminClient.from('api_usage').insert({
      endpoint: 'scan',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      model: 'claude-sonnet-4-6',
    }).then(() => {})

    if (result.found) {
      adminClient.from('scans').insert({
        brand: result.brand,
        model: result.model,
        year: result.year,
        category: result.category,
        displacement: result.displacement,
        confidence: result.confidence,
        description: result.description,
        raw_result: result,
      }).then(() => {})
    }

    return NextResponse.json({ result })

  } catch (err: any) {
    console.error('[POST /api/scan]', err)
    if (err?.status === 529) {
      return NextResponse.json({ error: 'AI sovraccarica, riprova tra poco.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Errore imprevisto. Riprova.' }, { status: 500 })
  }
}
