import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gcggrxyjovvulfgudsiq.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ2dyeHlqb3Z2dWxmZ3Vkc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODYyMzgsImV4cCI6MjA5MzA2MjIzOH0.03Y9KQ-Tf4Zee9uwPx8yTYTiHQHn9LPISSlgahqTeR0'

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON)
}

export async function createServerSupabase() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON)
}

export const adminClient = createSupabaseClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
