'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check role and redirect
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role === 'owner') {
      redirect('/dashboard')
    } else if (profile?.role === 'employee') {
      redirect('/employee')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'owner' | 'employee'
  
  // Extra fields
  const businessName = formData.get('businessName') as string
  const inviteCode = formData.get('inviteCode') as string

  // 1. Sign up the user
  // We pass all necessary data in metadata so the Trigger can handle DB insertions.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        business_name: businessName, // Will be null/undefined if employee, that's fine
        invite_code: inviteCode,     // Will be null/undefined if owner, that's fine
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Signup failed.' }
  }

  // The Database Trigger 'on_auth_user_created' handles profile and business creation.
  
  // If session is established (Auto Confirm ON), redirect immediately.
  if (authData.session) {
    if (role === 'owner') {
      redirect('/dashboard')
    } else {
      redirect('/employee')
    }
  } else {
    // If no session (Email Confirm ON), redirect to a confirmation message or login.
    // For MVP, we'll redirect to login with a message? 
    // Or just let them know.
    // Since we can't easily show a toast here without more UI state, 
    // let's redirect to login.
    redirect('/login?message=Check your email to confirm your account')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
