'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
import DynamicIcon from '@/components/DynamicIcon'
import maplibregl from 'maplibre-gl'
import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import osmtogeojson from 'osmtogeojson'
import type { FeatureCollection } from 'geojson'


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
  const mapRef = useRef<L.Map | null>(null)

  const parcelIcon = L.divIcon({
    html: '<div style="background:#3388ff;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })
  const showroomIcon = L.divIcon({
    html: '<div style="background:#e53e3e;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })

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

  useEffect(() => {
    if (!mapRef.current) return
    const gl = (L as any).maplibreGL({
      style: 'https://demotiles.maplibre.org/style.json',
      interactive: false,
    }).addTo(mapRef.current)
    const map = gl.getMaplibreMap() as maplibregl.Map

    const load = () => {
      if (!mapRef.current) return
      const b = mapRef.current.getBounds()
      const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`
      const query = `[out:json][timeout:25];(
        way["highway"="motorway"](${bbox});
        node["railway"="station"](${bbox});
        node["public_transport"="station"](${bbox});
        node["harbour"](${bbox});
        node["aeroway"="aerodrome"](${bbox});
      );out geom;`
      fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
        .then(res => res.json())
        .then(osm => {
          const geojson = osmtogeojson(osm) as FeatureCollection
          if (map.getSource('overpass')) {
            (map.getSource('overpass') as maplibregl.GeoJSONSource).setData(geojson)
          } else {
            map.addSource('overpass', { type: 'geojson', data: geojson })
            map.addLayer({
              id: 'motorway',
              type: 'line',
              source: 'overpass',
              filter: ['==', 'highway', 'motorway'],
              paint: { 'line-color': '#ff0000', 'line-width': 2 },
            })
            map.addLayer({
              id: 'stations',
              type: 'circle',
              source: 'overpass',
              filter: ['any', ['==', 'railway', 'station'], ['==', 'public_transport', 'station']],
              paint: { 'circle-radius': 4, 'circle-color': '#0066ff' },
            })
            map.addLayer({
              id: 'ports',
              type: 'circle',
              source: 'overpass',
              filter: ['has', 'harbour'],
              paint: { 'circle-radius': 4, 'circle-color': '#333' },
            })
            map.addLayer({
              id: 'airports',
              type: 'circle',
              source: 'overpass',
              filter: ['==', 'aeroway', 'aerodrome'],
              paint: { 'circle-radius': 4, 'circle-color': '#0a0' },
            })
          }
        })
        .catch(console.error)
    }
    mapRef.current.on('moveend', load)
    load()
    return () => {
      mapRef.current?.off('moveend', load)
      gl.remove()
    }
  }, [])


  return (
    <MapContainer
      center={[31.7, -6.5]}
      zoom={6}
      style={{ height: 600, width: '100%' }}
      whenCreated={(m) => {
        mapRef.current = m
      }}
    >
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
                      <DynamicIcon key={i} name={ic} className="w-5 h-5" />
                    ))}
                  </div>
                )}
                {z.properties.amenityIcons.length > 0 && (
                  <div className="flex gap-1 text-xl">
                    {z.properties.amenityIcons.map((ic, i) => (
                      <DynamicIcon key={i} name={ic} className="w-5 h-5" />
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
    </MapContainer>
  )
}
