'use client'

import { useState } from 'react'
import { respondToAssignment } from '@/app/employee/jobs/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, Check, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

export default function EmployeeJobCard({ assignment }: { assignment: Assignment }) {
  const [loading, setLoading] = useState(false)

  async function handleResponse(status: 'accepted' | 'declined') {
    setLoading(true)
    await respondToAssignment(assignment.id, status)
    setLoading(false)
  }

  const job = assignment.job

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              Assignment: {assignment.status}
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

      <div className="text-sm text-gray-700 line-clamp-3">
        {job.description}
      </div>

      {assignment.status === 'pending' && (
        <div className="pt-3 border-t mt-2 flex gap-2">
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handleResponse('accepted')}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            className="w-full"
            onClick={() => handleResponse('declined')}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
            Decline
          </Button>
        </div>
      )}
      
      {assignment.status === 'accepted' && (
         <div className="pt-3 border-t mt-2">
            <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="h-4 w-4" /> You accepted this job.
            </p>
         </div>
      )}
    </div>
  )
}
