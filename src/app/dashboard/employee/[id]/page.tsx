import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import ChatWindow from '@/components/ChatWindow'

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Verify Owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (ownerProfile?.role !== 'owner') redirect('/employee')

  // 2. Get Employee Profile
  const { data: employee } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!employee) return <div>Employee not found</div>

  // Verify employee belongs to same business
  if (employee.business_id !== ownerProfile.business_id) {
    return <div>Unauthorized</div>
  }

  // 3. Get Timesheets
  const { data: timesheets } = await supabase
    .from('timesheets')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  // 4. Get Recent Locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', id)
    .order('timestamp', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{employee.full_name} - Logs</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Stats / Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Details</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.full_name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.email || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{employee.role}</dd>
            </div>
          </dl>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Window */}
          <section className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
             <ChatWindow 
                currentUserId={user.id} 
                roomId={employee.id}
                otherUserId={employee.id} 
                otherUserName={employee.full_name} 
             />
          </section>

          {/* Timesheets */}
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                Recent Timesheets
              </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {timesheets?.map((sheet) => (
                <li key={sheet.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {new Date(sheet.clock_in).toLocaleDateString()}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sheet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sheet.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        In: {new Date(sheet.clock_in).toLocaleTimeString()}
                      </p>
                      {sheet.clock_out && (
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Out: {new Date(sheet.clock_out).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {(!timesheets || timesheets.length === 0) && (
                <li className="px-4 py-8 text-center text-gray-500 text-sm">No timesheets found.</li>
              )}
            </ul>
          </section>

          {/* Locations */}
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                Recent Locations
              </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {locations?.map((loc) => (
                <li key={loc.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">
                      Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(loc.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View on Map
                    </a>
                  </div>
                </li>
              ))}
              {(!locations || locations.length === 0) && (
                <li className="px-4 py-8 text-center text-gray-500 text-sm">No location history found.</li>
              )}
            </ul>
          </section>
        </div>

      </main>
    </div>
  )
}
