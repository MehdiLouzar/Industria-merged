'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchApi } from '@/lib/utils'

type ZoneFeature = {
  geometry: { type: string; coordinates: [number, number] }
  properties: {
    id: string
    name: string
    status: string
    availableParcels: number
    activityIcons: string[]
  }
}

type ParcelFeature = {
  geometry: { type: string; coordinates: [number, number] }
  properties: { id: string; reference: string }
}

export default function MapView() {
  const [zones, setZones] = useState<ZoneFeature[]>([])
  const [parcels, setParcels] = useState<ParcelFeature[]>([])

  useEffect(() => {
    fetchApi<{ features: ZoneFeature[] }>("/api/map/zones")
      .then((d) => d && setZones(d.features))
      .catch(console.error)
    fetchApi<{ features: ParcelFeature[] }>("/api/map/parcels")
      .then((d) => d && setParcels(d.features))
      .catch(console.error)
  }, [])


  return (
    <MapContainer center={[31.5, -7.5]} zoom={6} style={{ height: 600, width: '100%' }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        id="mapbox/streets-v11"
      />
      {zones.map(z => (
        <Marker
          key={z.properties.id}
          position={[z.geometry.coordinates[1], z.geometry.coordinates[0]]}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <strong className="block mb-1">{z.properties.name}</strong>
              <div>Statut: {z.properties.status}</div>
              <div>Parcelles disponibles: {z.properties.availableParcels}</div>
              {z.properties.activityIcons.length > 0 && (
                <div className="flex gap-1 text-lg">
                  {z.properties.activityIcons.map((ic, i) => (
                    <span key={i}>{ic}</span>
                  ))}
                </div>
              )}
              <Link
                href={`/zones/${z.properties.id}`}
                className="text-blue-600 underline block mt-1"
              >
                Voir la zone
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {parcels.map(p => (
        <Marker key={p.properties.id} position={[p.geometry.coordinates[1], p.geometry.coordinates[0]]}>
          <Popup>Parcelle {p.properties.reference}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
