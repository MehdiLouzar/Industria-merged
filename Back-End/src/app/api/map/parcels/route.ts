import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { lambertToWGS84, polygonCentroid } from "@/lib/coords";

export async function GET() {
  const parcels = await prisma.parcel.findMany({
    select: {
      id: true,
      reference: true,
      lambertX: true,
      lambertY: true,
      zoneId: true,
      isShowroom: true,
      status: true,
      vertices: { select: { seq: true, lambertX: true, lambertY: true } },
    },
  });

  const features = parcels
    .map((p) => {
      let point: [number, number] | null = null;
      if (p.vertices.length) {
        const verts = p.vertices.sort((a, b) => a.seq - b.seq);
        const c = polygonCentroid(verts);
        if (c) point = c;
      }
      if (!point && p.lambertX != null && p.lambertY != null) {
        point = [p.lambertX, p.lambertY];
      }
      if (!point) return null;
      const [lat, lon] = lambertToWGS84(point[0], point[1]);
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {
          id: p.id,
          reference: p.reference,
          zoneId: p.zoneId,
          isShowroom: p.isShowroom,
          status: p.status,
        },
      };
    })
    .filter(Boolean);

  return applyCors(Response.json({ type: "FeatureCollection", features }));
}

export function OPTIONS() {
  return corsOptions();
}
