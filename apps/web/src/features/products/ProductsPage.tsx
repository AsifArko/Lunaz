import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Product, Category, PaginatedResponse } from '@lunaz/types';
import { Container, Card, Button, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { ProductGridSkeleton } from '../../components/Skeleton';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categoryId = searchParams.get('category') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    api<PaginatedResponse<Category>>('/categories').then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('status', 'published');
        params.set('page', page.toString());
        params.set('limit', '12');

        if (categoryId) params.set('category', categoryId);

        // Sort mapping
        switch (sort) {
          case 'price-low':
            params.set('sort', 'basePrice');
            params.set('order', 'asc');
            break;
          case 'price-high':
            params.set('sort', 'basePrice');
            params.set('order', 'desc');
            break;
          case 'name':
            params.set('sort', 'name');
            params.set('order', 'asc');
            break;
          default:
            params.set('sort', 'createdAt');
            params.set('order', 'desc');
        }

        const res = await api<PaginatedResponse<Product>>(`/products?${params.toString()}`);
        let filtered = res.data;

        // Client-side price filtering (if backend doesn't support it)
        if (minPrice) {
          const min = parseFloat(minPrice);
          filtered = filtered.filter((p) => p.basePrice >= min);
        }
        if (maxPrice) {
          const max = parseFloat(maxPrice);
          filtered = filtered.filter((p) => p.basePrice <= max);
        }

        setProducts(filtered);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [page, categoryId, sort, minPrice, maxPrice]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="py-8">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => updateParams({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(categoryId || minPrice || maxPrice || sort !== 'newest') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setSearchParams({})}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
              {!isLoading && (
                <p className="text-gray-600">
                  {total} {total === 1 ? 'product' : 'products'}
                </p>
              )}
            </div>

            {error && (
              <Card className="text-center py-8 mb-6">
                <p className="text-red-600">{error}</p>
              </Card>
            )}

            {isLoading && <ProductGridSkeleton count={12} />}

            {!isLoading && !error && products.length === 0 && (
              <Card className="text-center py-12">
                <p className="text-gray-600 mb-4">No products found.</p>
                <Button variant="outline" onClick={() => setSearchParams({})}>
                  Clear Filters
                </Button>
              </Card>
            )}

            {!isLoading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link key={product.id} to={`/products/${product.slug}`} className="group">
                      <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          {product.variants.length > 1 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {product.variants.length} variants
                            </p>
                          )}
                          <div className="mt-2">
                            <Price
                              amount={product.basePrice}
                              currency={product.currency}
                              className="text-lg font-semibold text-gray-900"
                            />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: String(page - 1) })}
                    >
                      Previous
                    </Button>
                    <span className="px-4 text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => updateParams({ page: String(page + 1) })}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
