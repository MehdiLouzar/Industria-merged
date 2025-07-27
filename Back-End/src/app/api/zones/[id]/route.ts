import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { addLatLonToZone } from "@/lib/coords";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const zone = await prisma.zone.findUnique({
    where: { id: params.id },
    include: {
      parcels: { include: { vertices: true } },
      region: true,
      zoneType: true,
      activities: { include: { activity: true } },
      amenities: { include: { amenity: true } },
      vertices: true,
    },
  });

  if (!zone) {
    return applyCors(new Response("Not Found", { status: 404 }));
  }

  return applyCors(Response.json(addLatLonToZone(zone)));
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const { vertices, activityIds, amenityIds, ...zoneData } = data;

    await prisma.zone.update({ where: { id: params.id }, data: zoneData });

    if (Array.isArray(vertices)) {
      await prisma.zoneVertex.deleteMany({ where: { zoneId: params.id } });
      await prisma.zoneVertex.createMany({
        data: vertices.map((v: any) => ({ ...v, zoneId: params.id })),
      });
    }

    if (Array.isArray(activityIds)) {
      await prisma.zoneActivity.deleteMany({ where: { zoneId: params.id } });
      await prisma.zoneActivity.createMany({
        data: activityIds.map((id: string) => ({
          id: crypto.randomUUID(),
          zoneId: params.id,
          activityId: id,
        })),
      });
    }

    if (Array.isArray(amenityIds)) {
      await prisma.zoneAmenity.deleteMany({ where: { zoneId: params.id } });
      await prisma.zoneAmenity.createMany({
        data: amenityIds.map((id: string) => ({
          id: crypto.randomUUID(),
          zoneId: params.id,
          amenityId: id,
        })),
      });
    }

    const zone = await prisma.zone.findUnique({
      where: { id: params.id },
      include: {
        vertices: true,
        parcels: { include: { vertices: true } },
        activities: { include: { activity: true } },
        amenities: { include: { amenity: true } },
        region: true,
        zoneType: true,
      },
    });
    return applyCors(Response.json(addLatLonToZone(zone!)));
  } catch (error) {
    return applyCors(new Response('Invalid data', { status: 400 }));
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.zone.delete({ where: { id: params.id } });
    return applyCors(new Response(null, { status: 204 }));
  } catch (error) {
    return applyCors(new Response('Not Found', { status: 404 }));
  }
}

export function OPTIONS() {
  return corsOptions();
}
