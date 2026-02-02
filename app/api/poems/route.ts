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

export async function PUT(request: Request) {
  const { id, ...data } = await request.json();
  const poem = await prisma.poem.update({
    where: { id },
    data
  });
  return NextResponse.json(poem);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.poem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { updates } = await request.json();
  
  // Update each poem's order
  await Promise.all(
    updates.map((update: { id: string; order: number }) =>
      prisma.poem.update({
        where: { id: update.id },
        data: { order: update.order }
      })
    )
  );
  
  return NextResponse.json({ success: true });
}
