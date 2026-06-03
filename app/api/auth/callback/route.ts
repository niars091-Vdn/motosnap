import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code     = req.nextUrl.searchParams.get('code')
  const next     = req.nextUrl.searchParams.get('next') || '/'
  const origin   = req.nextUrl.origin

  if (code) {
    const supabase = await createServerSupabase()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
