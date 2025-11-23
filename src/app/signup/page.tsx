'use client'

import { useState, useActionState } from 'react'
import { signup } from '../auth/actions'

const initialState = {
  error: '',
}

export default function SignupPage() {
  const [role, setRole] = useState<'owner' | 'employee'>('owner')
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
          </p>
        </div>

        {state?.error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex justify-center space-x-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => setRole('owner')}
            type="button"
            className={`pb-2 text-sm font-medium ${
              role === 'owner'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Business Owner
          </button>
          <button
            onClick={() => setRole('employee')}
            type="button"
            className={`pb-2 text-sm font-medium ${
              role === 'employee'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Employee
          </button>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          <input type="hidden" name="role" value={role} />
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
              <div className="mt-2">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            {role === 'owner' ? (
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium leading-6 text-gray-900">Business Name</label>
                <div className="mt-2">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium leading-6 text-gray-900">Invite Code</label>
                <div className="mt-2">
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    placeholder="Enter the code from your employer"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
            >
              {isPending ? (role === 'owner' ? 'Creating...' : 'Joining...') : (role === 'owner' ? 'Create Business' : 'Join Business')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
