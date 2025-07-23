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

interface Parcel {
  id: string
  reference: string
  area?: number | null
  price?: number | null
  status: string
  latitude?: number | null
  longitude?: number | null
  lambertX?: number | null
  lambertY?: number | null
  zoneId: string
}

interface ParcelForm {
  id: string
  reference: string
  area: string
  price: string
  status: string
  latitude: string
  longitude: string
  lambertX: string
  lambertY: string
  zoneId: string
}

const statuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'SHOWROOM']

export default function ParcelsAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Parcel[]>([])
  const [zones, setZones] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<ParcelForm>({
    id: '',
    reference: '',
    area: '',
    price: '',
    status: 'AVAILABLE',
    latitude: '',
    longitude: '',
    lambertX: '',
    lambertY: '',
    zoneId: ''
  })

  useEffect(() => { if (session && session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') router.push('/auth/login') }, [session])

  async function load() {
    const base = process.env.NEXT_PUBLIC_API_URL
    const [r1, r2] = await Promise.all([
      fetch(`${base}/api/parcels`),
      fetch(`${base}/api/zones`),
    ])
    if (r1.ok) setItems(await r1.json())
    if (r2.ok) setZones(await r2.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleStatus = (value: string) => {
    setForm({ ...form, status: value })
  }

  const handleZone = (value: string) => {
    setForm({ ...form, zoneId: value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      reference: form.reference,
      area: form.area ? parseFloat(form.area) : undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      status: form.status,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      lambertX: form.lambertX ? parseFloat(form.lambertX) : undefined,
      lambertY: form.lambertY ? parseFloat(form.lambertY) : undefined,
      zoneId: form.zoneId,
    }

    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcels/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    setForm({
      id: '',
      reference: '',
      area: '',
      price: '',
      status: 'AVAILABLE',
      latitude: '',
      longitude: '',
      lambertX: '',
      lambertY: '',
      zoneId: '',
    })
    load()
  }

  function edit(it: Parcel) {
    setForm({
      id: it.id,
      reference: it.reference,
      area: it.area?.toString() ?? '',
      price: it.price?.toString() ?? '',
      status: it.status,
      latitude: it.latitude?.toString() ?? '',
      longitude: it.longitude?.toString() ?? '',
      lambertX: it.lambertX?.toString() ?? '',
      lambertY: it.lambertY?.toString() ?? '',
      zoneId: it.zoneId,
    })
  }
  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcels/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Parcelles</h1>
      <Card>
        <CardContent className="divide-y">
          {items.map(p => (
            <div key={p.id} className="flex justify-between items-center py-2">
              <span>{p.reference}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(p)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(p.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{form.id ? 'Modifier' : 'Nouvelle parcelle'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input id="reference" name="reference" value={form.reference} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Surface m²</Label>
                <Input id="area" name="area" value={form.area} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="price">Prix</Label>
                <Input id="price" name="price" value={form.price} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" name="latitude" value={form.latitude} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" name="longitude" value={form.longitude} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lambertX">Lambert X</Label>
                <Input id="lambertX" name="lambertX" value={form.lambertX} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="lambertY">Lambert Y</Label>
                <Input id="lambertY" name="lambertY" value={form.lambertY} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="zoneId">Zone</Label>
              <Select value={form.zoneId} onValueChange={handleZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
