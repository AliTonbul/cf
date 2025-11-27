import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardMap from '@/components/DashboardMapWrapper'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, business_id').eq('id', user.id).single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner' && profile.role !== 'admin') redirect('/employee')
  
  // Get Business Info
  const { data: business } = await supabase.from('businesses').select('*').eq('id', profile.business_id).single()
  
  if (!business) {
    return <div>Error: No business found.</div>
  }

  // Get Active Timesheets for map
  const { data: activeTimesheets } = await supabase
    .from('timesheets')
    .select('user_id')
    .eq('business_id', business.id)
    .eq('status', 'active')

  const activeUserIds = new Set(activeTimesheets?.map(t => t.user_id))

  // Get Latest Locations for Active Employees
  const { data: locations } = await supabase
    .from('locations')
    .select('id, lat, lng, timestamp, user_id, user:profiles(full_name)')
    .in('user_id', Array.from(activeUserIds))
    .order('timestamp', { ascending: false })
    .limit(50) 

  const latestLocations = Array.from(
    new Map(locations?.map(item => [item.user_id, item])).values()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time location tracking for active employees
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Live Map</h2>
        {/* <DashboardMap locations={latestLocations as any} /> */}
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Map view will be displayed here</p>
        </div>
      </section>
    </div>
  )
}
