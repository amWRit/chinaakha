import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  // For demo: return admin info (implement JWT/session in production)
  return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
}
