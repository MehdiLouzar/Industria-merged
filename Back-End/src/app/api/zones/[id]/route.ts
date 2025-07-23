import { prisma } from "@/lib/prisma";

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
    return new Response("Not Found", { status: 404 });
  }

  return Response.json(zone);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const { vertices, ...zoneData } = data;

    await prisma.zone.update({ where: { id: params.id }, data: zoneData });

    if (Array.isArray(vertices)) {
      await prisma.zoneVertex.deleteMany({ where: { zoneId: params.id } });
      await prisma.zoneVertex.createMany({
        data: vertices.map((v: any) => ({ ...v, zoneId: params.id })),
      });
    }

    const zone = await prisma.zone.findUnique({
      where: { id: params.id },
      include: { vertices: true, parcels: { include: { vertices: true } } },
    });

    return Response.json(zone);
  } catch (error) {
    return new Response('Invalid data', { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.zone.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Not Found', { status: 404 });
  }
}
