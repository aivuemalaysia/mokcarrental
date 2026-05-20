export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const ALLOWED_IMAGE_TYPE_SET = new Set<string>(ALLOWED_IMAGE_TYPES);
export const ACCEPT_IMAGE_ATTR = ALLOWED_IMAGE_TYPES.join(',');

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MIN_WIDTH = 800;
export const MIN_HEIGHT = 600;

export const THUMB_WIDTH = 200;
export const THUMB_HEIGHT = 200;
export const MEDIUM_MAX_WIDTH = 1024;
export const MEDIUM_MAX_HEIGHT = 768;

export const DEFAULT_MIN_IMAGES_PER_CAR = 3;
export const DEFAULT_MAX_FILES_PER_UPLOAD = 10;

export const CAR_IMAGE_REQUIREMENTS_SHORT = 'JPEG/PNG/WebP only. Max 10MB each. Minimum 800×600.';

export class CarImageConstraintError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CarImageConstraintError';
    this.status = status;
  }
}

export function isAllowedImageType(type: string): type is AllowedImageType {
  return ALLOWED_IMAGE_TYPE_SET.has(type);
}

