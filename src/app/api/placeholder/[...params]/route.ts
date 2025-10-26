import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    const pathParts = params.params;
    if (!pathParts || pathParts.length < 2) {
      return new NextResponse('Invalid parameters', { status: 400 });
    }
    
    const [width, height] = pathParts;
    const widthNum = parseInt(width) || 400;
    const heightNum = parseInt(height) || 300;
    
    // Create a simple SVG placeholder
    const svg = `<svg width="${widthNum}" height="${heightNum}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
    ${widthNum} × ${heightNum}
  </text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Placeholder generation error:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}
