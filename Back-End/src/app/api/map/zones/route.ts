import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { lambertToWGS84 } from "@/lib/coords";

export async function GET() {
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      lambertX: true,
      lambertY: true,
      status: true,
      parcels: { select: { status: true, isFree: true } },
      activities: { select: { activity: { select: { icon: true } } } },
      amenities: { select: { amenity: { select: { icon: true } } } },
      vertices: { select: { seq: true, lambertX: true, lambertY: true } },
    },
  });

  const features = zones.map(z => {
    const point = z.vertices.length
      ? [z.vertices[0].lambertX, z.vertices[0].lambertY]
      : [z.lambertX!, z.lambertY!];
    if (!point[0] || !point[1]) return null;
    const [lat, lon] = lambertToWGS84(point[0], point[1]);
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        id: z.id,
        name: z.name,
        status: z.status,
        availableParcels: z.parcels.filter(p => p.status === 'AVAILABLE' && p.isFree).length,
        activityIcons: z.activities.map(a => a.activity.icon).filter(Boolean),
        amenityIcons: z.amenities.map(a => a.amenity.icon).filter(Boolean),
      }
    };
  }).filter(Boolean);

  return applyCors(Response.json({ type: "FeatureCollection", features }));
}

export function OPTIONS() {
  return corsOptions();
}
