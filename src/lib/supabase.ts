import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get current user ID from Clerk
export const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined' && (window as any).Clerk?.user?.id) {
    return (window as any).Clerk.user.id;
  }
  return null;
}