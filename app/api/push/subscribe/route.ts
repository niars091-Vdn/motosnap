import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subscription, old_endpoint } = await req.json()
    if (!subscription?.endpoint) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

    const userAgent = req.headers.get('user-agent') || ''

    // Remove old subscription if present (subscription change)
    if (old_endpoint) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', old_endpoint)
    }

    // Upsert subscription
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id:     user.id,
      endpoint:    subscription.endpoint,
      p256dh:      subscription.keys?.p256dh || '',
      auth:        subscription.keys?.auth || '',
      user_agent:  userAgent,
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — unsubscribe
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint } = await req.json()
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
