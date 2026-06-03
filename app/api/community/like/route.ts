import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// POST /api/community/like  body: { post_id }  → toggle like
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { post_id } = await req.json()
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .eq('post_id', post_id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', post_id)
    return NextResponse.json({ liked: false })
  } else {
    await supabase.from('post_likes').insert({ user_id: user.id, post_id })
    return NextResponse.json({ liked: true })
  }
}
