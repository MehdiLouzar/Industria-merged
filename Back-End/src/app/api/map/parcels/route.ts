import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { lambertToWGS84 } from "@/lib/coords";

export async function GET() {
  const parcels = await prisma.parcel.findMany({
    select: { id: true, reference: true, lambertX: true, lambertY: true, zoneId: true, isShowroom: true, status: true }
  });

  const features = parcels.map(p => {
    if (p.lambertX == null || p.lambertY == null) return null;
    const [lat, lon] = lambertToWGS84(p.lambertX, p.lambertY);
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: { id: p.id, reference: p.reference, zoneId: p.zoneId, isShowroom: p.isShowroom, status: p.status }
    };
  }).filter(Boolean);

  return applyCors(Response.json({ type: "FeatureCollection", features }));
}

export function OPTIONS() {
  return corsOptions();
}
