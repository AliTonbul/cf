'use client'

import { Badge } from '@/components/ui/badge' // Assuming I have Badge or will create it. I'll check.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Assuming I have Card.
import { MapPin, Clock, User } from 'lucide-react'

// I'll check dependencies for date-fns. If not, I'll use native Intl.RelativeTimeFormat or similar.
// I'll use native for now to avoid install if not present.

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

export default function JobCard({ job }: { job: Job }) {
  const statusColors: Record<string, string> = {
    started: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    complete: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100'}`}>
              {job.status.replace('_', ' ')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Unknown date'}
            </span>
          </div>
        </div>
      </div>

      {job.location && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          {job.location}
        </div>
      )}

      <div className="text-sm text-gray-700 line-clamp-2">
        {job.description}
      </div>

      <div className="pt-2 border-t mt-2">
        <p className="text-xs font-medium text-gray-500 mb-1">Assigned to:</p>
        <div className="flex flex-wrap gap-2">
          {job.assignments.length > 0 ? (
            job.assignments.map((assign, i) => (
              <div key={i} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                <User className="h-3 w-3" />
                <span>{assign.employee?.full_name || 'Unknown'}</span>
                <span className={`ml-1 px-1 rounded-sm ${
                  assign.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  assign.status === 'declined' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {assign.status}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No assignments</span>
          )}
        </div>
      </div>
    </div>
  )
}
