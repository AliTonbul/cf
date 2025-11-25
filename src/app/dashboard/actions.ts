'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function inviteEmployee(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. Verify current user is owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner' || !profile.business_id) {
    return { error: 'Unauthorized' }
  }

  // 2. Get Business Info for Invite Code
  const { data: business } = await supabase
    .from('businesses')
    .select('invite_code')
    .eq('id', profile.business_id)
    .single()

  if (!business) return { error: 'Business not found' }

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string

  if (!email || !fullName) {
    return { error: 'Email and Name are required' }
  }

  // 3. Invite User via Admin API
  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role: 'employee',
      invite_code: business.invite_code // Pass invite code to link them automatically via trigger
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function resetEmployeePassword(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. Verify current user is owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner' || !profile.business_id) {
    return { error: 'Unauthorized' }
  }

  const userId = formData.get('userId') as string
  const newPassword = formData.get('newPassword') as string

  if (!userId || !newPassword) {
    return { error: 'User ID and Password are required' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // 2. Verify target user belongs to the same business
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', userId)
    .single()

  if (targetProfile?.business_id !== profile.business_id) {
    return { error: 'Unauthorized: Employee not found in your business' }
  }

  // 3. Update Password via Admin API
  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteEmployee(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. Verify current user is owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner' || !profile.business_id) {
    return { error: 'Unauthorized' }
  }

  const userId = formData.get('userId') as string

  if (!userId) {
    return { error: 'User ID is required' }
  }

  // 2. Verify target user belongs to the same business
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', userId)
    .single()

  if (targetProfile?.business_id !== profile.business_id) {
    return { error: 'Unauthorized: Employee not found in your business' }
  }

  // 3. Delete User via Admin API
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
