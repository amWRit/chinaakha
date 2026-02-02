import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import * as fs from 'fs/promises';

const adapter = new PrismaNeonHttp(
  'postgresql://neondb_owner:npg_mNVHyc8gDK0A@ep-broad-hill-ahkxh63b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  {}
);

const prisma = new PrismaClient({ adapter });

// npx tsx prisma/seed.ts

async function main() {
  // 1. Seed text poems from poems.txt
  const poemsTxt = await fs.readFile('./prisma/poems.txt', 'utf8');
  const textPoems = poemsTxt.split(/--/).map(p => p.trim()).filter(Boolean);
  for (const [order, content] of textPoems.entries()) {
    const title = content.split('\n')[0] || `Poem ${order + 1}`;
    await prisma.poem.create({
      data: {
        title,
        content,
        type: 'TEXT',
        order,
      },
    });
  }

  // 2. Seed image poems with provided Google Drive fileIds
  const gdriveFileIds = [
    '1j-0BhX3Qy_KDn1tPfyzPXbhvgVQEH2-X',
    '1ehGIdZYGQyj5gsOVssfqzg0ciTh6gugB',
    '1UVW5_noKPs1-053JrM32Ml2hUI7-2eol',
    '1_hkMkahAvI52RxxEmu8XhBY0DxM9fVWK',
    '1UVR0C6D-e7DGmteeYcbc2wLkMB7PX1gj'
  ];
  for (let i = 0; i < gdriveFileIds.length; i++) {
    const image = await prisma.gDriveImageResource.create({
      data: {
        fileId: gdriveFileIds[i],
      },
    });
    await prisma.poem.create({
      data: {
        title: `Image ${i + 1}`,
        type: 'IMAGE',
        imageId: image.id,
        order: textPoems.length + i,
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
