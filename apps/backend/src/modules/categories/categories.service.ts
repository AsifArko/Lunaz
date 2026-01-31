import mongoose from 'mongoose';
import { CategoryModel } from './categories.model.js';
import type { Category, CategoryWithChildren } from '@lunaz/types';

/**
 * Convert MongoDB document to Category type.
 */
export function toCategory(doc: Record<string, unknown>): Category {
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    name: doc.name as string,
    slug: doc.slug as string,
    parentId: doc.parentId ? (doc.parentId as mongoose.Types.ObjectId).toString() : null,
    imageUrl: (doc.imageUrl as string) ?? null,
    order: doc.order as number | undefined,
    createdAt: (doc.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (doc.updatedAt as Date)?.toISOString?.() ?? new Date().toISOString(),
  };
}

/**
 * Get all categories as a flat list.
 */
export async function getAllCategories(): Promise<Category[]> {
  const list = await CategoryModel.find().sort({ order: 1, name: 1 }).lean();
  return list.map(toCategory);
}

/**
 * Get category by ID or slug.
 */
export async function getCategoryByIdOrSlug(idOrSlug: string): Promise<Category | null> {
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };
  const doc = await CategoryModel.findOne(query).lean();
  return doc ? toCategory(doc) : null;
}

/**
 * Build category tree structure from flat list.
 */
export function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  // First pass: create map with children arrays
  for (const cat of categories) {
    categoryMap.set(cat.id, { ...cat, children: [] });
  }

  // Second pass: build tree structure
  for (const cat of categories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Get categories as nested tree.
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const categories = await getAllCategories();
  return buildCategoryTree(categories);
}

/**
 * Get children of a category.
 */
export async function getCategoryChildren(parentId: string): Promise<Category[]> {
  const list = await CategoryModel.find({ parentId }).sort({ order: 1, name: 1 }).lean();
  return list.map(toCategory);
}

/**
 * Check if deleting a category would orphan children.
 */
export async function hasChildren(categoryId: string): Promise<boolean> {
  const count = await CategoryModel.countDocuments({ parentId: categoryId });
  return count > 0;
}

/**
 * Create a new category.
 */
export async function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  order?: number;
}): Promise<Category> {
  const created = await CategoryModel.create(data);
  return toCategory(created.toObject());
}

/**
 * Update a category.
 */
export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    parentId: string | null;
    imageUrl: string | null;
    order: number;
  }>
): Promise<Category | null> {
  const doc = await CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  return doc ? toCategory(doc.toObject()) : null;
}

/**
 * Delete a category.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const deleted = await CategoryModel.findByIdAndDelete(id);
  return !!deleted;
}

/**
 * Category with counts for display.
 */
export interface CategoryWithCounts extends Category {
  childCount: number;
  productCount: number;
}

/**
 * Get all categories with child and product counts.
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  const { ProductModel } = await import('../products/products.model.js');
  const { ProductStatus } = await import('@lunaz/types');
  
  const categories = await getAllCategories();
  
  // Get child counts for each category
  const childCounts = await CategoryModel.aggregate([
    { $match: { parentId: { $ne: null } } },
    { $group: { _id: '$parentId', count: { $sum: 1 } } },
  ]);
  const childCountMap = new Map<string, number>(
    childCounts.map((c) => [c._id.toString(), c.count])
  );
  
  // Get product counts for each category (only published products)
  const productCounts = await ProductModel.aggregate([
    { $match: { status: ProductStatus.PUBLISHED } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const productCountMap = new Map<string, number>(
    productCounts.map((p) => [p._id.toString(), p.count])
  );
  
  // For parent categories, also count products in child categories
  const parentProductCounts = new Map<string, number>();
  for (const cat of categories) {
    if (!cat.parentId) {
      // This is a parent category - sum products from all children
      let totalProducts = productCountMap.get(cat.id) || 0;
      for (const child of categories) {
        if (child.parentId === cat.id) {
          totalProducts += productCountMap.get(child.id) || 0;
        }
      }
      parentProductCounts.set(cat.id, totalProducts);
    }
  }
  
  return categories.map((cat) => ({
    ...cat,
    childCount: childCountMap.get(cat.id) || 0,
    productCount: cat.parentId 
      ? (productCountMap.get(cat.id) || 0)
      : (parentProductCounts.get(cat.id) || 0),
  }));
}
