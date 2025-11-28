'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'
import { updateJobAssignments } from '@/app/dashboard/jobs/actions'

interface Employee {
  id: string
  full_name: string | null
  email: string | null
}

interface AssignJobFormProps {
  jobId: string
  employees: Employee[]
  initialAssignments?: string[]
  onClose?: () => void
  onSuccess?: () => void
}

export default function AssignJobForm({ 
  jobId, 
  employees, 
  initialAssignments = [],
  onClose,
  onSuccess
}: AssignJobFormProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set(initialAssignments))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId)
      } else {
        newSet.add(employeeId)
      }
      return newSet
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await updateJobAssignments(jobId, Array.from(selectedEmployees))

      if (result.error) {
        throw new Error(result.error)
      }

      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Select employees to assign to this job. Uncheck to unassign.
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No employees found in your business.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
            {employees.map((emp) => {
              const isSelected = selectedEmployees.has(emp.id)
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleEmployee(emp.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{emp.full_name || emp.email}</div>
                      {emp.full_name && emp.email && (
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? 's' : ''} selected
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Assignments'
          )}
        </Button>
      </div>
    </form>
  )
}
