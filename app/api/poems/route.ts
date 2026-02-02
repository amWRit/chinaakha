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
  let poem;
  if (data.type === 'IMAGE') {
    // Support both new and existing image resource, but avoid nested create (no transaction)
    const { image, ...rest } = data;
    let imageId = undefined;
    if (image && typeof image === 'object') {
      if (typeof image.fileId === 'string' && !image.id) {
        // Prevent saving error messages as fileId
        if (!image.fileId.toLowerCase().includes('error')) {
          // Check if fileId already exists
          const existingImage = await prisma.gDriveImageResource.findUnique({
            where: { fileId: image.fileId }
          });
          
          if (existingImage) {
            return NextResponse.json(
              { error: 'This Google Drive image is already in use. Please use a different image.' },
              { status: 400 }
            );
          }
          
          const createdImage = await prisma.gDriveImageResource.create({
            data: { fileId: image.fileId },
          });
          imageId = createdImage.id;
        }
      } else if (typeof image.id === 'string') {
        imageId = image.id;
      }
    }
    const poemData: any = { ...rest };
    if (typeof imageId === 'string') {
      poemData.imageId = imageId;
    }
    poem = await prisma.poem.create({
      data: poemData,
    });
  } else {
    // TEXT poem
    const { image, imageId, ...rest } = data;
    poem = await prisma.poem.create({
      data: rest,
    });
  }
  return NextResponse.json(poem);
}


export async function PUT(request: Request) {
  const { id, ...data } = await request.json();
  let poem;
  if (data.type === 'IMAGE') {
    const { image, ...rest } = data;
    let imageData = undefined;
    if (image) {
      if (image.fileId && !image.id) {
        // Create new image resource
        imageData = { create: { fileId: image.fileId } };
      } else if (image.id) {
        // Connect to existing image resource
        imageData = { connect: { id: image.id } };
      } else if (image === null) {
        imageData = { disconnect: true };
      }
    }
    poem = await prisma.poem.update({
      where: { id },
      data: {
        ...rest,
        image: imageData,
      },
      include: { image: true },
    });
  } else {
    // TEXT poem
    poem = await prisma.poem.update({
      where: { id },
      data: {
        ...data,
        image: undefined,
        imageId: undefined,
      },
    });
  }
  return NextResponse.json(poem);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  
  // First, get the poem to check if it has an associated image
  const poem = await prisma.poem.findUnique({
    where: { id },
    select: { imageId: true, type: true }
  });
  
  // Delete the poem
  await prisma.poem.delete({ where: { id } });
  
  // If it was an IMAGE poem and had an imageId, delete the GDriveImageResource
  if (poem?.type === 'IMAGE' && poem.imageId) {
    await prisma.gDriveImageResource.delete({
      where: { id: poem.imageId }
    }).catch(() => {
      // Ignore errors if the image was already deleted
    });
  }
  
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
