import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToS3, getSignedDownloadUrl } from "@/lib/s3";
import {
  validateImage,
  checkForDuplicates,
  convertHeicToJpeg,
} from "@/lib/image-validation";
import { z } from "zod";
import sharp from "sharp";
import crypto from "crypto";

const chunkUploadSchema = z.object({
  sessionId: z.string().optional(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  totalChunks: z.number().positive(),
  chunkIndex: z.number().min(0),
  chunkData: z.string(), // Base64 encoded chunk
});

// In-memory storage for chunks (in production, use Redis or database)
const chunkStorage = new Map<string, Buffer[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = chunkUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      sessionId,
      filename,
      mimeType,
      totalChunks,
      chunkIndex,
      chunkData,
    } = validation.data;

    // Create or get session
    let session = sessionId
      ? await prisma.uploadSession.findUnique({
          where: { id: sessionId },
        })
      : null;

    if (!session) {
      session = await prisma.uploadSession.create({
        data: {
          filename,
          totalChunks,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    }

    // Decode and store chunk
    const chunkBuffer = Buffer.from(chunkData, "base64");

    if (!chunkStorage.has(session.id)) {
      chunkStorage.set(session.id, new Array(totalChunks));
    }

    const chunks = chunkStorage.get(session.id)!;
    chunks[chunkIndex] = chunkBuffer;

    // Update session progress
    await prisma.uploadSession.update({
      where: { id: session.id },
      data: {
        uploadedChunks: chunkIndex + 1,
      },
    });

    // Check if all chunks are uploaded
    const allChunksReceived = chunks.every((chunk) => chunk !== undefined);

    if (allChunksReceived) {
      try {
        // Combine all chunks
        const completeBuffer = Buffer.concat(chunks);

        // Convert HEIC to JPEG if needed
        let processedBuffer: Buffer = completeBuffer;
        let finalMimeType = mimeType;

        if (
          mimeType === "image/heic" ||
          filename.toLowerCase().endsWith(".heic")
        ) {
          processedBuffer = Buffer.from(
            await convertHeicToJpeg(completeBuffer)
          );
          finalMimeType = "image/jpeg";
        }

        // Validate image
        const validationResult = await validateImage(processedBuffer);

        if (!validationResult.isValid) {
          // Clean up session and chunks
          await prisma.uploadSession.update({
            where: { id: session.id },
            data: { status: "FAILED" },
          });
          chunkStorage.delete(session.id);

          return NextResponse.json(
            {
              error: "Image validation failed",
              details: validationResult.errors,
            },
            { status: 400 }
          );
        }

        // Check for duplicates
        if (validationResult.metadata?.hash) {
          const isDuplicate = await checkForDuplicates(
            validationResult.metadata.hash
          );
          if (isDuplicate) {
            await prisma.uploadSession.update({
              where: { id: session.id },
              data: { status: "FAILED" },
            });
            chunkStorage.delete(session.id);

            return NextResponse.json(
              {
                error: "Duplicate image detected",
              },
              { status: 400 }
            );
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
            status: "VALIDATED",
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

        // Update session as completed
        await prisma.uploadSession.update({
          where: { id: session.id },
          data: {
            status: "COMPLETED",
            s3Key,
          },
        });

        // Clean up chunks
        chunkStorage.delete(session.id);

        // Generate signed URL
        const downloadUrl = await getSignedDownloadUrl(s3Key);

        return NextResponse.json({
          success: true,
          completed: true,
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
        // Mark session as failed
        await prisma.uploadSession.update({
          where: { id: session.id },
          data: { status: "FAILED" },
        });
        chunkStorage.delete(session.id);

        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      completed: false,
      sessionId: session.id,
      progress: {
        uploaded: chunkIndex + 1,
        total: totalChunks,
        percentage: Math.round(((chunkIndex + 1) / totalChunks) * 100),
      },
    });
  } catch (error) {
    console.error("Chunked upload error:", error);
    return NextResponse.json(
      {
        error: "Chunked upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
