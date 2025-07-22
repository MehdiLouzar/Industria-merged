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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const zone = await prisma.zone.create({ data });
    return Response.json(zone, { status: 201 });
  } catch (error) {
    return new Response('Invalid data', { status: 400 });
  }
}
