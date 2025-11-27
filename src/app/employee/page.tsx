import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ClockIn from '@/components/ClockIn'
import { logout } from '../auth/actions'
import MessageNotificationClient from '@/components/MessageNotificationClient'
import Docker from '@/components/Dock'

export default async function EmployeePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'employee') redirect('/dashboard')

  // Get active timesheet
  const { data: activeTimesheet } = await supabase.from('timesheets')
    .select('id, clock_in')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Employee Portal</h1>

          <div className="flex items-center gap-4">
            <MessageNotificationClient userId={user.id} href="/employee/messages" />
            <span className="text-sm text-gray-500">{profile.full_name}</span>
            <form action={logout}>
              <button className="text-sm text-red-600 hover:text-red-500">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ClockIn initialTimesheet={activeTimesheet} />
      </main>
      <Docker />
    </div>
  )
}
