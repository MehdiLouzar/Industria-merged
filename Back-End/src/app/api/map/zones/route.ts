import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      status: true,
      parcels: { select: { status: true, isFree: true } },
      activities: { select: { activity: { select: { icon: true } } } },
    },
  });

  const features = zones
    .filter(z => z.latitude !== null && z.longitude !== null)
    .map(z => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [z.longitude, z.latitude] },
      properties: {
        id: z.id,
        name: z.name,
        status: z.status,
        availableParcels: z.parcels.filter(p => p.status === 'AVAILABLE' && p.isFree).length,
        activityIcons: z.activities.map(a => a.activity.icon).filter(Boolean),
      }
    }));

  return applyCors(Response.json({ type: "FeatureCollection", features }));
}

export function OPTIONS() {
  return corsOptions();
}
