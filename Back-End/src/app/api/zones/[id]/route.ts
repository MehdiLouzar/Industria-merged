import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const zone = await prisma.zone.findUnique({
    where: { id: params.id },
    include: {
      parcels: true,
      region: true,
      zoneType: true,
      activities: { include: { activity: true } },
      amenities: { include: { amenity: true } },
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
    const zone = await prisma.zone.update({ where: { id: params.id }, data });
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
