import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Category, Product, PaginatedResponse } from '@lunaz/types';
import {
  Container,
  Card,
  ProductCard,
  ProductCardSkeleton,
  type ProductCardProduct,
} from '@lunaz/ui';
import { api } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

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

  const handleAddToCart = (e: React.MouseEvent, cardProduct: ProductCardProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const product = products.find((p) => p.id === cardProduct.id);
    if (product && product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      addToast(`Added ${product.name} to cart`, 'success');
    }
  };

  const handleBuyNow = (e: React.MouseEvent, cardProduct: ProductCardProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const product = products.find((p) => p.id === cardProduct.id);
    if (product && product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      navigate('/cart');
    }
  };

  if (error) {
    return (
      <div className="py-8">
        <Container>
          <Card className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              to="/categories"
              className="text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
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
              <Link to="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/categories" className="hover:text-gray-700">
                Categories
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{category?.name || 'Loading...'}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{category?.name || 'Loading...'}</h1>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} variant="full" aspectRatio="4:3" />
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-slate-600">No products found in this category.</p>
            <Link
              to="/products"
              className="mt-4 inline-block text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
              Browse all products →
            </Link>
          </Card>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="full"
                aspectRatio="4:3"
                linkComponent={Link}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
