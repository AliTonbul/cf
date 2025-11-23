'use client'

import { useState, useEffect, useRef } from 'react'
import { clockIn, clockOut, recordLocation } from '@/app/employee/actions'
import { MapPin, Clock, AlertCircle } from 'lucide-react'

interface ClockInProps {
  initialTimesheet: {
    id: string
    clock_in: string
  } | null
}

export default function ClockIn({ initialTimesheet }: ClockInProps) {
  const [timesheet, setTimesheet] = useState(initialTimesheet)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  
  // Ref to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        })
      }
    })
  }

  const handleClockIn = async () => {
    setLoading(true)
    setError(null)
    setStatus('Getting location...')
    
    try {
      const position = await getLocation()
      setStatus('Clocking in...')
      
      const result = await clockIn(position.coords.latitude, position.coords.longitude)
      
      if (result.error) {
        setError(result.error)
      } else {
        setTimesheet({
          id: result.timesheetId!,
          clock_in: new Date().toISOString()
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  const handleClockOut = async () => {
    if (!timesheet) return
    
    setLoading(true)
    setError(null)
    setStatus('Getting location...')
    
    try {
      const position = await getLocation()
      setStatus('Clocking out...')
      
      const result = await clockOut(timesheet.id, position.coords.latitude, position.coords.longitude)
      
      if (result.error) {
        setError(result.error)
      } else {
        setTimesheet(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  // Effect to handle periodic location tracking
  useEffect(() => {
    if (timesheet) {
      // Start interval
      console.log('Starting location tracking...')
      intervalRef.current = setInterval(async () => {
        try {
          console.log('Recording periodic location...')
          const position = await getLocation()
          await recordLocation(timesheet.id, position.coords.latitude, position.coords.longitude)
        } catch (err) {
          console.error('Failed to record periodic location', err)
        }
      }, 3600000) // 1 hour = 3600000 ms

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [timesheet])

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {timesheet ? 'You are Clocked In' : 'Ready to Work?'}
        </h1>
        <p className="mt-2 text-gray-600">
          {timesheet 
            ? `Started at ${new Date(timesheet.clock_in).toLocaleTimeString()}`
            : 'Clock in to start tracking your time and location.'}
        </p>
      </div>

      <button
        onClick={timesheet ? handleClockOut : handleClockIn}
        disabled={loading}
        className={`
          relative flex h-48 w-48 items-center justify-center rounded-full shadow-xl transition-all
          ${timesheet 
            ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100' 
            : 'bg-green-500 hover:bg-green-600 ring-4 ring-green-100'
          }
          ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
      >
        <div className="flex flex-col items-center text-white">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          ) : (
            timesheet ? <Clock className="h-12 w-12 mb-2" /> : <MapPin className="h-12 w-12 mb-2" />
          )}
          <span className="text-xl font-bold uppercase tracking-wider">
            {loading ? status : (timesheet ? 'Clock Out' : 'Clock In')}
          </span>
        </div>
      </button>

      {timesheet && (
        <div className="text-xs text-gray-400 max-w-xs text-center">
          Location is being tracked every hour while you are clocked in.
        </div>
      )}
    </div>
  )
}
