import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gcggrxyjovvulfgudsiq.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ2dyeHlqb3Z2dWxmZ3Vkc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODYyMzgsImV4cCI6MjA5MzA2MjIzOH0.03Y9KQ-Tf4Zee9uwPx8yTYTiHQHn9LPISSlgahqTeR0'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON)
}

export async function createServerSupabase() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(list) {
        list.forEach(function(item) {
          cookieStore.set(item.name, item.value, item.options)
        })
      }
    }
  })
}

export const adminClient = createSupabaseAdmin(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
