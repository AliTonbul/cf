import CreateJobForm from '@/components/jobs/CreateJobForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewJobPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below. You'll be able to assign employees after creating the job.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <CreateJobForm />
      </div>
    </div>
  )
}
