"use client";

import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import { useState } from "react";
import proj4 from "proj4";
import { Button } from "@/components/ui/button";
import AppointmentForm from "@/components/AppointmentForm";

interface Parcel {
  id: string;
  reference: string;
  status: string;
  isFree?: boolean;
  lambertX?: number | null;
  lambertY?: number | null;
  area?: number | null;
  price?: number | null;
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

interface Zone {
  id: string;
  name: string;
  status: string;
  lambertX?: number | null;
  lambertY?: number | null;
  parcels: Parcel[];
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

export default function ZoneMap({ zone }: { zone: Zone }) {
  const [selected, setSelected] = useState<Parcel | null>(null);

  const lambertMA =
    '+proj=lcc +lat_1=33.3 +lat_2=35.1 +lat_0=33 +lon_0=-5 +x_0=500000 +y_0=300000 +ellps=clrk80 +units=m +no_defs';
  const toLatLng = (x: number, y: number): [number, number] => {
    const [lon, lat] = proj4(lambertMA, proj4.WGS84, [x, y]);
    return [lat, lon];
  };

  const center = zone.vertices && zone.vertices.length
    ? (() => {
        const sum = zone.vertices.reduce(
          (acc, v) => [acc[0] + v.lambertX, acc[1] + v.lambertY],
          [0, 0]
        )
        return toLatLng(sum[0] / zone.vertices.length, sum[1] / zone.vertices.length)
      })()
    : zone.lambertX != null && zone.lambertY != null
      ? toLatLng(zone.lambertX, zone.lambertY)
      : [31.7, -6.5]

  const zonePolygon: [number, number][] = zone.vertices && zone.vertices.length
    ? zone.vertices
        .sort((a, b) => a.seq - b.seq)
        .map((v) => toLatLng(v.lambertX, v.lambertY))
    : (() => {
        const [lat, lon] = center;
        return [
          [lat + 0.01, lon - 0.01],
          [lat + 0.01, lon + 0.01],
          [lat - 0.01, lon + 0.01],
          [lat - 0.01, lon - 0.01],
        ];
      })();

  const parcelPoly = (p: Parcel): [number, number][] =>
    p.vertices && p.vertices.length
      ? p.vertices
          .sort((a, b) => a.seq - b.seq)
          .map((v) => toLatLng(v.lambertX, v.lambertY))
      : (() => {
          const size = 100; // meters in Lambert units
          const baseX = p.lambertX ?? zone.lambertX ?? 0;
          const baseY = p.lambertY ?? zone.lambertY ?? 0;
          return [
            toLatLng(baseX - size, baseY - size),
            toLatLng(baseX - size, baseY + size),
            toLatLng(baseX + size, baseY + size),
            toLatLng(baseX + size, baseY - size),
          ];
        })();

  const zoneColor: Record<string, string> = {
    AVAILABLE: "green",
    RESERVED: "orange",
    OCCUPIED: "red",
    SHOWROOM: "blue",
  };

  const parcelColor = (s: string) => {
    switch (s) {
      case "AVAILABLE":
        return "green";
      case "RESERVED":
        return "red";
      case "OCCUPIED":
        return "gray";
      case "SHOWROOM":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: 350, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polygon
          positions={zonePolygon}
          pathOptions={{ color: zoneColor[zone.status] || "blue" }}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <strong>{zone.name}</strong>
              <div>Statut: {zone.status}</div>
            </div>
          </Popup>
        </Polygon>
        {zone.parcels.map(
          (p) =>
            (p.lambertX != null && p.lambertY != null) && (
              <Polygon
                key={p.id}
                positions={parcelPoly(p)}
                pathOptions={{ color: parcelColor(p.status), fillOpacity: 0.5 }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <strong>{p.reference}</strong>
                    {p.area && <div>Surface: {p.area} m²</div>}
                    {p.price && <div>Prix: {p.price} DH</div>}
                    <div>Statut: {p.status}</div>
                    {p.status === "AVAILABLE" && p.isFree && (
                      <Button
                        size="sm"
                        className="mt-1"
                        onClick={() => setSelected(p)}
                      >
                        Réserver
                      </Button>
                    )}
                  </div>
                </Popup>
              </Polygon>
            ),
        )}
      </MapContainer>
      {selected && (
        <AppointmentForm parcel={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
