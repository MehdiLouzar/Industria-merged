import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const zones = await prisma.zone.findMany({
    include: {
      parcels: { include: { vertices: true } },
      region: true,
      zoneType: true,
      activities: { include: { activity: true } },
      amenities: { include: { amenity: true } },
      vertices: true,
    },
  });
  return Response.json(zones);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { vertices, activityIds, amenityIds, ...zoneData } = data;

    const zone = await prisma.zone.create({
      data: {
        ...zoneData,
        vertices: Array.isArray(vertices)
          ? { createMany: { data: vertices } }
          : undefined,
      },
    });

    if (Array.isArray(activityIds)) {
      await prisma.zoneActivity.createMany({
        data: activityIds.map((id: string) => ({
          id: crypto.randomUUID(),
          zoneId: zone.id,
          activityId: id,
        })),
      });
    }

    if (Array.isArray(amenityIds)) {
      await prisma.zoneAmenity.createMany({
        data: amenityIds.map((id: string) => ({
          id: crypto.randomUUID(),
          zoneId: zone.id,
          amenityId: id,
        })),
      });
    }

    const full = await prisma.zone.findUnique({
      where: { id: zone.id },
      include: {
        parcels: { include: { vertices: true } },
        region: true,
        zoneType: true,
        activities: { include: { activity: true } },
        amenities: { include: { amenity: true } },
        vertices: true,
      },
    });

    return Response.json(full, { status: 201 });
  } catch (error) {
    return new Response('Invalid data', { status: 400 });
  }
}
