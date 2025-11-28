'use client'

import JobCard from './JobCard'

interface Job {
  id: string
  title: string
  description: string | null
  location: string | null
  status: string
  created_at: string | null
  author: { full_name: string | null } | null
  assignments: {
    status: string
    employee: { full_name: string | null } | null
  }[]
}

export default function JobList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-gray-500">No jobs found. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
