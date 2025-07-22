'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ZoneMap from '@/components/ZoneMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Parcel {
  id: string
  reference: string
  status: string
  latitude: number | null
  longitude: number | null
}

interface Zone {
  id: string
  name: string
  description?: string
  status: string
  latitude: number | null
  longitude: number | null
  parcels: Parcel[]
}

export default function ZonePage() {
  const params = useParams()
  const { id } = params as { id: string }
  const [zone, setZone] = useState<Zone | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones/${id}`)
      .then(r => r.json())
      .then(setZone)
      .catch(console.error)
  }, [id])

  if (!zone) return <p className="p-4">Chargement...</p>

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{zone.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{zone.description}</p>
          <p className="text-sm text-muted-foreground">Statut: {zone.status}</p>
        </CardContent>
      </Card>
      <ZoneMap zone={zone} />
    </div>
  )
}
