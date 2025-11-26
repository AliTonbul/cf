'use client'

import { useState } from 'react'
import { updateProfile, changePassword } from '@/app/dashboard/settings/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface SettingsFormProps {
  initialFullName: string
  initialEmail: string
}

export default function SettingsForm({ initialFullName, initialEmail }: SettingsFormProps) {
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  async function handleProfileUpdate(formData: FormData) {
    setIsProfileLoading(true)
    setProfileMessage('')
    
    const result = await updateProfile(formData)
    
    if (result.error) {
      setProfileMessage(result.error)
    } else {
      setProfileMessage('Profile updated successfully!')
    }
    
    setIsProfileLoading(false)
  }

  async function handlePasswordChange(formData: FormData) {
    setIsPasswordLoading(true)
    setPasswordMessage('')
    
    const result = await changePassword(formData)
    
    if (result.error) {
      setPasswordMessage(result.error)
    } else {
      setPasswordMessage('Password changed successfully!')
      // Reset form
      const form = document.getElementById('password-form') as HTMLFormElement
      form?.reset()
    }
    
    setIsPasswordLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={initialFullName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialEmail}
                required
              />
            </div>

            {profileMessage && (
              <div
                className={`text-sm ${
                  profileMessage.includes('success')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {profileMessage}
              </div>
            )}

            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" action={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            {passwordMessage && (
              <div
                className={`text-sm ${
                  passwordMessage.includes('success')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
