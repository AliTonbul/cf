import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, business_id')
    .eq('id', user.id)
    .single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner' && profile.role !== 'admin') redirect('/employee')
  
  // Get Business Info
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', profile.business_id)
    .single()
  
  if (!business) {
    return <div>Error: No business found.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar 
        businessName={business.name}
        inviteCode={business.invite_code}
        userFullName={profile.full_name}
        userRole={profile.role}
      />
      
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
