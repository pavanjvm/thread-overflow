import crypto from 'node:crypto';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { env } from '../config/env.ts';

const s3Client = new S3Client({
  region: env.objectStorageRegion,
  endpoint: env.objectStorageEndpoint,
  forcePathStyle: env.objectStorageForcePathStyle,
  credentials: {
    accessKeyId: env.objectStorageAccessKeyId,
    secretAccessKey: env.objectStorageSecretAccessKey,
  },
});

function getContentTypeFromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,/);
  return match?.[1] || 'application/octet-stream';
}

function getExtensionFromContentType(contentType: string) {
  if (contentType === 'image/png') {
    return 'png';
  }

  if (contentType === 'image/jpeg') {
    return 'jpg';
  }

  if (contentType === 'image/webp') {
    return 'webp';
  }

  return 'bin';
}

function parseDataUrl(dataUrl: string) {
  const [, encoded = ''] = dataUrl.split(',');
  const contentType = getContentTypeFromDataUrl(dataUrl);

  return {
    buffer: Buffer.from(encoded, 'base64'),
    contentType,
  };
}

export interface StoredObject {
  key: string;
  url: string;
}

export async function uploadImageDataUrl(dataUrl: string, folder: string): Promise<StoredObject> {
  const { buffer, contentType } = parseDataUrl(dataUrl);
  const extension = getExtensionFromContentType(contentType);
  const key = `${folder}/${crypto.randomUUID()}.${extension}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: env.objectStorageBucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return {
    key,
    url: `${env.objectStoragePublicUrl}/${env.objectStorageBucket}/${key}`,
  };
}

export async function deleteStoredObject(key: string) {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: env.objectStorageBucket,
    Key: key,
  }));
}
