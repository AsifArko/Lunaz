import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Category, Product, PaginatedResponse } from '@lunaz/types';
import { Container, Card, Price } from '@lunaz/ui';
import { api } from '../../api/client';
import { ProductGridSkeleton } from '../../components/Skeleton';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        // Get category directly by slug
        const cat = await api<Category>(`/categories/${slug}`);

        if (!cat) {
          setError('Category not found');
          setIsLoading(false);
          return;
        }

        setCategory(cat);

        // Fetch products in this category
        const productsRes = await api<PaginatedResponse<Product>>(
          `/products?category=${cat.id}&status=published`
        );
        setProducts(productsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <Card className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-700">
              ← Back to categories
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/categories" className="hover:text-gray-700">Categories</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{category?.name || 'Loading...'}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {category?.name || 'Loading...'}
        </h1>

        {isLoading && <ProductGridSkeleton count={8} />}

        {!isLoading && products.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-600">No products found in this category.</p>
            <Link to="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
              Browse all products →
            </Link>
          </Card>
        )}

        {!isLoading && products.length > 0 && (
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
