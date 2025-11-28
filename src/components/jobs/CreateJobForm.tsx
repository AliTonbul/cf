'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'


import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { TextEditor } from '../TextEditor'

import { updateJob } from '@/app/dashboard/jobs/actions'

interface Job {
  id: string
  title: string
  description: string | null
  location: string | null
}

interface CreateJobFormProps {
  job?: Job
  onJobCreated?: (jobId: string) => void
}

export default function CreateJobForm({ job, onJobCreated }: CreateJobFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(job?.title || '')
  const [location, setLocation] = useState(job?.location || '')
  const [description, setDescription] = useState(job?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = !!job

  const handleEditorUpdate = (json:string) => {

    setDescription(json)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditMode) {
        // Update existing job
        const result = await updateJob(job.id, title, description, location || '')

        if (result.error) {
          throw new Error(result.error)
        }

        router.push('/dashboard/jobs')
      } else {
        // Create new job
        const response = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: JSON.stringify(description),
            location: location || null,
          }),
        })

        const result = await response.json()

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to create job')
        }

        if (onJobCreated && result.jobId) {
          onJobCreated(result.jobId)
        } else if (result.jobId) {
          // Redirect to assignment page
          router.push(`/dashboard/jobs/${result.jobId}/assign`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Fix leaking tap"
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="123 Main St, London"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <div className="border rounded-lg overflow-hidden">
          <TextEditor  handleEditorUpdate={handleEditorUpdate}/>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !title} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Job' : 'Create Job & Assign Employees'
          )}
        </Button>
      </div>
    </form>
  )
}
