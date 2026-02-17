import type { Id } from '../../types/id';
import type { CategoryImage } from './CategoryImage';

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
