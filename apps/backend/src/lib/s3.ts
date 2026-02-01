import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getConfig } from '../config/index.js';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = getConfig();
    s3Client = new S3Client({
      region: config.S3_REGION ?? 'us-east-1',
      ...(config.S3_ENDPOINT && {
        endpoint: config.S3_ENDPOINT,
        forcePathStyle: true, // Required for MinIO
      }),
      ...(config.AWS_ACCESS_KEY_ID &&
        config.AWS_SECRET_ACCESS_KEY && {
          credentials: {
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
          },
        }),
    });
  }
  return s3Client;
}

/**
 * Generate a unique S3 key for product images.
 */
export function generateImageKey(productId: string, ext: string): string {
  return `products/${productId}/${randomUUID()}.${ext}`;
}

/**
 * Upload a buffer to S3.
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const config = getConfig();
  const bucket = config.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  // Return the public URL
  if (config.S3_ENDPOINT) {
    // MinIO or custom endpoint
    return `${config.S3_ENDPOINT}/${bucket}/${key}`;
  }
  // AWS S3
  return `https://${bucket}.s3.${config.S3_REGION ?? 'us-east-1'}.amazonaws.com/${key}`;
}

/**
 * Delete an object from S3.
 */
export async function deleteFromS3(key: string): Promise<void> {
  const config = getConfig();
  const bucket = config.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Get presigned URL for upload (optional: client-side upload).
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const config = getConfig();
  const bucket = config.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Extract S3 key from URL.
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // Handle both path-style and virtual-hosted URLs
    const path = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    // If path-style (e.g., MinIO), first segment is bucket
    const config = getConfig();
    if (config.S3_ENDPOINT && path.startsWith(`${config.S3_BUCKET}/`)) {
      return path.slice(`${config.S3_BUCKET}/`.length);
    }
    return path;
  } catch {
    return null;
  }
}
