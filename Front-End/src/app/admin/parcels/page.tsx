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
  zoneId: string
  status: string
}

const statuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'SHOWROOM']

export default function ParcelsAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Parcel[]>([])
  const [zones, setZones] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<Parcel>({ id: '', reference: '', zoneId: '', status: 'AVAILABLE' })

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
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcels/${form.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: form.reference, zoneId: form.zoneId, status: form.status })
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcels`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: form.reference, zoneId: form.zoneId, status: form.status })
      })
    }
    setForm({ id: '', reference: '', zoneId: '', status: 'AVAILABLE' })
    load()
  }

  function edit(it: Parcel) { setForm(it) }
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
