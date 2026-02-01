import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";


// Neon connection string (should be moved to env for production)
const adapter = new PrismaNeonHttp(
  "postgresql://neondb_owner:npg_mNVHyc8gDK0A@ep-broad-hill-ahkxh63b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  {}
);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
