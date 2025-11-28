'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getEmployees() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id) return []

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, role, email')
    .eq('business_id', profile.business_id)
    .eq('role', 'employee')
  
  return employees || []
}

export async function createJob(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id || !['owner', 'admin'].includes(profile.role || '')) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const employeeIds = formData.getAll('employeeIds') as string[]

  if (!title) {
    return { error: 'Title is required' }
  }

  // 1. Create Job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      business_id: profile.business_id,
      title,
      description,
      location,
      author_id: user.id,
      status: 'started'
    })
    .select()
    .single()

  if (jobError) {
    return { error: jobError.message }
  }

  // 2. Create Assignments
  if (employeeIds.length > 0) {
    const assignments = employeeIds.map(empId => ({
      job_id: job.id,
      employee_id: empId,
      status: 'pending'
    }))

    const { error: assignmentError } = await supabase
      .from('job_assignments')
      .insert(assignments)

    if (assignmentError) {
      // Should probably rollback job creation or alert user, but for now just return error
      return { error: `Job created but assignment failed: ${assignmentError.message}` }
    }

    // 3. Create Notifications
    const notifications = employeeIds.map(empId => ({
      user_id: empId,
      type: 'job_assignment',
      title: 'New Job Assigned',
      message: `You have been assigned to job: ${title}`,
      link: `/employee/jobs` // Assuming this route
    }))

    await supabase.from('notifications').insert(notifications)
  }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}

export async function getJobs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id) return []

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      author:profiles!jobs_author_id_fkey(full_name),
      assignments:job_assignments(
        status,
        employee:profiles!job_assignments_employee_id_fkey(full_name, id)
      )
    `)
    .eq('business_id', profile.business_id)
    .order('created_at', { ascending: false })

  if (error) {
   // console?.error('Error fetching jobs:', error)
    return []
  }

  return jobs
}

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/jobs')
  return { success: true }
}
export async function getJobAssignments(jobId: string) {
  const supabase = await createClient()
  
  const { data: assignments, error } = await supabase
    .from('job_assignments')
    .select('employee_id')
    .eq('job_id', jobId)

  if (error) {
    return []
  }

  return assignments.map(a => a.employee_id)
}

export async function updateJobAssignments(jobId: string, employeeIds: string[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id || !['owner', 'admin'].includes(profile.role || '')) {
    return { error: 'Unauthorized' }
  }

  // 1. Get current assignments
  const { data: currentAssignments } = await supabase
    .from('job_assignments')
    .select('employee_id')
    .eq('job_id', jobId)

  const currentIds = new Set(currentAssignments?.map(a => a.employee_id) || [])
  const newIds = new Set(employeeIds)

  // 2. Determine additions and removals
  const toAdd = employeeIds.filter(id => !currentIds.has(id))
  const toRemove = Array.from(currentIds).filter(id => !newIds.has(id))

  // 3. Remove assignments
  if (toRemove.length > 0) {
    const { error: removeError } = await supabase
      .from('job_assignments')
      .delete()
      .eq('job_id', jobId)
      .in('employee_id', toRemove)

    if (removeError) return { error: removeError.message }
  }

  // 4. Add assignments
  if (toAdd.length > 0) {
    const assignments = toAdd.map(empId => ({
      job_id: jobId,
      employee_id: empId,
      status: 'pending'
    }))

    const { error: addError } = await supabase
      .from('job_assignments')
      .insert(assignments)

    if (addError) return { error: addError.message }

    // 5. Create notifications for new assignments
    const { data: job } = await supabase
      .from('jobs')
      .select('title')
      .eq('id', jobId)
      .single()

    if (job) {
      const notifications = toAdd.map(empId => ({
        user_id: empId,
        type: 'job_assignment',
        title: 'New Job Assigned',
        message: `You have been assigned to job: ${job.title}`,
        link: `/employee/jobs`
      }))

      await supabase.from('notifications').insert(notifications)
    }
  }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}

export async function updateJob(jobId: string, title: string, description: string, location: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.business_id || !['owner', 'admin'].includes(profile.role || '')) {
    return { error: 'Unauthorized' }
  }

  if (!title) {
    return { error: 'Title is required' }
  }

  // Verify job exists and belongs to user's business
  const { data: existingJob } = await supabase
    .from('jobs')
    .select('id, business_id')
    .eq('id', jobId)
    .eq('business_id', profile.business_id)
    .single()

  if (!existingJob) {
    return { error: 'Job not found' }
  }

  // Update job
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      title,
      description,
      location,
    })
    .eq('id', jobId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}
