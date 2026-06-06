import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gcggrxyjovvulfgudsiq.supabase.co'
const SUPABASE_ANON = 'INCOLLA_QUI_LA_ANON_KEY'

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
