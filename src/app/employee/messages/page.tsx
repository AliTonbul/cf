import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ChatWindow from '@/components/ChatWindow'

export default async function EmployeeMessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify role
  const { data: profile } = await supabase.from('profiles').select('role, full_name, business_id').eq('id', user.id).single()
  if (profile?.role !== 'employee') redirect('/dashboard')

  // Get Business Owner
  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, name, profiles:owner_id(full_name)')
    .eq('id', profile.business_id)
    .single()

  if (!business) return <div>Business not found</div>

  // business.profiles is the owner profile because of the join
  // We need to cast or handle the type correctly if TS complains, but for now let's assume it works or use any
  const ownerName = (business.profiles as any)?.full_name || 'Owner'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/employee" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Messages</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden h-[600px]">
          <ChatWindow 
            currentUserId={user.id} 
            roomId={user.id}
            otherUserId={business.owner_id} 
            otherUserName={`${business.name} (${ownerName})`} 
          />
        </div>
      </main>
    </div>
  )
}
