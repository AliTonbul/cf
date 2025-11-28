'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserPlus, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AssignJobForm from '@/components/jobs/AssignJobForm';
import ViewJobModal from '@/components/jobs/ViewJobModal';
import { getEmployees, getJobAssignments } from '@/app/dashboard/jobs/actions';

interface Employee {
  id: string;
  full_name: string | null;
}

interface Assignment {
  status: string;
  employee: Employee | null;
}

export interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  created_at: string;
  assignments: Assignment[];
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface JobsTableProps {
  jobs: Job[];
}

const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getAvatarColor(name: string) {
  const seed = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[seed % avatarColors.length];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AvatarStack({ assignments }: { assignments: Assignment[] }) {
  // Filter out assignments without employees
  const validAssignments = assignments.filter((a) => a.employee);

  if (validAssignments.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className="flex -space-x-2">
      {validAssignments.map((assignment, index) => {
        const name = assignment.employee?.full_name || 'Unknown';
        const initials = getInitials(name);
        return (
          <Avatar
            key={index}
            className={cn(
              'h-8 w-8 border-2 border-background text-[10px]',
              getAvatarColor(name)
            )}
            title={name}
          >
            <AvatarFallback
              className={cn('font-medium text-white', getAvatarColor(name))}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      })}
    </div>
  );
}

type StatusVariant = 'success' | 'warning' | 'default' | 'secondary';

const statusStyles: Record<StatusVariant, { badge: string; dot: string }> = {
  success: {
    badge:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
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
};

function StatusBadge({
  status,
  variant = 'default',
}: {
  status: string;
  variant?: StatusVariant;
}) {
  const styles = statusStyles[variant];
  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full', styles.badge)}>
      <span className={cn('size-1.5 rounded-full', styles.dot)} aria-hidden="true" />
      {status}
    </Badge>
  );
}

function getStatusVariant(status: string): StatusVariant {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in progress':
    case 'started':
      return 'default';
    case 'planning':
    case 'pending':
      return 'secondary';
    case 'on hold':
      return 'warning';
    default:
      return 'default';
  }
}

export const JobsTable = ({ jobs }: JobsTableProps) => {
  const [assignJobId, setAssignJobId] = useState<string | null>(null);
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAssignModal = async (jobId: string) => {
    setIsLoading(true);
    setAssignJobId(jobId);
    
    // Fetch employees and current assignments
    const [employeesData, assignmentsData] = await Promise.all([
      getEmployees(),
      getJobAssignments(jobId)
    ]);
    
    setEmployees(employeesData);
    setAssignments(assignmentsData);
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setAssignJobId(null);
    setEmployees([]);
    setAssignments([]);
  };

  const selectedJob = jobs.find(j => j.id === assignJobId);
  const viewJob = jobs.find(j => j.id === viewJobId);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Job Title</TableHead>
            <TableHead className="font-medium">Location</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Assigned Employees</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.location || '-'}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={job.status}
                    variant={getStatusVariant(job.status)}
                  />
                </TableCell>
                <TableCell>
                  <AvatarStack assignments={job.assignments} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setViewJobId(job.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenAssignModal(job.id)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!assignJobId} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Assign Employees to {selectedJob?.title || 'Job'}
            </DialogTitle>
          </DialogHeader>
          {assignJobId && !isLoading && (
            <AssignJobForm
              jobId={assignJobId}
              employees={employees}
              initialAssignments={assignments}
              onClose={handleCloseModal}
              onSuccess={() => {
                // Refresh could be handled here if needed
                window.location.reload();
              }}
            />
          )}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ViewJobModal
        job={viewJob || null}
        open={!!viewJobId}
        onClose={() => setViewJobId(null)}
      />
    </div>
  );
};
