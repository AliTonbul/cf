import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'owner' && profile.role !== 'admin') redirect('/employee')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsForm
        initialFullName={profile.full_name || ''}
        initialEmail={user.email || ''}
      />
    </div>
  )
}
