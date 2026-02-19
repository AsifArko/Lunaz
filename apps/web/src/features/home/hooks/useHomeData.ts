import { useState, useEffect } from 'react';
import type { Category, Product, PaginatedResponse } from 'types';
import { api } from '../../../api/client';

export interface GroupedCategory {
  parent: Category;
  children: Category[];
}

export function useHomeData() {
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api<PaginatedResponse<Category>>('/categories?limit=50'),
          api<PaginatedResponse<Product>>('/products?status=published&limit=8'),
        ]);

        const allCategories = catRes.data;
        const parentCategories = allCategories.filter((c) => !c.parentId);
        const grouped: GroupedCategory[] = parentCategories.map((parent) => ({
          parent,
          children: allCategories.filter((c) => c.parentId === parent.id),
        }));

        setGroupedCategories(grouped);
        setFeaturedProducts(prodRes.data);
      } catch {
        // Silently handle errors
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeParentDefault =
    groupedCategories.length > 0
      ? ([...groupedCategories].sort((a, b) => b.children.length - a.children.length)[0]?.parent
          .id ?? null)
      : null;

  return {
    groupedCategories,
    featuredProducts,
    isLoading,
    activeParentDefault,
  };
}
