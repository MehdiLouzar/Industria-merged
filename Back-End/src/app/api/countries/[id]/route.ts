import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.country.findUnique({ where: { id: params.id } });
  if (!item) return applyCors(new Response('Not Found', { status: 404 }));
  return applyCors(Response.json(item));
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const item = await prisma.country.update({ where: { id: params.id }, data });
    return applyCors(Response.json(item));
  } catch {
    return applyCors(new Response('Invalid data', { status: 400 }));
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.country.delete({ where: { id: params.id } });
    return applyCors(new Response(null, { status: 204 }));
  } catch {
    return applyCors(new Response('Not Found', { status: 404 }));
  }
}

export function OPTIONS() {
  return corsOptions();
}
