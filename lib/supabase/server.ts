import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// For server components
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// For API routes
export const createRouteHandlerClientFromRequest = (req: Request) => {
  return createRouteHandlerClient<Database>({ cookies })
}

export const createRouteHandlerClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}