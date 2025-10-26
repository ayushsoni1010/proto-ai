import { NextRequest, NextResponse } from 'next/server';

// Mock images data - in a real app, this would come from the database
const mockImages = [
  {
    id: 'img_1',
    filename: 'sample-1.jpg',
    originalName: 'sample-image-1.jpg',
    mimeType: 'image/jpeg',
    size: 2048576, // 2MB
    width: 1920,
    height: 1080,
    status: 'VALIDATED',
    blurScore: 150.5,
    faceCount: 1,
    faceSize: 0.15,
    downloadUrl: '/api/placeholder?w=1920&h=1080',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'img_2',
    filename: 'sample-2.png',
    originalName: 'sample-image-2.png',
    mimeType: 'image/png',
    size: 1536000, // 1.5MB
    width: 1280,
    height: 720,
    status: 'VALIDATED',
    blurScore: 200.3,
    faceCount: 1,
    faceSize: 0.12,
    downloadUrl: '/api/placeholder?w=1280&h=720',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Mock filtering
    let filteredImages = mockImages;
    if (status) {
      filteredImages = mockImages.filter(img => img.status === status);
    }

    // Mock pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    return NextResponse.json({
      images: paginatedImages,
      pagination: {
        page,
        limit,
        total: filteredImages.length,
        pages: Math.ceil(filteredImages.length / limit),
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

    // Mock deletion - in a real app, this would delete from database and S3
    const imageIndex = mockImages.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    mockImages.splice(imageIndex, 1);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}