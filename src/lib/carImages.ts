import crypto from 'crypto';
import sharp from 'sharp';

import {
  CarImageConstraintError,
  MAX_IMAGE_BYTES,
  MEDIUM_MAX_HEIGHT,
  MEDIUM_MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
  THUMB_HEIGHT,
  THUMB_WIDTH,
  isAllowedImageType,
} from '@/lib/carImageConstraints';

export type ProcessedImageVariant = {
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  metadata: Record<string, unknown>;
};

export function sha256Hex(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function getFileExtFromContentType(contentType: string) {
  if (contentType === 'image/jpeg') return 'jpg';
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'bin';
}

export async function processCarImage(input: Buffer, contentType: string) {
  if (!isAllowedImageType(contentType)) {
    throw new CarImageConstraintError('Unsupported image type. Only JPEG, PNG, and WebP are allowed.');
  }
  if (input.byteLength > MAX_IMAGE_BYTES) {
    throw new CarImageConstraintError('Image too large. Max 10MB per image.');
  }

  const base = sharp(input, { failOnError: true });
  const meta = await base.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    throw new CarImageConstraintError(`Image resolution too small. Minimum ${MIN_WIDTH}x${MIN_HEIGHT}px.`);
  }

  const thumb = await base
    .clone()
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const medium = await base
    .clone()
    .resize(MEDIUM_MAX_WIDTH, MEDIUM_MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const metadata: Record<string, unknown> = {
    format: meta.format,
    orientation: meta.orientation,
    hasAlpha: meta.hasAlpha,
    density: meta.density,
    space: meta.space,
  };

  const originalSha = sha256Hex(input);

  return {
    original: {
      buffer: input,
      contentType,
      width,
      height,
      bytes: input.byteLength,
      sha256: originalSha,
      metadata,
    },
    medium: {
      buffer: medium,
      contentType: 'image/webp',
      width: Math.min(width, MEDIUM_MAX_WIDTH),
      height: Math.min(height, MEDIUM_MAX_HEIGHT),
      bytes: medium.byteLength,
      sha256: sha256Hex(medium),
      metadata,
    },
    thumb: {
      buffer: thumb,
      contentType: 'image/webp',
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
      bytes: thumb.byteLength,
      sha256: sha256Hex(thumb),
      metadata,
    },
  };
}

