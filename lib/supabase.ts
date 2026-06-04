import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const SUPA_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client (componenti client-side)
export function createClient() {
  return createBrowserClient(SUPA_URL, SUPA_ANON)
}

// ── Server client (API routes e Server Components)
export async function createServerSupabase() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient(SUPA_URL, SUPA_ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options)
      ),
    },
  })
}

// ── Admin client (solo server, mai esposto al browser)
export const adminClient = createSupabaseAdmin(
  SUPA_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
