'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import 'leaflet/dist/leaflet.css'
// react-leaflet-markercluster exposes its CSS via the "styles" export
import 'react-leaflet-markercluster/styles'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })
import { fetchApi } from '@/lib/utils'
import { ports, trainStations, busStations, highways } from '@/data/infrastructure'


type ZoneFeature = {
  geometry: { type: string; coordinates: [number, number] }
  properties: {
    id: string
    name: string
    status: string
    availableParcels: number
    activityIcons: string[]
    amenityIcons: string[]
  }
}

type ParcelFeature = {
  geometry: { type: string; coordinates: [number, number] }
  properties: { id: string; reference: string; isShowroom: boolean; status: string }
}

export default function MapView() {
  const [zones, setZones] = useState<ZoneFeature[]>([])
  const [parcels, setParcels] = useState<ParcelFeature[]>([])

  const parcelIcon = L.divIcon({
    html: '<div style="background:#3388ff;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })
  const showroomIcon = L.divIcon({
    html: '<div style="background:#e53e3e;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })
  const portIcon = L.divIcon({ html: '⚓', className: 'text-xl' })
  const trainIcon = L.divIcon({ html: '🚆', className: 'text-xl' })
  const busIcon = L.divIcon({ html: '🚌', className: 'text-xl' })

  useEffect(() => {
    fetchApi<{ features: ZoneFeature[] }>("/api/map/zones")
      .then((d) => {
        if (!d) return
        const conv = d.features.map((f) => ({
          ...f,
          // convert to [lat, lon] for Leaflet
          geometry: {
            type: f.geometry.type,
            coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
          },
        }))
        setZones(conv)
      })
      .catch(console.error)
    fetchApi<{ features: ParcelFeature[] }>("/api/map/parcels")
      .then((d) => {
        if (!d) return
        const conv = d.features.map((f) => ({
          ...f,
          geometry: {
            type: f.geometry.type,
            coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
          },
        }))
        setParcels(conv)
      })
      .catch(console.error)
  }, [])


  return (
    <MapContainer center={[31.7, -6.5]} zoom={6} style={{ height: 600, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup
        showCoverageOnHover={false}
        chunkedLoading
      >
        {zones.map(z => (
          <Marker
            key={z.properties.id}
            position={z.geometry.coordinates}
          >
            <Popup>
              <div className="space-y-1 text-sm p-1">
                <strong className="block mb-1">{z.properties.name}</strong>
                <div>Statut: {z.properties.status}</div>
                <div>Parcelles disponibles: {z.properties.availableParcels}</div>
                {z.properties.activityIcons.length > 0 && (
                  <div className="flex gap-1 text-xl">
                    {z.properties.activityIcons.map((ic, i) => (
                      <span key={i}>{ic}</span>
                    ))}
                  </div>
                )}
                {z.properties.amenityIcons.length > 0 && (
                  <div className="flex gap-1 text-xl">
                    {z.properties.amenityIcons.map((ic, i) => (
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
          <Marker
            key={p.properties.id}
            position={p.geometry.coordinates}
            icon={p.properties.isShowroom ? showroomIcon : parcelIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{p.properties.reference}</strong>
                <div>Statut: {p.properties.status}</div>
                {p.properties.isShowroom && <div>Showroom</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {highways.map((h, i) => (
        <Polyline key={i} positions={h.path} pathOptions={{ color: '#ff5722' }} />
      ))}
      {[...ports, ...trainStations, ...busStations].map((m, i) => {
        const icon = m.type === 'port' ? portIcon : m.type === 'train' ? trainIcon : busIcon
        return (
          <Marker key={`inf-${i}`} position={m.position} icon={icon}>
            <Popup>{m.name}</Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
