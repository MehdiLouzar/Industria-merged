import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.zone.findMany({
    include: {
      parcels: true,
      region: true,
      zoneType: true,
    },
  });
  return Response.json(zones);
}
