import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return NextResponse.json({
    url_value: url,
    url_length: url.length,
    anon_first30: anon.substring(0, 30),
    anon_last15: anon.slice(-15),
    anon_length: anon.length,
    anon_has_spaces: anon.includes(' '),
    anon_has_newline: anon.includes('\n'),
  })
}
