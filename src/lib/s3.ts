import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate required environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    ...(process.env.AWS_SESSION_TOKEN && {
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    const result = await s3Client.send(command);
    console.log(`File uploaded to S3: ${key}`);
    return result;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(
      `Failed to upload file to S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`Generated signed URL for: ${key}`);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(
      `Failed to generate signed URL: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const result = await s3Client.send(command);
    console.log(`File deleted from S3: ${key}`);
    return result;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error(
      `Failed to delete file from S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: BUCKET_NAME,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export { s3Client, BUCKET_NAME };
