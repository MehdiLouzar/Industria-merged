"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ZoneMap from "@/components/ZoneMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Parcel {
  id: string;
  reference: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  area?: number | null;
  price?: number | null;
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

interface Zone {
  id: string;
  name: string;
  description?: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  totalArea?: number | null;
  price?: number | null;
  region?: { name: string } | null;
  zoneType?: { name: string } | null;
  activities?: { activity: { name: string } }[];
  amenities?: { amenity: { name: string } }[];
  parcels: Parcel[];
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

export default function ZonePage() {
  const params = useParams();
  const { id } = params as { id: string };
  const [zone, setZone] = useState<Zone | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zones/${id}`)
      .then((r) => r.json())
      .then(setZone)
      .catch(console.error);
  }, [id]);

  if (!zone) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{zone.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {zone.description && <p>{zone.description}</p>}
          <p className="text-muted-foreground">Statut: {zone.status}</p>
          {zone.region?.name && <p>Région: {zone.region.name}</p>}
          {zone.zoneType?.name && <p>Type: {zone.zoneType.name}</p>}
          {zone.totalArea && <p>Superficie: {zone.totalArea} m²</p>}
          {zone.price && <p>Prix: {zone.price} DH/m²</p>}
          {zone.activities && zone.activities.length > 0 && (
            <p>
              Activités:{" "}
              {zone.activities.map((a) => a.activity.name).join(", ")}
            </p>
          )}
          {zone.amenities && zone.amenities.length > 0 && (
            <p>
              Équipements:{" "}
              {zone.amenities.map((a) => a.amenity.name).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>
      <ZoneMap zone={zone} />
    </div>
  );
}
