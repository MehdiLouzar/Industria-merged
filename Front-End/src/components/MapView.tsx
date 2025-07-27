'use client'

import { useEffect, useState, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
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
import { TrainFront, Ship, Plane } from 'lucide-react'


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
  type Poi = { id: string; coordinates: [number, number]; type: 'station' | 'port' | 'airport' }
  const [pois, setPois] = useState<Poi[]>([])
  const mapRef = useRef<L.Map | null>(null)

  const parcelIcon = L.divIcon({
    html: '<div style="background:#3388ff;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })
  const showroomIcon = L.divIcon({
    html: '<div style="background:#e53e3e;border-radius:50%;width:12px;height:12px;border:2px solid white"></div>',
    className: ''
  })

  const stationIcon = L.divIcon({
    html: renderToStaticMarkup(<TrainFront width={20} height={20} stroke="#0066ff" />),
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
  const portIcon = L.divIcon({
    html: renderToStaticMarkup(<Ship width={20} height={20} stroke="#333" />),
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
  const airportIcon = L.divIcon({
    html: renderToStaticMarkup(<Plane width={20} height={20} stroke="#0a0" />),
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
    const LMaplibre = L as unknown as typeof L & {
      maplibreGL: (opts: { style: string; interactive: boolean }) => {
        addTo(map: L.Map): {
          getMaplibreMap(): maplibregl.Map
          remove(): void
        }
      }
    }
    const gl = LMaplibre
      .maplibreGL({ style: 'https://demotiles.maplibre.org/style.json', interactive: false })
      .addTo(mapRef.current)
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

          const newPois: Poi[] = []
          for (const f of geojson.features) {
            if (f.geometry.type === 'Point') {
              const [lon, lat] = f.geometry.coordinates as [number, number]
              const props = f.properties as Record<string, unknown>
              if (props.railway === 'station' || props.public_transport === 'station') {
                newPois.push({ id: String(props['@id'] ?? `${lon}-${lat}`), coordinates: [lat, lon], type: 'station' })
              } else if (props.harbour != null) {
                newPois.push({ id: String(props['@id'] ?? `${lon}-${lat}`), coordinates: [lat, lon], type: 'port' })
              } else if (props.aeroway === 'aerodrome') {
                newPois.push({ id: String(props['@id'] ?? `${lon}-${lat}`), coordinates: [lat, lon], type: 'airport' })
              }
            }
          }
          setPois(newPois)

          if (map.getSource('overpass')) {
            (map.getSource('overpass') as maplibregl.GeoJSONSource).setData(geojson)
          } else {
            map.addSource('overpass', { type: 'geojson', data: geojson })
            map.addLayer({
              id: 'motorway',
              type: 'line',
              source: 'overpass',
              filter: ['==', 'highway', 'motorway'],
              minzoom: 0,
              paint: { 'line-color': '#0000ff', 'line-width': 10 },
            })
          }
        })
        .catch(console.error)
    }
    const onLoad = () => {
      load()
      mapRef.current?.on('moveend', load)
    }
    map.on('load', onLoad)
    return () => {
      mapRef.current?.off('moveend', load)
      map.off('load', onLoad)
      gl.remove()
    }
  }, [])


  return (
    <div className="relative">
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
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.coordinates}
            icon={poi.type === 'station' ? stationIcon : poi.type === 'port' ? portIcon : airportIcon}
          />
        ))}
      </MarkerClusterGroup>
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-white/80 p-2 text-xs rounded shadow space-y-1 z-10">
        <div>
          <span className="inline-block w-6 border-b-8 border-blue-600 align-middle mr-1"></span>
          Autoroutes
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full align-middle mr-1"></span>
          Gares
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-gray-700 rounded-full align-middle mr-1"></span>
          Ports
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-green-700 rounded-full align-middle mr-1"></span>
          Aéroports
        </div>
      </div>
    </div>
  )
}
