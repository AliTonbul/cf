'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createAdmin } from '@/app/dashboard/actions'

interface CreateAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateAdminModal({ isOpen, onClose, onSuccess }: CreateAdminModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    
    const res = await createAdmin(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Admin</h3>
        
        {success ? (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Admin Created!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The new admin has been created successfully.</p>
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Default Password</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
              <p className="mt-1 text-xs text-gray-500">They can change this after logging in.</p>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <div className="mt-5 sm:mt-6">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create Admin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
