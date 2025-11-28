import { getJobs } from './actions'
import { JobsTable } from '@/components/JobsTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function JobsPage() {
  const jobs = await getJobs()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">Manage and assign jobs to your team.</p>
        </div>
        
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </Link>
      </div>

      <JobsTable jobs={jobs} />
    </div>
  )
}
