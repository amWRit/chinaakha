import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const poems = await prisma.poem.findMany({
    orderBy: { order: 'asc' },
    include: { image: true },
  });
  return NextResponse.json(poems);
}

export async function POST(request: Request) {
  const data = await request.json();
  const poem = await prisma.poem.create({ data });
  return NextResponse.json(poem);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.poem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
