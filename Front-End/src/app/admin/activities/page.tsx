'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Activity {
  id: string
  name: string
  description?: string
  icon?: string
}

export default function ActivitiesAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Activity[]>([])
  const [form, setForm] = useState<Activity>({
    id: '',
    name: '',
    description: '',
    icon: '',
  })

  useEffect(() => { if (session && session.user.role !== 'ADMIN') router.push('/auth/login') }, [session])

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`)
    if (res.ok) setItems(await res.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      name: form.name,
      description: form.description || undefined,
      icon: form.icon || undefined,
    }
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setForm({ id: '', name: '', description: '', icon: '' })
    load()
  }

  function edit(it: Activity) {
    setForm({
      id: it.id,
      name: it.name,
      description: it.description ?? '',
      icon: it.icon ?? '',
    })
  }
  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Activités</h1>
      <Card>
        <CardContent className="divide-y">
          {items.map(a => (
            <div key={a.id} className="flex justify-between items-center py-2">
              <span>{a.name}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(a)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(a.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{form.id ? 'Modifier' : 'Nouvelle activité'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="icon">Icône</Label>
              <Input id="icon" name="icon" value={form.icon} onChange={handleChange} />
            </div>
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
