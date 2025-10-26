import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { healthCheck } from '@/lib/s3';

export async function GET() {
  try {
    // Check database connection
    const dbHealth = await prisma.$queryRaw`SELECT 1`;
    
    // Check S3 connection
    const s3Health = await healthCheck();
    
    const isHealthy = !!dbHealth && s3Health;
    
    return NextResponse.json({
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: !!dbHealth,
        s3: s3Health,
      },
      environment: process.env.NODE_ENV || 'development',
    }, { 
      status: isHealthy ? 200 : 503 
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: false,
        s3: false,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
