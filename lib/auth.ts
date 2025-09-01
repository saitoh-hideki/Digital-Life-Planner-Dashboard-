import { supabase } from './supabase'
import { UserRole, UserProfile, AuthUser } from './types'

// 現在のユーザーのロールを取得
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return userRole
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error)
    return null
  }
}

// 現在のユーザーのプロファイルを取得
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile || null
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return null
  }
}

// 現在のユーザーの完全な情報を取得
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [role, profile] = await Promise.all([
      getCurrentUserRole(),
      getCurrentUserProfile()
    ])

    if (!role) return null

    return {
      id: user.id,
      email: user.email || undefined,
      role,
      profile: profile || undefined
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// ユーザーが特定の権限を持っているかチェック
export async function hasPermission(permission: keyof UserRole['permissions']): Promise<boolean> {
  try {
    const userRole = await getCurrentUserRole()
    if (!userRole) return false

    // 管理者は全ての権限を持つ
    if (userRole.role === 'admin') return true

    return userRole.permissions[permission] === true
  } catch (error) {
    console.error('Error in hasPermission:', error)
    return false
  }
}

// ユーザーが管理者かチェック
export async function isAdmin(): Promise<boolean> {
  try {
    const userRole = await getCurrentUserRole()
    return userRole?.role === 'admin'
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}

// ユーザーがモデレーター以上かチェック
export async function isModeratorOrHigher(): Promise<boolean> {
  try {
    const userRole = await getCurrentUserRole()
    return userRole?.role === 'admin' || userRole?.role === 'moderator'
  } catch (error) {
    console.error('Error in isModeratorOrHigher:', error)
    return false
  }
}

// ユーザーが管理者画面にアクセスできるかチェック
export async function canAccessAdmin(): Promise<boolean> {
  return hasPermission('can_access_admin')
}

// ユーザーがユーザー管理できるかチェック
export async function canManageUsers(): Promise<boolean> {
  return hasPermission('can_manage_users')
}

// ユーザーがコンテンツ管理できるかチェック
export async function canManageContent(): Promise<boolean> {
  return hasPermission('can_manage_content')
}

// ユーザーがロール管理できるかチェック
export async function canManageRoles(): Promise<boolean> {
  return hasPermission('can_manage_roles')
}
