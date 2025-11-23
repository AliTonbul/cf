'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function clockIn(lat: number, lng: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Get user profile to get business_id
  const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single()
  
  if (!profile?.business_id) return { error: 'No business linked' }

  // Check if already active
  const { data: active } = await supabase.from('timesheets')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (active) return { error: 'Already clocked in' }

  // Create timesheet
  const { data: timesheet, error } = await supabase.from('timesheets').insert({
    user_id: user.id,
    business_id: profile.business_id,
    clock_in: new Date().toISOString(),
    status: 'active'
  }).select().single()

  if (error) return { error: error.message }

  // Create initial location
  await supabase.from('locations').insert({
    timesheet_id: timesheet.id,
    user_id: user.id,
    lat,
    lng
  })

  revalidatePath('/employee')
  return { success: true, timesheetId: timesheet.id }
}

export async function clockOut(timesheetId: string, lat: number, lng: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Update timesheet
  const { error } = await supabase.from('timesheets')
    .update({ 
      clock_out: new Date().toISOString(),
      status: 'completed'
    })
    .eq('id', timesheetId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Create final location
  await supabase.from('locations').insert({
    timesheet_id: timesheetId,
    user_id: user.id,
    lat,
    lng
  })

  revalidatePath('/employee')
  return { success: true }
}

export async function recordLocation(timesheetId: string, lat: number, lng: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('locations').insert({
    timesheet_id: timesheetId,
    user_id: user.id,
    lat,
    lng
  })

  if (error) return { error: error.message }
  return { success: true }
}
