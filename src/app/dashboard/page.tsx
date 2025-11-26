import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeList from '@/components/EmployeeList'
import AdminList from '@/components/AdminList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardMap from '@/components/DashboardMapWrapper'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, full_name, business_id').eq('id', user.id).single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner' && profile.role !== 'admin') redirect('/employee')
  
  // Get Business Info
  // Use profile.business_id to support admins who are not owners
  const { data: business } = await supabase.from('businesses').select('*').eq('id', profile.business_id).single()
  
  if (!business) {
    return <div>Error: No business found.</div>
  }

  // Get Employees
  const { data: employeesData } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('business_id', business.id)
    .eq('role', 'employee')

  // Get Admins (Only if owner)
  let adminsData: any[] = []
  if (profile.role === 'owner') {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('business_id', business.id)
      .eq('role', 'admin')
    adminsData = data || []
  }

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        businessName={business.name}
        inviteCode={business.invite_code}
        userFullName={profile.full_name}
        userRole={profile.role}
      />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
         {profile.role === 'owner' && (
           <section>
             <AdminList initialAdmins={adminsData} businessId={business.id} />
           </section>
         )}

         <section>
          <EmployeeList initialEmployees={employees as any} businessId={business.id} />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Live Map</h2>
          {/* <DashboardMap locations={latestLocations as any} /> */}
        </section>

      </main>
    </div>
  )
}
