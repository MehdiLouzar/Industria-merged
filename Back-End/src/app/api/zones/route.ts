import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.zone.findMany({
    include: {
      parcels: { include: { vertices: true } },
      region: true,
      zoneType: true,
      vertices: true,
    },
  });
  return Response.json(zones);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { vertices, ...zoneData } = data;
    const zone = await prisma.zone.create({
      data: {
        ...zoneData,
        vertices: vertices && Array.isArray(vertices)
          ? { createMany: { data: vertices } }
          : undefined,
      },
      include: { vertices: true },
    });
    return Response.json(zone, { status: 201 });
  } catch (error) {
    return new Response('Invalid data', { status: 400 });
  }
}
