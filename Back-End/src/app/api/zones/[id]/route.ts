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
