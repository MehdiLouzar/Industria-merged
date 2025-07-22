'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import type { LeafletEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

type GeoFeature = {
  geometry: { type: string; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export default function MapView() {
  const [zones, setZones] = useState<GeoFeature[]>([])
  const [parcels, setParcels] = useState<GeoFeature[]>([])

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    fetch(`${base}/api/map/zones`).then(r => r.json()).then(d => setZones(d.features)).catch(console.error)
    fetch(`${base}/api/map/parcels`).then(r => r.json()).then(d => setParcels(d.features)).catch(console.error)
  }, [])

  function handleCreate(e: LeafletEvent) {
    const layer = (e as unknown as { layer?: { getLatLngs?: () => unknown } }).layer
    if (layer && layer.getLatLngs) {
      // In a real app, send polygon coordinates to the API
      console.log('New polygon', layer.getLatLngs())
    }
  }

  return (
    <MapContainer center={[31.5, -7.5]} zoom={6} style={{ height: 600, width: '100%' }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        id="mapbox/streets-v11"
      />
      {zones.map(z => (
        <Marker key={z.properties.id} position={[z.geometry.coordinates[1], z.geometry.coordinates[0]]}>
          <Popup>
            <div className="space-y-1">
              <strong>{z.properties.name}</strong>
              <div>Statut: {z.properties.status}</div>
              <Link href={`/zones/${z.properties.id}`} className="text-blue-600 underline">Voir la zone</Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {parcels.map(p => (
        <Marker key={p.properties.id} position={[p.geometry.coordinates[1], p.geometry.coordinates[0]]}>
          <Popup>Parcelle {p.properties.reference}</Popup>
        </Marker>
      ))}
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreate}
          draw={{ rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false }}
        />
      </FeatureGroup>
    </MapContainer>
  )
}
