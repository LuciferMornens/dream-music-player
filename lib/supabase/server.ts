import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// For server components and API routes
export async function createServerClient() {
  const cookieStore = await cookies()

  // Derive the correct type for options from the cookie store's set method
  type CookieSetOptions = Parameters<typeof cookieStore.set>[2]

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: CookieSetOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options?: CookieSetOptions) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}
