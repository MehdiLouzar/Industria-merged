'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Zone {
  id: string
  name: string
  status: string
}

export default function ZonesAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [form, setForm] = useState<Zone>({ id: '', name: '', status: 'AVAILABLE' })

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      router.push('/auth/login')
    }
  }, [session])

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones`)
    if (res.ok) {
      setZones(await res.json())
    }
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, status: form.status })
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, status: form.status })
      })
    }
    setForm({ id: '', name: '', status: 'AVAILABLE' })
    load()
  }

  async function edit(z: Zone) {
    setForm({ id: z.id, name: z.name, status: z.status })
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
              <Input id="status" name="status" value={form.status} onChange={handleChange} />
            </div>
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
