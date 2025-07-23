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

interface User {
  id: string
  email: string
  name: string
  role: string
}

const roles = ['ADMIN', 'MANAGER', 'USER']

export default function UsersAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<User[]>([])
  const [form, setForm] = useState<User & { password?: string }>({ id: '', email: '', name: '', role: 'USER', password: '' })

  useEffect(() => { if (session && session.user.role !== 'ADMIN') router.push('/auth/login') }, [session])

  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
    if (res.ok) setItems(await res.json())
  }
  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRole = (value: string) => {
    setForm({ ...form, role: value })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = { email: form.email, name: form.name, role: form.role, password: form.password }
    if (form.id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${form.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
    }
    setForm({ id: '', email: '', name: '', role: 'USER', password: '' })
    load()
  }

  function edit(it: User) { setForm({ ...it, password: '' }) }
  async function del(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Utilisateurs</h1>
      <Card>
        <CardContent className="divide-y">
          {items.map(u => (
            <div key={u.id} className="flex justify-between items-center py-2">
              <span>{u.email}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => edit(u)}>Éditer</Button>
                <Button size="sm" variant="destructive" onClick={() => del(u.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{form.id ? 'Modifier' : 'Nouvel utilisateur'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={form.role} onValueChange={handleRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" value={form.password || ''} onChange={handleChange} />
            </div>
            <Button type="submit">{form.id ? 'Mettre à jour' : 'Créer'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
