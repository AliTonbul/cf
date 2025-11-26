'use client'

import { useState } from 'react'
import { User, Plus, Trash2, X, KeyRound } from 'lucide-react'
import { deleteUser, resetUserPassword } from '@/app/dashboard/actions'
import CreateAdminModal from './CreateAdminModal'

interface Admin {
  id: string
  full_name: string
  email?: string
}

interface AdminListProps {
  initialAdmins: Admin[]
  businessId: string
}

export default function AdminList({ initialAdmins, businessId }: AdminListProps) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins)
  
  // Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Reset Password State
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  async function handleDelete(formData: FormData) {
    setDeleteError(null)
    setDeleteSuccess(false)
    
    const res = await deleteUser(formData)
    
    if (res?.error) {
      setDeleteError(res.error)
    } else {
      setDeleteSuccess(true)
      if (adminToDelete) {
        setAdmins(prev => prev.filter(a => a.id !== adminToDelete.id))
      }
      setTimeout(() => {
        setIsDeleteOpen(false)
        setDeleteSuccess(false)
        setAdminToDelete(null)
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
        setSelectedAdmin(null)
      }, 2000)
    }
  }

  const openDeleteModal = (admin: Admin) => {
    setAdminToDelete(admin)
    setIsDeleteOpen(true)
    setDeleteError(null)
    setDeleteSuccess(false)
  }

  const openResetModal = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsResetOpen(true)
    setResetError(null)
    setResetSuccess(false)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Admins</h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Create Admin
        </button>
      </div>
      
      <CreateAdminModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
            window.location.reload()
        }}
      />

      {/* Reset Password Modal */}
      {isResetOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsResetOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Reset Password for {selectedAdmin.full_name}</h3>
            
            {resetSuccess ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Password Updated!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>The admin can now log in with the new password.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form action={handleResetPassword} className="space-y-4">
                <input type="hidden" name="userId" value={selectedAdmin.id} />
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
      {isDeleteOpen && adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Delete Admin</h3>
            
            {deleteSuccess ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Admin Deleted</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{adminToDelete.full_name} has been removed.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{adminToDelete.full_name}</span>? This action cannot be undone.
                </p>
                
                {deleteError && (
                  <div className="text-red-600 text-sm">{deleteError}</div>
                )}
                
                <form action={handleDelete} className="mt-5 sm:mt-6 flex gap-3">
                  <input type="hidden" name="userId" value={adminToDelete.id} />
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
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {admin.full_name}
                </p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => openResetModal(admin)}
                className="text-gray-400 hover:text-indigo-600"
                title="Reset Password"
              >
                <KeyRound className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => openDeleteModal(admin)}
                className="text-gray-400 hover:text-red-600"
                title="Delete Admin"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
        {admins.length === 0 && (
          <li className="px-4 py-8 text-center text-gray-500 text-sm">
            No admins yet.
          </li>
        )}
      </ul>
    </div>
  )
}
