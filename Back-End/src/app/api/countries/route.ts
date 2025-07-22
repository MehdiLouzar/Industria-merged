import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.country.findMany();
  return Response.json(items);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const item = await prisma.country.create({ data });
    return Response.json(item, { status: 201 });
  } catch {
    return new Response('Invalid data', { status: 400 });
  }
}
