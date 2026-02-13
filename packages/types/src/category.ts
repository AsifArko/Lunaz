import type { Id } from './user.js';

/** Category image (URL from S3 or legacy base64 data URL). */
export interface CategoryImage {
  id: string;
  url: string;
  order: number;
}

/** Category entity. */
export interface Category {
  id: Id;
  name: string;
  slug: string;
  parentId?: Id | null;
  images: CategoryImage[];
  /** @deprecated Use images[0]?.url instead. Kept for backward compatibility. */
  imageUrl?: string | null;
  order?: number;
  createdAt: string;
  updatedAt: string;
}
