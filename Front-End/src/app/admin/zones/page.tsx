'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface Zone {
  id: string
  name: string
  status: string
  zoneTypeId?: string
  regionId?: string
  activityIds: string[]
  amenityIds: string[]
}

const statuses = [
  'AVAILABLE',
  'PARTIALLY_OCCUPIED',
  'FULLY_OCCUPIED',
  'UNDER_DEVELOPMENT',
  'RESERVED',
]

export default function ZonesAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [zoneTypes, setZoneTypes] = useState<{ id: string; name: string }[]>([])
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])
  const [activities, setActivities] = useState<{ id: string; name: string }[]>([])
  const [amenities, setAmenities] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<Zone>({
    id: '',
    name: '',
    status: 'AVAILABLE',
    zoneTypeId: '',
    regionId: '',
    activityIds: [],
    amenityIds: [],
  })

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      router.push('/auth/login')
    }
  }, [session])

  async function load() {
    const base = process.env.NEXT_PUBLIC_API_URL
    const [r1, r2, r3, r4, r5] = await Promise.all([
      fetch(`${base}/api/zones`),
      fetch(`${base}/api/zone-types`),
      fetch(`${base}/api/regions`),
      fetch(`${base}/api/activities`),
      fetch(`${base}/api/amenities`),
    ])
    if (r1.ok) setZones(await r1.json())
    if (r2.ok) setZoneTypes(await r2.json())
    if (r3.ok) setRegions(await r3.json())
    if (r4.ok) setActivities(await r4.json())
    if (r5.ok) setAmenities(await r5.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleStatus = (value: string) => {
    setForm({ ...form, status: value })
  }

  const handleZoneType = (value: string) => {
    setForm({ ...form, zoneTypeId: value })
  }

  const handleRegion = (value: string) => {
    setForm({ ...form, regionId: value })
  }

  const toggleActivity = (id: string) => {
    setForm((f) => ({
      ...f,
      activityIds: f.activityIds.includes(id)
        ? f.activityIds.filter((a) => a !== id)
        : [...f.activityIds, id],
    }))
  }

  const toggleAmenity = (id: string) => {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(id)
        ? f.amenityIds.filter((a) => a !== id)
        : [...f.amenityIds, id],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      name: form.name,
      status: form.status,
      zoneTypeId: form.zoneTypeId || undefined,
      regionId: form.regionId || undefined,
      activityIds: form.activityIds,
      amenityIds: form.amenityIds,
    }
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setForm({
      id: '',
      name: '',
      status: 'AVAILABLE',
      zoneTypeId: '',
      regionId: '',
      activityIds: [],
      amenityIds: [],
    })
    load()
  }

  async function edit(z: Zone) {
    setForm({
      id: z.id,
      name: z.name,
      status: z.status,
      zoneTypeId: z.zoneTypeId || '',
      regionId: z.regionId || '',
      activityIds: z.activities ? z.activities.map(a => a.activityId) : [],
      amenityIds: z.amenities ? z.amenities.map(a => a.amenityId) : [],
    })
  }

  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Gestion des Zones</h1>
      <Card>
        <CardContent className="divide-y">
          {zones.map(zone => (
            <div key={zone.id} className="flex justify-between items-center py-2">
              <span>{zone.name}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(zone)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(zone.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{form.id ? 'Modifier une zone' : 'Nouvelle zone'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={form.status} onValueChange={handleStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zoneTypeId">Type</Label>
              <Select value={form.zoneTypeId} onValueChange={handleZoneType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {zoneTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="regionId">Région</Label>
              <Select value={form.regionId} onValueChange={handleRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Activités</Label>
              <div className="flex flex-wrap gap-2">
                {activities.map((a) => (
                  <label key={a.id} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={form.activityIds.includes(a.id)}
                      onChange={() => toggleActivity(a.id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Équipements</Label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <label key={a.id} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={form.amenityIds.includes(a.id)}
                      onChange={() => toggleAmenity(a.id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
