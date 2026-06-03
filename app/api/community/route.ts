import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// GET /api/community?brand=Ducati&limit=20&offset=0
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const brand  = req.nextUrl.searchParams.get('brand')
  const limit  = parseInt(req.nextUrl.searchParams.get('limit')  || '20')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

  let query = supabase
    .from('community_posts')
    .select(`
      id, brand, moto, content, likes, created_at,
      profiles!inner(display_name, avatar_url),
      community_replies(id, content, created_at, profiles!inner(display_name))
    `)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (brand) query = query.eq('brand', brand)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/community → create post
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brand, moto, content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const { data, error } = await supabase
    .from('community_posts')
    .insert({ user_id: user.id, brand, moto, content: content.trim() })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// POST /api/community/like  { post_id }
// POST /api/community/reply { post_id, content }
