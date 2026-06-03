import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerSupabase, adminClient } from '@/lib/supabase'

// Configure VAPID keys (generated once with: npx web-push generate-vapid-keys)
webpush.setVapidDetails(
  'mailto:support@motosnap.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
  title:  string
  body:   string
  type:   'offer' | 'maint' | 'news' | 'generic'
  url?:   string
  price?: string
  image?: string
  icon?:  string
  badge?: string
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth check — admin only
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { target = 'all', user_id, ...payload } = body as { target: string; user_id?: string } & PushPayload

    // ── Fetch target subscriptions
    let query = adminClient.from('push_subscriptions').select('endpoint, p256dh, auth, user_id')
    if (target === 'user' && user_id) {
      query = query.eq('user_id', user_id)
    }
    // target === 'all' → send to everyone

    const { data: subs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!subs?.length) return NextResponse.json({ sent: 0, message: 'No subscribers' })

    const pushData: PushPayload = {
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      url:   '/',
      ...payload,
    }

    // ── Send to all subscriptions
    let sent = 0, failed = 0
    const staleEndpoints: string[] = []

    await Promise.allSettled(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(pushData),
            { TTL: 86400 }  // 24 ore di TTL
          )
          sent++
        } catch (err: any) {
          failed++
          // 410 Gone = subscription expired → remove it
          if (err.statusCode === 410 || err.statusCode === 404) {
            staleEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    // ── Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      await adminClient.from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
    }

    // ── Log to notification_queue
    await adminClient.from('notification_queue').insert({
      target:      target === 'user' ? user_id! : 'all',
      type:        payload.type,
      title:       payload.title,
      body:        payload.body,
      url:         payload.url || '/',
      price:       payload.price || null,
      sent_at:     new Date().toISOString(),
      sent_count:  sent,
      created_by:  user.id,
    })

    return NextResponse.json({ sent, failed, stale_removed: staleEndpoints.length })

  } catch (err: any) {
    console.error('[POST /api/push/send]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
