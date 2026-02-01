import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";




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
  cookieStore.set("admin-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-auth");
  return session?.value === "authenticated";
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
}
