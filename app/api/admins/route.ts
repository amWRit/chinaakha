
import { NextResponse } from 'next/server';
import { verifyPassword, createSession, getSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authenticated = await getSession();
  let response;
  if (!authenticated) {
    response = NextResponse.json({ authenticated });
    response.headers.set('x-admin-authenticated', 'false');
    return response;
  } else {
    // Return array of admins for AccountTab
    const admins = await prisma.admin.findMany({ select: { id: true, email: true } });
    response = NextResponse.json(admins);
    response.headers.set('x-admin-authenticated', 'true');
    return response;
  }
}

export async function POST(request: Request) {
  const { email, password } = await request.json();
  // If request is from AccountTab (add admin), create new admin
  // If request is from login, verify credentials and create session
  if (request.headers.get("x-add-admin") === "true") {
    // Add admin (no session required, but you may want to check session in production)
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    // Hash password before saving
    const hashed = await hashPassword(password);
    const admin = await prisma.admin.create({ data: { email, password: hashed } });
    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } else {
    // Login flow
    const valid = await verifyPassword(email, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    await createSession();
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
