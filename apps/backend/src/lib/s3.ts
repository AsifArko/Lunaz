/**
 * S3/MinIO upload service for image storage.
 * Uploads files to S3-compatible storage (MinIO, AWS S3) and returns public URLs.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import type { BackendEnv } from '@lunaz/config';

let s3Client: S3Client | null = null;
let config: BackendEnv | null = null;

function isS3Configured(cfg: BackendEnv): boolean {
  return Boolean(
    cfg.S3_BUCKET && cfg.S3_REGION && cfg.AWS_ACCESS_KEY_ID && cfg.AWS_SECRET_ACCESS_KEY
  );
}

function getS3Client(cfg: BackendEnv): S3Client | null {
  if (!isS3Configured(cfg)) return null;

  if (!s3Client || config !== cfg) {
    config = cfg;
    s3Client = new S3Client({
      region: cfg.S3_REGION!,
      endpoint: cfg.S3_ENDPOINT,
      credentials: {
        accessKeyId: cfg.AWS_ACCESS_KEY_ID!,
        secretAccessKey: cfg.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  return s3Client;
}

/**
 * Get the public URL for an object in S3/MinIO.
 * Uses S3_PUBLIC_URL when set (required for MinIO), otherwise derives from S3.
 */
function getPublicUrl(cfg: BackendEnv, key: string): string {
  const bucket = cfg.S3_BUCKET!;

  if (cfg.S3_PUBLIC_URL) {
    // MinIO: http://localhost:9000/bucket/key
    return `${cfg.S3_PUBLIC_URL.replace(/\/$/, '')}/${bucket}/${key}`;
  }

  if (cfg.S3_ENDPOINT) {
    // Custom endpoint without S3_PUBLIC_URL - use endpoint as base
    const base = cfg.S3_ENDPOINT.replace(/\/$/, '');
    return `${base}/${bucket}/${key}`;
  }

  // AWS S3 default
  const region = cfg.S3_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a buffer to S3/MinIO.
 * @param cfg - Backend config
 * @param buffer - File buffer
 * @param contentType - MIME type (e.g. image/jpeg)
 * @param prefix - Path prefix (e.g. 'products', 'categories')
 * @param entityId - Entity ID for path (e.g. productId, categoryId)
 * @returns Upload result with key and public URL, or null if S3 not configured
 */
export async function uploadToS3(
  cfg: BackendEnv,
  buffer: Buffer,
  contentType: string,
  prefix: string,
  entityId: string
): Promise<UploadResult | null> {
  const client = getS3Client(cfg);
  if (!client) return null;

  const ext = contentType.split('/')[1] || 'jpg';
  const key = `${prefix}/${entityId}/${randomUUID()}.${ext}`;

  const params: PutObjectCommandInput = {
    Bucket: cfg.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await client.send(new PutObjectCommand(params));

  return {
    key,
    url: getPublicUrl(cfg, key),
  };
}

/**
 * Delete an object from S3/MinIO by key.
 * @param cfg - Backend config
 * @param key - Object key (from uploadToS3 result)
 */
export async function deleteFromS3(cfg: BackendEnv, key: string): Promise<void> {
  const client = getS3Client(cfg);
  if (!client) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: cfg.S3_BUCKET!,
      Key: key,
    })
  );
}

/**
 * Extract S3 key from a URL previously returned by uploadToS3.
 * Returns null if URL is not an S3 URL (e.g. data URL).
 */
export function extractKeyFromUrl(cfg: BackendEnv, url: string): string | null {
  if (url.startsWith('data:')) return null;

  const bucket = cfg.S3_BUCKET!;
  const patterns = [
    cfg.S3_PUBLIC_URL && `${cfg.S3_PUBLIC_URL.replace(/\/$/, '')}/${bucket}/`,
    cfg.S3_ENDPOINT && `${cfg.S3_ENDPOINT.replace(/\/$/, '')}/${bucket}/`,
    `https://${bucket}.s3.${cfg.S3_REGION || 'us-east-1'}.amazonaws.com/`,
    `http://${bucket}.s3.${cfg.S3_REGION || 'us-east-1'}.amazonaws.com/`,
  ].filter(Boolean) as string[];

  for (const base of patterns) {
    if (url.startsWith(base)) {
      return decodeURIComponent(url.slice(base.length));
    }
  }

  return null;
}
