'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  id: number
  user_id: string
  lat: number
  lng: number
  timestamp: string
  user: {
    full_name: string
  }
}

interface DashboardMapProps {
  locations: Location[]
}

export default function DashboardMap({ locations }: DashboardMapProps) {
  // Center map on the first location or default
  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] 
    : [51.505, -0.09]

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div className="font-semibold">{loc.user.full_name}</div>
              <div className="text-xs text-gray-500">{new Date(loc.timestamp).toLocaleTimeString()}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
