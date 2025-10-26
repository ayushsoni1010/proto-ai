import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          width: true,
          height: true,
          status: true,
          blurScore: true,
          faceCount: true,
          faceSize: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.image.count({ where }),
    ]);

    // Generate signed URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const downloadUrl = await getSignedDownloadUrl(`images/${image.filename}`);
        return {
          ...image,
          downloadUrl,
        };
      })
    );

    return NextResponse.json({
      images: imagesWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({
      error: 'Failed to fetch images',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from S3
    const { deleteFromS3 } = await import('@/lib/s3');
    await deleteFromS3(image.s3Key);

    // Delete from database
    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
