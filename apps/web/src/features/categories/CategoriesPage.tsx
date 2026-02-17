import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Category, PaginatedResponse } from '@lunaz/types';
import { Container } from '@/ui';
import { api } from '../../api/client';

interface CategoryWithCounts extends Category {
  childCount: number;
  productCount: number;
}

function CategoryCardSkeleton({ size = 'normal' }: { size?: 'normal' | 'small' }) {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-sm animate-pulse ${
        size === 'small' ? 'border border-slate-100' : ''
      }`}
    >
      <div className={size === 'small' ? 'aspect-[4/3]' : 'aspect-[4/3]'}>
        <div className="w-full h-full bg-slate-200" />
      </div>
      <div className={size === 'small' ? 'p-3' : 'p-4'}>
        <div
          className={`bg-slate-200 rounded ${
            size === 'small' ? 'h-4 w-2/3 mb-2' : 'h-5 w-3/4 mb-3'
          }`}
        />
        <div className="flex items-center gap-3">
          <div className="h-3 bg-slate-200 rounded w-12" />
          <div className="h-3 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function ParentCategoryCard({ category }: { category: CategoryWithCounts }) {
  const hasImage = !!category.imageUrl;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
        {hasImage ? (
          <img
            src={category.imageUrl!}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-5xl font-serif text-slate-300 group-hover:text-slate-400 transition-colors">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-medium text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1 mb-2">
          {category.name}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {/* Product Count */}
          <div className="flex items-center gap-1.5" title={`${category.productCount} products`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span className="text-slate-500">{category.productCount}</span>
          </div>

          {/* Subcategories Count */}
          {category.childCount > 0 && (
            <div
              className="flex items-center gap-1.5"
              title={`${category.childCount} subcategories`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <span className="text-slate-500">{category.childCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function ChildCategoryCard({
  category,
  parentName,
}: {
  category: CategoryWithCounts;
  parentName?: string;
}) {
  const hasImage = !!category.imageUrl;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group block bg-white rounded-lg overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
        {hasImage ? (
          <img
            src={category.imageUrl!}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-4xl font-serif text-slate-200 group-hover:text-slate-300 transition-colors">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Parent badge */}
        {parentName && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/90 backdrop-blur-sm text-slate-500 shadow-sm">
              {parentName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-800 group-hover:text-slate-600 transition-colors line-clamp-1 mb-1.5">
          {category.name}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1" title={`${category.productCount} products`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span className="text-slate-500">{category.productCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const SUBCATEGORIES_PER_PAGE = 15; // 3 rows x 5 columns on xl screens

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subcategoryPage, setSubcategoryPage] = useState(1);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api<PaginatedResponse<CategoryWithCounts>>('/categories?withCounts=true');
        setCategories(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter((c) => c.parentId);

  // Pagination for subcategories
  const totalSubcategoryPages = Math.ceil(childCategories.length / SUBCATEGORIES_PER_PAGE);
  const paginatedChildCategories = childCategories.slice(
    (subcategoryPage - 1) * SUBCATEGORIES_PER_PAGE,
    subcategoryPage * SUBCATEGORIES_PER_PAGE
  );

  // Create a map for quick parent name lookup
  const parentNameMap = new Map<string, string>();
  parentCategories.forEach((c) => parentNameMap.set(c.id, c.name));

  const totalProducts = parentCategories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100">
        <Container>
          <div className="py-10 md:py-12">
            <div className="max-w-2xl">
              {/* <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Browse
              </p> */}
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-3">
                Categories
              </h1>
              {!isLoading && !error && (
                <p className="text-sm text-slate-500">
                  Explore our collection across {parentCategories.length}{' '}
                  {parentCategories.length === 1 ? 'category' : 'categories'} with {totalProducts}{' '}
                  {totalProducts === 1 ? 'product' : 'products'}
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Error State */}
          {error && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-1">Failed to load categories</p>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-10">
              <div>
                <div className="h-5 bg-slate-200 rounded w-32 mb-5 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CategoryCardSkeleton key={i} size="normal" />
                  ))}
                </div>
              </div>
              <div>
                <div className="h-4 bg-slate-200 rounded w-28 mb-4 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CategoryCardSkeleton key={i} size="small" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && categories.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-1">No categories found</p>
              <p className="text-sm text-slate-400">Check back later for new categories</p>
            </div>
          )}

          {/* Categories */}
          {!isLoading && !error && categories.length > 0 && (
            <div className="space-y-10">
              {/* Parent Categories Section */}
              {parentCategories.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-slate-700 mb-5 flex items-center gap-2">
                    <span>Main Categories</span>
                    <span className="text-slate-400 font-normal">({parentCategories.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {parentCategories.map((category) => (
                      <ParentCategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                </section>
              )}

              {/* Child Categories Section */}
              {childCategories.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span>Subcategories</span>
                    <span className="text-slate-400 font-normal">({childCategories.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {paginatedChildCategories.map((category) => (
                      <ChildCategoryCard
                        key={category.id}
                        category={category}
                        parentName={parentNameMap.get(category.parentId!)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalSubcategoryPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSubcategoryPage((p) => Math.max(1, p - 1))}
                        disabled={subcategoryPage === 1}
                        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalSubcategoryPages }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setSubcategoryPage(page)}
                              className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                                page === subcategoryPage
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setSubcategoryPage((p) => Math.min(totalSubcategoryPages, p + 1))
                        }
                        disabled={subcategoryPage === totalSubcategoryPages}
                        className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
