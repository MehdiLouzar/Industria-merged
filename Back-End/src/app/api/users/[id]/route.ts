import { applyCors, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, name: true, role: true, isActive: true } });
  if (!item) return applyCors(new Response('Not Found', { status: 404 }));
  return applyCors(Response.json(item));
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const item = await prisma.user.update({ where: { id: params.id }, data });
    return applyCors(Response.json({ id: item.id, email: item.email, name: item.name, role: item.role, isActive: item.isActive }));
  } catch {
    return applyCors(new Response('Invalid data', { status: 400 }));
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return applyCors(new Response(null, { status: 204 }));
  } catch {
    return applyCors(new Response('Not Found', { status: 404 }));
  }
}

export function OPTIONS() {
  return corsOptions();
}
