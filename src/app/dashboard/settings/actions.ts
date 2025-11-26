'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  
  if (!fullName || !email) {
    return { error: 'Full name and email are required' }
  }

  // Update profile full_name
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Update email if changed
  if (email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: email
    })

    if (emailError) {
      return { error: emailError.message }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
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
