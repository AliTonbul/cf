'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Pencil, 
  Printer, 
  Mail, 
  Trash2,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Job } from '@/components/JobsTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ViewJobModalProps {
  job: Job | null
  open: boolean
  onClose: () => void
}

const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
]

function getAvatarColor(name: string) {
  const seed = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return avatarColors[seed % avatarColors.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type StatusVariant = 'success' | 'warning' | 'default' | 'secondary'

const statusStyles: Record<StatusVariant, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  default: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  secondary: {
    badge: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
}

function getStatusVariant(status: string): StatusVariant {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in progress':
    case 'started':
      return 'default'
    case 'planning':
    case 'pending':
      return 'secondary'
    case 'on hold':
      return 'warning'
    default:
      return 'default'
  }
}

export default function ViewJobModal({ job, open, onClose }: ViewJobModalProps) {
  const router = useRouter()

  const handleEdit = () => {
    if (job) {
      router.push(`/dashboard/jobs/${job.id}/edit`)
      onClose()
    }
  }

  const handlePrint = () => {
    // TODO: Implement print logic
    console.log('Printing job:', job?.id)
  }

  const handleEmail = () => {
    // TODO: Implement email logic
    console.log('Emailing job:', job?.id)
  }

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deleting job:', job?.id)
  }

  if (!job) return null

  const statusVariant = getStatusVariant(job.status)
  const styles = statusStyles[statusVariant]
  const validAssignments = job.assignments.filter((a) => a.employee)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Job Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-4 border-b">
            <Button
              variant="default"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmail}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          {/* Job Information */}
          <div>
            <h3 className="text-xl font-semibold mb-3">{job.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || 'No location specified'}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <Badge variant="outline" className={cn('gap-1.5 rounded-full', styles.badge)}>
              <span className={cn('size-1.5 rounded-full', styles.dot)} aria-hidden="true" />
              {job.status}
            </Badge>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Assigned Employees */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assigned Employees ({validAssignments.length})
            </h4>
            {validAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employees assigned yet</p>
            ) : (
              <div className="space-y-2">
                {validAssignments.map((assignment, index) => {
                  const name = assignment.employee?.full_name || 'Unknown'
                  const initials = getInitials(name)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                    >
                      <Avatar
                        className={cn(
                          'h-10 w-10 border-2 border-background',
                          getAvatarColor(name)
                        )}
                      >
                        <AvatarFallback
                          className={cn('font-medium text-white', getAvatarColor(name))}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {assignment.status}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
