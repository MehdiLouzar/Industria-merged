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

interface Appointment {
  id: string
  contactName: string
  contactEmail: string
  contactPhone: string
  companyName: string
  message: string
  requestedDate: string
  parcelId: string
  status: string
}

const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function AppointmentsAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Appointment[]>([])
  const [parcels, setParcels] = useState<{ id: string; reference: string }[]>([])
  const [form, setForm] = useState<Appointment>({
    id: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    message: '',
    requestedDate: '',
    parcelId: '',
    status: 'PENDING',
  })

  useEffect(() => { if (session && session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') router.push('/auth/login') }, [session])

  async function load() {
    const base = process.env.NEXT_PUBLIC_API_URL
    const [r1, r2] = await Promise.all([
      fetch(`${base}/api/appointments`),
      fetch(`${base}/api/parcels`),
    ])
    if (r1.ok) setItems(await r1.json())
    if (r2.ok) setParcels(await r2.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleStatus = (value: string) => {
    setForm({ ...form, status: value })
  }

  const handleParcel = (value: string) => {
    setForm({ ...form, parcelId: value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      contactName: form.contactName,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      companyName: form.companyName || undefined,
      message: form.message || undefined,
      requestedDate: form.requestedDate || undefined,
      parcelId: form.parcelId || undefined,
      status: form.status,
    }

    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    setForm({
      id: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      companyName: '',
      message: '',
      requestedDate: '',
      parcelId: '',
      status: 'PENDING',
    })
    load()
  }

  function edit(it: Appointment) {
    setForm({
      id: it.id,
      contactName: it.contactName,
      contactEmail: it.contactEmail ?? '',
      contactPhone: it.contactPhone ?? '',
      companyName: it.companyName ?? '',
      message: it.message ?? '',
      requestedDate: it.requestedDate ? it.requestedDate.slice(0, 10) : '',
      parcelId: it.parcelId ?? '',
      status: it.status,
    })
  }
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
              <span>{a.contactName} - {a.status}</span>
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
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="companyName">Société</Label>
              <Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Input id="message" name="message" value={form.message} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="requestedDate">Date souhaitée</Label>
              <Input id="requestedDate" name="requestedDate" type="date" value={form.requestedDate} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="parcelId">Parcelle</Label>
              <Select value={form.parcelId} onValueChange={handleParcel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {parcels.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.reference}</SelectItem>
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
