import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'presente' : 'MANCANTE',
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'presente' : 'MANCANTE',
    anon_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    anon_start: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || 'vuota',
  })
}
