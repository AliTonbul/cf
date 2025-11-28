'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssignedJobs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Fetch jobs where the user is assigned
  const { data: assignments, error } = await supabase
    .from('job_assignments')
    .select(`
      id,
      status,
      job:jobs!inner(
        id,
        title,
        description,
        location,
        status,
        created_at,
        author:profiles!jobs_author_id_fkey(full_name)
      )
    `)
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assigned jobs:', error)
    return []
  }

  // Transform the data to ensure job is a single object not an array
  return (assignments || []).map(assignment => ({
    ...assignment,
    job: Array.isArray(assignment.job) ? assignment.job[0] : assignment.job
  })) as any[]
}

export async function respondToAssignment(assignmentId: number, status: 'accepted' | 'declined') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Update assignment status
  const { data: assignment, error } = await supabase
    .from('job_assignments')
    .update({ status })
    .eq('id', assignmentId)
    .eq('employee_id', user.id) // Security check
    .select('*, job:jobs(title, business_id)')
    .single()

  if (error || !assignment) {
    return { error: error?.message || 'Assignment not found' }
  }

  // 2. Notify Admins/Owners
  // We need to find admins/owners of the business
  // assignment.job is an array or object depending on query, but here we used select with nested resource? 
  // Wait, update returns the modified row. It doesn't return nested relations by default unless we ask? 
  // Actually supabase update select supports it.
  
  // Let's get the business_id from the job.
  // The above select('*, job:jobs(title, business_id)') might fail if the relationship isn't expanded correctly in return.
  // Let's fetch job details separately to be safe or use a reliable query.
  
  const { data: jobData } = await supabase
    .from('jobs')
    .select('title, business_id')
    .eq('id', assignment.job_id)
    .single()
    
  if (jobData) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('business_id', jobData.business_id)
        .in('role', ['owner', 'admin'])
        
      if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
              user_id: admin.id,
              type: 'job_response',
              title: 'Job Assignment Update',
              message: `${user.email} has ${status} the job: ${jobData.title}`,
              link: `/dashboard/jobs`
          }))
          
          await supabase.from('notifications').insert(notifications)
      }
  }

  revalidatePath('/employee/jobs')
  return { success: true }
}
