'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { User,  Plus, X, KeyRound } from 'lucide-react'
import { inviteEmployee, resetUserPassword, deleteUser } from '@/app/dashboard/actions'
import { Trash2 } from 'lucide-react'

interface Employee {
  id: string
  full_name: string
  email?: string
  last_seen?: string
  status: 'active' | 'offline'
}

interface EmployeeListProps {
  initialEmployees: Employee[]
  businessId: string
}

export default function EmployeeList({ initialEmployees, businessId }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  
  // Invite State
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Reset Password State
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Subscribe to timesheets to update status
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timesheets',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log('Change received!', payload)
          // In a real app, we would re-fetch or merge state carefully.
          // For MVP, simplistic update:
          if (payload.eventType === 'INSERT') {
             setEmployees(prev => prev.map(emp => 
               emp.id === payload.new.user_id ? { ...emp, status: 'active' } : emp
             ))
          } else if (payload.eventType === 'UPDATE') {
             if (payload.new.status === 'completed') {
               setEmployees(prev => prev.map(emp => 
                 emp.id === payload.new.user_id ? { ...emp, status: 'offline' } : emp
               ))
             }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId, supabase])

  async function handleInvite(formData: FormData) {
    setInviteError(null)
    setInviteSuccess(false)
    
    const res = await inviteEmployee(formData)
    
    if (res?.error) {
      setInviteError(res.error)
    } else {
      setInviteSuccess(true)
      setTimeout(() => {
        setIsInviteOpen(false)
        setInviteSuccess(false)
      }, 2000)
    }
  }

  async function handleResetPassword(formData: FormData) {
    setResetError(null)
    setResetSuccess(false)
    
    const res = await resetUserPassword(formData)
    
    if (res?.error) {
      setResetError(res.error)
    } else {
      setResetSuccess(true)
      setTimeout(() => {
        setIsResetOpen(false)
        setResetSuccess(false)
        setSelectedEmployee(null)
      }, 2000)
    }
  }

  async function handleDelete(formData: FormData) {
    setDeleteError(null)
    setDeleteSuccess(false)
    
    const res = await deleteUser(formData)
    
    if (res?.error) {
      setDeleteError(res.error)
    } else {
      setDeleteSuccess(true)
      // Optimistically remove from list or wait for revalidate
      if (employeeToDelete) {
        setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id))
      }
      setTimeout(() => {
        setIsDeleteOpen(false)
        setDeleteSuccess(false)
        setEmployeeToDelete(null)
      }, 2000)
    }
  }

  const openDeleteModal = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteOpen(true)
    setDeleteError(null)
    setDeleteSuccess(false)
  }

  const openResetModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsResetOpen(true)
    setResetError(null)
    setResetSuccess(false)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Team Members</h3>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Invite Employee
        </button>
      </div>
      
      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Invite New Employee</h3>
            
            {inviteSuccess ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Invitation sent!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>The employee will receive an email to complete their setup.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form action={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  />
                </div>
                
                {inviteError && (
                  <div className="text-red-600 text-sm">{inviteError}</div>
                )}
                
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsResetOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Reset Password for {selectedEmployee.full_name}</h3>
            
            {resetSuccess ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Password Updated!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>The employee can now log in with the new password.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form action={handleResetPassword} className="space-y-4">
                <input type="hidden" name="userId" value={selectedEmployee.id} />
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  />
                </div>
                
                {resetError && (
                  <div className="text-red-600 text-sm">{resetError}</div>
                )}
                
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Delete Employee</h3>
            
            {deleteSuccess ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Employee Deleted</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{employeeToDelete.full_name} has been removed from your business.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{employeeToDelete.full_name}</span>? This action cannot be undone.
                </p>
                
                {deleteError && (
                  <div className="text-red-600 text-sm">{deleteError}</div>
                )}
                
                <form action={handleDelete} className="mt-5 sm:mt-6 flex gap-3">
                  <input type="hidden" name="userId" value={employeeToDelete.id} />
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    Delete
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <ul role="list" className="divide-y divide-gray-200">
        {employees.map((employee) => (
          <li key={employee.id} className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <Link href={`/dashboard/employee/${employee.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline">
                  {employee.full_name}
                </Link>
                <p className="text-xs text-gray-500">{employee.email}</p>
                <p className="text-xs text-gray-500">{employee.status === 'active' ? 'Clocked In' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                employee.status === 'active' 
                  ? 'bg-green-50 text-green-700 ring-green-600/20' 
                  : 'bg-gray-50 text-gray-600 ring-gray-500/10'
              }`}>
                {employee.status === 'active' ? 'Active' : 'Offline'}
              </span>
              
              <button
                onClick={() => openResetModal(employee)}
                className="text-gray-400 hover:text-indigo-600"
                title="Reset Password"
              >
                <KeyRound className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => openDeleteModal(employee)}
                className="text-gray-400 hover:text-red-600"
                title="Delete Employee"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
        {employees.length === 0 && (
          <li className="px-4 py-8 text-center text-gray-500 text-sm">
            No employees yet. Invite someone to get started!
          </li>
        )}
      </ul>
    </div>
  )
}
