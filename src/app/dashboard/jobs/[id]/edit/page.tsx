import CreateJobForm from '@/components/jobs/CreateJobForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, description, location')
    .eq('id', id)
    .single()

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground mt-2">
          Update the job details below.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <CreateJobForm job={job} />
      </div>
    </div>
  )
}
