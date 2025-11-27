'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createEmployee } from '@/app/dashboard/actions'

interface CreateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateEmployeeModal({ isOpen, onClose, onSuccess }: CreateEmployeeModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    const res = await createEmployee(formData)
    
    if (res?.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      setTimeout(() => {
        onSuccess()
        onClose()
        setSuccess(false)
      }, 1500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          disabled={isLoading}
        >
          <X className="h-6 w-6" />
        </button>
        
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Employee</h3>
        
        {success ? (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Employee Created!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The employee can now log in with their credentials.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                disabled={isLoading}
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
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <div className="mt-5 sm:mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
