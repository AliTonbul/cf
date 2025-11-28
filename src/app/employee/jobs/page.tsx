import { getAssignedJobs } from './actions'
import EmployeeJobList from '@/components/jobs/EmployeeJobList'

export default async function EmployeeJobsPage() {
  const assignments = await getAssignedJobs()

  return (
    <div className="space-y-6 p-4 pb-20 md:pb-4"> 
      {/* Added pb-20 for mobile nav clearance if needed, though layout usually handles it. 
          The user mentioned "mobile-optimized dashboard" in previous context, so padding is good. */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Jobs</h2>
        <p className="text-muted-foreground">View and manage your assigned jobs.</p>
      </div>

      <EmployeeJobList assignments={assignments} />
    </div>
  )
}
