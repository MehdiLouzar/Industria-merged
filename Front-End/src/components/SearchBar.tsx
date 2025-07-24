'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, Factory } from 'lucide-react'
import { fetchApi } from '@/lib/utils'

interface Filters {
  regionId: string
  zoneTypeId: string
  status: string
  minArea: string
  maxArea: string
  minPrice: string
  maxPrice: string
}
export default function SearchBar({ onSearch }: { onSearch?: (f: Filters) => void }) {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>({
    regionId: '',
    zoneTypeId: '',
    status: '',
    minArea: '',
    maxArea: '',
    minPrice: '',
    maxPrice: '',
  })

  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])
  const [zoneTypes, setZoneTypes] = useState<{ id: string; name: string }[]>([])
  const statuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'SHOWROOM']

  useEffect(() => {
    async function load() {
      const [r, t] = await Promise.all([
        fetchApi<{ id: string; name: string }[]>('/api/regions'),
        fetchApi<{ id: string; name: string }[]>('/api/zone-types'),
      ])
      if (r) setRegions(r)
      if (t) setZoneTypes(t)
    }
    load()
  }, [])

  const handleSearch = () => {
    onSearch?.(filters)
    const params = new URLSearchParams()
    if (filters.regionId) params.set('regionId', filters.regionId)
    if (filters.zoneTypeId) params.set('zoneTypeId', filters.zoneTypeId)
    if (filters.status) params.set('status', filters.status)
    if (filters.minArea) params.set('minArea', filters.minArea)
    if (filters.maxArea) params.set('maxArea', filters.maxArea)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trouvez votre zone industrielle</h2>
        <p className="text-gray-600">Recherchez parmi nos zones industrielles disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" /> Région
          </label>
          <Select value={filters.regionId} onValueChange={(v) => setFilters({ ...filters, regionId: v })}>
            <SelectTrigger><SelectValue placeholder="Choisissez" /></SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Factory className="w-4 h-4 text-red-600" /> Type
          </label>
          <Select value={filters.zoneTypeId} onValueChange={(v) => setFilters({ ...filters, zoneTypeId: v })}>
            <SelectTrigger><SelectValue placeholder="Choisissez" /></SelectTrigger>
            <SelectContent>
              {zoneTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger><SelectValue placeholder="Choisissez" /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Prix min</label>
          <Input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          <label className="text-sm font-medium text-gray-700">Prix max</label>
          <Input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Superficie min (m²)</label>
          <Input type="number" value={filters.minArea} onChange={(e) => setFilters({ ...filters, minArea: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Superficie max (m²)</label>
          <Input type="number" value={filters.maxArea} onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })} />
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSearch} className="search-blue text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
          <Search className="w-5 h-5 mr-2" /> Rechercher
        </Button>
      </div>
    </div>
  )
}
