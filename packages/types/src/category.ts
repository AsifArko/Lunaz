import type { Id } from './user.js';

/** Category entity. */
export interface Category {
  id: Id;
  name: string;
  slug: string;
  parentId?: Id | null;
  imageUrl?: string | null;
  order?: number;
  createdAt: string;
  updatedAt: string;
}
