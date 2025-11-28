'use client'

import EmployeeJobCard from './EmployeeJobCard'

interface Assignment {
  id: number
  status: string
  job: {
    id: string
    title: string
    description: string | null
    location: string | null
    status: string
    created_at: string | null
    author: { full_name: string | null } | null
  }
}

export default function EmployeeJobList({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-gray-500">No jobs assigned to you yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => (
        <EmployeeJobCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  )
}
