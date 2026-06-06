import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const [stats, topBikes, recentScans, recentUsers, costByDay] = await Promise.all([
      adminClient.from('admin_stats').select('*').single(),
      adminClient.from('top_scanned_bikes').select('*'),
      adminClient.from('scans')
        .select('brand, model, confidence, scan_date, profiles!inner(display_name)')
        .order('scan_date', { ascending: false }).limit(20),
      adminClient.from('profiles')
        .select('id, email, display_name, scan_count, created_at, role')
        .order('created_at', { ascending: false }).limit(20),
      adminClient.from('api_usage')
        .select('created_at, cost_usd, endpoint')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .order('created_at', { ascending: true }),
    ])

    return NextResponse.json({
      stats:       stats.data,
      topBikes:    topBikes.data || [],
      recentScans: recentScans.data || [],
      recentUsers: recentUsers.data || [],
      costByDay:   costByDay.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
