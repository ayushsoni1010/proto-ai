import sharp from 'sharp';
import crypto from 'crypto';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
    blurScore?: number;
    faceCount?: number;
    faceSize?: number;
    hash?: string;
  };
}

export async function validateImage(buffer: Buffer): Promise<ValidationResult> {
  const errors: string[] = [];
  let metadata: any = {};

  try {
    // Get image metadata
    const imageInfo = await sharp(buffer).metadata();
    metadata = {
      width: imageInfo.width || 0,
      height: imageInfo.height || 0,
      size: buffer.length,
      format: imageInfo.format || 'unknown',
    };

    // 1. Check minimum size/resolution
    const minWidth = parseInt(process.env.MIN_IMAGE_WIDTH || '300');
    const minHeight = parseInt(process.env.MIN_IMAGE_HEIGHT || '300');
    
    if (metadata.width < minWidth || metadata.height < minHeight) {
      errors.push(`Image too small. Minimum size: ${minWidth}x${minHeight}, got: ${metadata.width}x${metadata.height}`);
    }

    // 2. Check maximum size/resolution
    const maxWidth = parseInt(process.env.MAX_IMAGE_WIDTH || '4000');
    const maxHeight = parseInt(process.env.MAX_IMAGE_HEIGHT || '4000');
    
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      errors.push(`Image too large. Maximum size: ${maxWidth}x${maxHeight}, got: ${metadata.width}x${metadata.height}`);
    }

    // 3. Check file format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'heic'];
    if (!allowedFormats.includes(metadata.format.toLowerCase())) {
      errors.push(`Invalid format. Allowed: ${allowedFormats.join(', ')}, got: ${metadata.format}`);
    }

    // 4. Check file size
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
    if (metadata.size > maxFileSize) {
      errors.push(`File too large. Maximum size: ${maxFileSize} bytes, got: ${metadata.size}`);
    }

    // 5. Check for blur using Laplacian variance
    const blurScore = await calculateBlurScore(buffer);
    metadata.blurScore = blurScore;
    
    if (blurScore < 100) { // Threshold for blur detection
      errors.push(`Image appears to be blurry (blur score: ${blurScore.toFixed(2)})`);
    }

    // 6. Face detection using AWS Rekognition
    const faceData = await detectFaces(buffer);
    metadata.faceCount = faceData.faceCount;
    metadata.faceSize = faceData.faceSize;

    if (faceData.faceCount === 0) {
      errors.push('No face detected in the image');
    } else if (faceData.faceCount > 1) {
      errors.push(`Multiple faces detected (${faceData.faceCount}). Only one face allowed.`);
    } else if (faceData.faceSize < 0.1) { // Face should be at least 10% of image
      errors.push(`Face too small relative to image (${(faceData.faceSize * 100).toFixed(1)}%)`);
    }

    // 7. Generate hash for duplicate detection
    metadata.hash = generateImageHash(buffer);

    return {
      isValid: errors.length === 0,
      errors,
      metadata,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Image processing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      metadata,
    };
  }
}

async function calculateBlurScore(buffer: Buffer): Promise<number> {
  try {
    // Convert to grayscale and apply Laplacian filter
    const grayscale = await sharp(buffer)
      .grayscale()
      .raw()
      .toBuffer();

    const width = (await sharp(buffer).metadata()).width || 0;
    const height = (await sharp(buffer).metadata()).height || 0;
    
    let variance = 0;
    let mean = 0;
    let count = 0;

    // Calculate Laplacian variance
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian = 
          grayscale[idx - width] + 
          grayscale[idx + width] + 
          grayscale[idx - 1] + 
          grayscale[idx + 1] - 
          4 * grayscale[idx];
        
        mean += laplacian;
        count++;
      }
    }
    
    mean /= count;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian = 
          grayscale[idx - width] + 
          grayscale[idx + width] + 
          grayscale[idx - 1] + 
          grayscale[idx + 1] - 
          4 * grayscale[idx];
        
        variance += Math.pow(laplacian - mean, 2);
      }
    }
    
    return variance / count;
  } catch (error) {
    console.error('Error calculating blur score:', error);
    return 0;
  }
}

async function detectFaces(buffer: Buffer): Promise<{ faceCount: number; faceSize: number }> {
  try {
    const command = new DetectFacesCommand({
      Image: {
        Bytes: buffer,
      },
      Attributes: ['ALL'],
    });

    const response = await rekognitionClient.send(command);
    const faces = response.FaceDetails || [];
    
    let maxFaceSize = 0;
    for (const face of faces) {
      if (face.BoundingBox) {
        const faceSize = (face.BoundingBox.Width || 0) * (face.BoundingBox.Height || 0);
        maxFaceSize = Math.max(maxFaceSize, faceSize);
      }
    }

    return {
      faceCount: faces.length,
      faceSize: maxFaceSize,
    };
  } catch (error) {
    console.error('Error detecting faces:', error);
    return { faceCount: 0, faceSize: 0 };
  }
}

function generateImageHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function checkForDuplicates(hash: string): Promise<boolean> {
  const { prisma } = await import('./db');
  
  const existingImage = await prisma.image.findFirst({
    where: { hash },
  });
  
  return !!existingImage;
}

export async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to convert HEIC to JPEG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
