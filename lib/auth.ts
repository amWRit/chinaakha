import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}




/**
 * Verify admin credentials against the Admin table in the database
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return false;
  }
  return bcrypt.compare(password, admin.password);
}

export async function createSession() {
  const cookieStore = await cookies();
  console.log('[createSession] Setting admin-auth cookie');
  cookieStore.set("admin-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-auth");
  console.log('[getSession] Cookie value:', session?.value);
  return session?.value === "authenticated";
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
}
