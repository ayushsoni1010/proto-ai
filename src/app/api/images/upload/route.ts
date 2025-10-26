import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadToS3, getSignedDownloadUrl } from '@/lib/s3';
import { validateImage, checkForDuplicates, convertHeicToJpeg } from '@/lib/image-validation';
import { z } from 'zod';
import sharp from 'sharp';

const uploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate input
    const validation = uploadSchema.safeParse({
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { filename, mimeType, size } = validation.data;

    // Convert HEIC to JPEG if needed
    let processedBuffer = buffer;
    let finalMimeType = mimeType;
    
    if (mimeType === 'image/heic' || filename.toLowerCase().endsWith('.heic')) {
      processedBuffer = await convertHeicToJpeg(buffer);
      finalMimeType = 'image/jpeg';
    }

    // Validate image
    const validationResult = await validateImage(processedBuffer);
    
    if (!validationResult.isValid) {
      return NextResponse.json({
        error: 'Image validation failed',
        details: validationResult.errors,
      }, { status: 400 });
    }

    // Check for duplicates
    if (validationResult.metadata?.hash) {
      const isDuplicate = await checkForDuplicates(validationResult.metadata.hash);
      if (isDuplicate) {
        return NextResponse.json({
          error: 'Duplicate image detected',
        }, { status: 400 });
      }
    }

    // Generate S3 key
    const timestamp = Date.now();
    const s3Key = `images/${timestamp}-${filename}`;

    // Upload to S3
    await uploadToS3(s3Key, processedBuffer, finalMimeType);

    // Get image dimensions
    const imageInfo = await sharp(processedBuffer).metadata();

    // Save to database
    const image = await prisma.image.create({
      data: {
        filename: `${timestamp}-${filename}`,
        originalName: filename,
        mimeType: finalMimeType,
        size: processedBuffer.length,
        width: imageInfo.width || 0,
        height: imageInfo.height || 0,
        s3Key,
        status: 'VALIDATED',
        hash: validationResult.metadata?.hash,
        blurScore: validationResult.metadata?.blurScore,
        faceCount: validationResult.metadata?.faceCount,
        faceSize: validationResult.metadata?.faceSize,
        validationResults: {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
        },
      },
    });

    // Generate signed URL for immediate access
    const downloadUrl = await getSignedDownloadUrl(s3Key);

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        width: image.width,
        height: image.height,
        status: image.status,
        downloadUrl,
        createdAt: image.createdAt,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
