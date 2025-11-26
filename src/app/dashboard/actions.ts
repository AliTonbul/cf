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

export async function createAdmin(formData: FormData) {
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

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!email || !fullName || !password) {
    return { error: 'Email, Name, and Password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // 2. Create User via Admin API
  const { data: newUser, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin',
      business_id: profile.business_id 
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Get invite code to link business just in case trigger needs it
  const { data: business } = await supabase
    .from('businesses')
    .select('invite_code')
    .eq('id', profile.business_id)
    .single()
    
  if (newUser.user) {
     // Explicitly update profile to ensure business_id and role are set
     // This handles cases where triggers might miss metadata or behave differently
     await adminSupabase
        .from('profiles')
        .update({ 
            business_id: profile.business_id,
            role: 'admin',
            full_name: fullName
        })
        .eq('id', newUser.user.id)
        
     // Also update user metadata with invite code if needed for consistency
     if (business) {
        await adminSupabase.auth.admin.updateUserById(newUser.user.id, {
            user_metadata: {
                ...newUser.user.user_metadata,
                invite_code: business.invite_code
            }
        })
     }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function resetUserPassword(formData: FormData) {
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

export async function changePassword(formData: FormData) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const password = formData.get('password') as string
    
    if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function deleteUser(formData: FormData) {
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
