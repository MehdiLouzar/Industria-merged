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
  latitude: number | null;
  longitude: number | null;
  area?: number | null;
  price?: number | null;
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

interface Zone {
  id: string;
  name: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  parcels: Parcel[];
  vertices?: { seq: number; lambertX: number; lambertY: number }[];
}

export default function ZoneMap({ zone }: { zone: Zone }) {
  const [selected, setSelected] = useState<Parcel | null>(null);

  const lambert93 =
    '+proj=lcc +lat_1=44 +lat_2=49 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs';
  const toLatLng = (x: number, y: number): [number, number] => {
    const [lon, lat] = proj4(lambert93, proj4.WGS84, [x, y]);
    return [lat, lon];
  };

  if (zone.latitude == null || zone.longitude == null) return null;

  const zonePolygon: [number, number][] = zone.vertices && zone.vertices.length
    ? zone.vertices
        .sort((a, b) => a.seq - b.seq)
        .map((v) => toLatLng(v.lambertX, v.lambertY))
    : [
        [zone.latitude + 0.01, zone.longitude - 0.01],
        [zone.latitude + 0.01, zone.longitude + 0.01],
        [zone.latitude - 0.01, zone.longitude + 0.01],
        [zone.latitude - 0.01, zone.longitude - 0.01],
      ];

  const parcelPoly = (p: Parcel): [number, number][] =>
    p.vertices && p.vertices.length
      ? p.vertices
          .sort((a, b) => a.seq - b.seq)
          .map((v) => toLatLng(v.lambertX, v.lambertY))
      : (() => {
          const size = 0.002;
          return [
            [p.latitude! + size, p.longitude! - size],
            [p.latitude! + size, p.longitude! + size],
            [p.latitude! - size, p.longitude! + size],
            [p.latitude! - size, p.longitude! - size],
          ];
        })();

  const zoneColor: Record<string, string> = {
    AVAILABLE: "green",
    PARTIALLY_OCCUPIED: "orange",
    FULLY_OCCUPIED: "red",
    UNDER_DEVELOPMENT: "gray",
    RESERVED: "red",
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
        center={[zone.latitude, zone.longitude]}
        zoom={15}
        style={{ height: 500, width: "100%" }}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
          id="mapbox/streets-v11"
        />
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
            p.latitude &&
            p.longitude && (
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
                    {p.status === "AVAILABLE" && (
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
