import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client (use in 'use client' components)
export function createClient() {
  return createBrowserClient<Database>(URL, ANON)
}

// ── Server client (use in Server Components, API routes)
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options)
      ),
    },
  })
}

// ── Admin client (service role — server only, never expose to browser)
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
export const adminClient = createSupabaseAdmin<Database>(
  URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
