import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product, PaginatedResponse } from '@lunaz/types';
import { Container, Card, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { ProductGridSkeleton } from '../../components/Skeleton';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function search() {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await api<PaginatedResponse<Product>>(
          `/products?search=${encodeURIComponent(query)}&status=published`
        );
        setProducts(res.data);
        setTotal(res.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    }
    search();
  }, [query]);

  return (
    <div className="py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
          {!isLoading && query && (
            <p className="mt-2 text-gray-600">
              {total} {total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {error && (
          <Card className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {isLoading && <ProductGridSkeleton count={8} />}

        {!isLoading && !error && !query && (
          <Card className="text-center py-8">
            <p className="text-gray-600">Enter a search term to find products.</p>
          </Card>
        )}

        {!isLoading && !error && query && products.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-600 mb-4">No products found matching "{query}".</p>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-700">
              Browse all products →
            </Link>
          </Card>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
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
        )}
      </Container>
    </div>
  );
}
