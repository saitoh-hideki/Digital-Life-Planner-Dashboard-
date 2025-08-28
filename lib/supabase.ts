import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// エラーハンドリング用のヘルパー関数
export const handleSupabaseError = (error: unknown): string => {
  console.error('Supabase error:', error)
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'データベースエラーが発生しました'
}