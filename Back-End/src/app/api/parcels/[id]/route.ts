import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.parcel.findUnique({
    where: { id: params.id },
    include: { vertices: true },
  });
  if (!item) return new Response('Not Found', { status: 404 });
  return Response.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { vertices, ...parcelData } = data;
    await prisma.parcel.update({ where: { id: params.id }, data: parcelData });
    if (Array.isArray(vertices)) {
      await prisma.parcelVertex.deleteMany({ where: { parcelId: params.id } });
      await prisma.parcelVertex.createMany({
        data: vertices.map((v: any) => ({ ...v, parcelId: params.id })),
      });
    }
    const item = await prisma.parcel.findUnique({
      where: { id: params.id },
      include: { vertices: true },
    });
    return Response.json(item);
  } catch {
    return new Response('Invalid data', { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.parcel.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
