import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!item) return new Response('Not Found', { status: 404 });
  return Response.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const item = await prisma.appointment.update({ where: { id: params.id }, data });
    return Response.json(item);
  } catch {
    return new Response('Invalid data', { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.appointment.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}
