import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeList from '@/components/EmployeeList'
import { logout } from '../auth/actions'
import DashboardMap from '@/components/DashboardMapWrapper'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, full_name, business_id').eq('id', user.id).single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner') redirect('/employee')
  
  // Get Business Info
  const { data: business } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single()
  
  if (!business) {
    // Should not happen if flow is correct
    return <div>Error: No business found.</div>
  }

  // Get Employees
  const { data: employeesData } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('business_id', business.id)
    .eq('role', 'employee')

  // Get Active Timesheets to determine status
  const { data: activeTimesheets } = await supabase
    .from('timesheets')
    .select('user_id')
    .eq('business_id', business.id)
    .eq('status', 'active')

  const activeUserIds = new Set(activeTimesheets?.map(t => t.user_id))

  const employees = employeesData?.map(emp => ({
    ...emp,
    status: activeUserIds.has(emp.id) ? 'active' : 'offline'
  })) || []

  // Get Latest Locations for Active Employees
  // We need to join with profiles to get names
  // Supabase join syntax: select('*, profiles(full_name)')
  const { data: locations } = await supabase
    .from('locations')
    .select('id, lat, lng, timestamp, user_id, user:profiles(full_name)')
    .in('user_id', Array.from(activeUserIds))
    .order('timestamp', { ascending: false })
    .limit(50) // Just get recent ones

  // Filter to get only the latest per user?
  // For MVP, just showing all recent points or just the latest per user is better.
  // Let's just pass the raw list and let the map handle it, or filter here.
  // Simple unique filter:
  const latestLocations = Array.from(
    new Map(locations?.map(item => [item.user_id, item])).values()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{business.name}</h1>
            <p className="text-xs text-gray-500">Invite Code: <span className="font-mono font-bold">{business.invite_code}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{profile.full_name}</span>
            <form action={logout}>
              <button className="text-sm text-red-600 hover:text-red-500">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
         <section style={{ zIndex: 2 }}>
          <EmployeeList initialEmployees={employees as any} businessId={business.id} />
        </section>

        <section style={{ zIndex: 1 }}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Live Map</h2>
          <DashboardMap locations={latestLocations as any} />
        </section>

       
      </main>
    </div>
  )
}
