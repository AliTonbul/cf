import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  //const supabase = await createClient()

  // const { data: { user } } = await supabase.auth.getUser()

  // if (user) {
  //   const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  //   if (profile?.role === 'owner') redirect('/dashboard')
  //   if (profile?.role === 'employee') redirect('/employee')
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">GeoTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Sign In
          </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signup">
            Sign up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Track Remote Teams with Ease
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Simple, reliable geolocation tracking for your remote workforce. Clock in, track location, and manage timesheets.
          </p>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 GeoTrack Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
