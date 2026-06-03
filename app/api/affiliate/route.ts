import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// POST /api/affiliate  body: { product_id, shop, price, bike_brand, bike_model, url }
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { product_id, shop, price, bike_brand, bike_model, url } = await req.json()

  // Log click (non-blocking — user might not be logged in)
  await supabase.from('affiliate_clicks').insert({
    user_id:    user?.id || null,
    product_id,
    shop,
    price:      parseFloat(price) || null,
    bike_brand,
    bike_model,
  })

  // Redirect to shop
  if (url) {
    return NextResponse.redirect(url, { status: 302 })
  }
  return NextResponse.json({ ok: true })
}
