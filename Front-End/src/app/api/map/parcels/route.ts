import { prisma } from "@/lib/prisma";

export async function GET() {
  const parcels = await prisma.parcel.findMany({
    select: { id: true, reference: true, latitude: true, longitude: true, zoneId: true }
  });

  const features = parcels
    .filter(p => p.latitude !== null && p.longitude !== null)
    .map(p => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      properties: { id: p.id, reference: p.reference, zoneId: p.zoneId }
    }));

  return Response.json({ type: "FeatureCollection", features });
}
