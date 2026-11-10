import { createClient } from '@supabase/supabase-js'

// import.meta.env reads the values from .env.local at build time.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing Supabase settings. Copy .env.example to .env.local and fill it in.')
}

// One shared client for the whole app. It handles login sessions
// (stored in the browser) and talks to the database.
export const supabase = createClient(url, key)
