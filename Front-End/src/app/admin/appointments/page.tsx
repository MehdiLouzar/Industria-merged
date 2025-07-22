'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Appointment {
  id: string
  contactName: string
  status: string
}

export default function AppointmentsAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Appointment[]>([])
  const [form, setForm] = useState<Appointment>({ id: '', contactName: '', status: 'PENDING' })

  useEffect(() => { if (session && session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') router.push('/auth/login') }, [session])

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`)
    if (res.ok) setItems(await res.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${form.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactName: form.contactName, status: form.status })
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactName: form.contactName, status: form.status })
      })
    }
    setForm({ id: '', contactName: '', status: 'PENDING' })
    load()
  }

  function edit(it: Appointment) { setForm(it) }
  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Rendez-vous</h1>
      <Card>
        <CardContent className="divide-y">
          {items.map(a => (
            <div key={a.id} className="flex justify-between items-center py-2">
              <span>{a.contactName}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(a)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(a.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{form.id ? 'Modifier' : 'Nouveau RDV'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="contactName">Contact</Label>
              <Input id="contactName" name="contactName" value={form.contactName} onChange={handleChange} required />
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
