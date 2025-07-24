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
    let point: [number, number] | null = null;
    if (z.vertices.length) {
      const sum = z.vertices.reduce(
        (acc, v) => [acc[0] + v.lambertX, acc[1] + v.lambertY],
        [0, 0]
      );
      point = [sum[0] / z.vertices.length, sum[1] / z.vertices.length];
    } else if (z.lambertX != null && z.lambertY != null) {
      point = [z.lambertX, z.lambertY];
    }
    if (!point) return null;
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
