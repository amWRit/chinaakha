import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const admins = await prisma.admin.findMany();
  return NextResponse.json(admins);
}

export async function POST(request: Request) {
  const data = await request.json();
  const admin = await prisma.admin.create({ data });
  return NextResponse.json(admin);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
