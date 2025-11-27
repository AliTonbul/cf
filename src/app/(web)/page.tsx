import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  //const supabase = await createClient()

  // const { data: { user } } = await supabase.auth.getUser()

  // if (user) {
  //   const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  //   if (profile?.role === 'owner') redirect('/dashboard')
  //   if (profile?.role === 'employee') redirect('/employee')
  // }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
hello
    </section>
  )
}
