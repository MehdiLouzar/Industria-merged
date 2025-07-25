"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ZoneMap from "@/components/ZoneMap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppointmentForm from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/utils";

interface Parcel {
  id: string;
  reference: string;
  status: string;
  lambertX: number | null;
  lambertY: number | null;
  area?: number | null;
  price?: number | null;
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

interface Zone {
  id: string;
  name: string;
  description?: string;
  status: string;
  lambertX: number | null;
  lambertY: number | null;
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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchApi<Zone>(`/api/zones/${id}`)
      .then((z) => z && setZone(z))
      .catch(console.error);
  }, [id]);

  if (!zone) return <p className="p-4">Chargement...</p>;

  return (
    <>
      <Header />
      <div className="p-4 space-y-6 max-w-5xl mx-auto">
        <Card className="shadow">
          <CardHeader>
            <CardTitle>{zone.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
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
        <div className="text-right">
          <Button onClick={() => setShowForm(true)}>Prendre rendez-vous</Button>
        </div>
        <div className="pt-4">
          <ZoneMap zone={zone} />
        </div>
      </div>
      <Footer />
      {showForm && zone.parcels[0] && (
        <AppointmentForm
          parcel={{ id: zone.parcels[0].id, reference: zone.parcels[0].reference }}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
