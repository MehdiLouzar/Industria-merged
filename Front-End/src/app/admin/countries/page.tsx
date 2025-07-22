'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Country {
  id: string
  name: string
  code: string
}

export default function CountriesAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Country[]>([])
  const [form, setForm] = useState<Country>({ id: '', name: '', code: '' })

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/auth/login')
    }
  }, [session])

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries`)
    if (res.ok) setItems(await res.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, code: form.code })
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, code: form.code })
      })
    }
    setForm({ id: '', name: '', code: '' })
    load()
  }

  function edit(it: Country) {
    setForm(it)
  }

  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Gestion des Pays</h1>
      <Card>
        <CardContent className="divide-y">
          {items.map(c => (
            <div key={c.id} className="flex justify-between items-center py-2">
              <span>{c.name} ({c.code})</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(c)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(c.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{form.id ? 'Modifier un pays' : 'Nouveau pays'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" value={form.code} onChange={handleChange} required />
            </div>
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
