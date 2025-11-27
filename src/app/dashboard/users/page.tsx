import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeList from '@/components/EmployeeList'
import AdminList from '@/components/AdminList'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, full_name, business_id').eq('id', user.id).single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner' && profile.role !== 'admin') redirect('/employee')
  
  // Get Business Info
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
      .select('id, full_name, email, role')
      .eq('business_id', business.id)
      .in('role', ['admin', 'owner'])
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage admins and employees for your business
        </p>
      </div>

      {profile.role === 'owner' && (
        <section>
          <AdminList initialAdmins={adminsData} businessId={business.id} />
        </section>
      )}

      <section>
        <EmployeeList initialEmployees={employees as any} businessId={business.id} />
      </section>
    </div>
  )
}
