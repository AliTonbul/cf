'use client'

import { useState } from 'react'
import { createJob } from '@/app/dashboard/jobs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

// If Textarea component doesn't exist, I'll use standard textarea with tailwind classes
// But usually shadcn setup includes it. I'll check if I need to create it or just use standard.
// I'll use standard for safety.

interface Employee {
  id: string
  full_name: string | null
  email: string | null
}

interface JobFormProps {
  employees: Employee[]
  onSuccess?: () => void
}

export default function JobForm({ employees, onSuccess }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createJob(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      // Reset form?
      // Ideally we close the modal or redirect.
      if (onSuccess) onSuccess()
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Fix leaking tap" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Markdown)</Label>
        <textarea
          id="description"
          name="description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe the job... You can use markdown."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="123 Main St, London" />
      </div>

      <div className="space-y-2">
        <Label>Assign Employees</Label>
        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees found.</p>
          ) : (
            employees.map((emp) => (
              <div key={emp.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`emp-${emp.id}`}
                  name="employeeIds"
                  value={emp.id}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`emp-${emp.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {emp.full_name || emp.email}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Job
      </Button>
    </form>
  )
}
