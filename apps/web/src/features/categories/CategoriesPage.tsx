import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Category, PaginatedResponse } from '@lunaz/types';
import { Container, Card } from '@lunaz/ui';
import { api } from '../../api/client';
import { Skeleton } from '../../components/Skeleton';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api<PaginatedResponse<Category>>('/categories');
        setCategories(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="py-8">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>

        {error && (
          <Card className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-600">No categories found.</p>
          </Card>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group block"
              >
                <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                        <span className="text-4xl text-indigo-600/50">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h2>
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
