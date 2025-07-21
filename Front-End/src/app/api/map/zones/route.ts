import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.zone.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      status: true,
    },
  });

  const features = zones
    .filter(z => z.latitude !== null && z.longitude !== null)
    .map(z => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [z.longitude, z.latitude] },
      properties: { id: z.id, name: z.name, status: z.status }
    }));

  return Response.json({ type: "FeatureCollection", features });
}
