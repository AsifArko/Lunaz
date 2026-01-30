import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product, ProductVariant } from '@lunaz/types';
import { Container, Card, Button, Price, getProductPrice } from '@lunaz/ui';
import { api } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductDetailSkeleton } from '../../components/Skeleton';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        // Fetch product directly by slug
        const found = await api<Product>(`/products/${slug}`);

        if (!found || found.status !== 'published') {
          setError('Product not found');
          setIsLoading(false);
          return;
        }

        setProduct(found);
        if (found.variants.length > 0) {
          setSelectedVariant(found.variants[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem(product, selectedVariant, quantity);
    addToast(`Added ${product.name} to cart`, 'success');
    setQuantity(1);
  };

  const currentPrice = product
    ? getProductPrice(product, selectedVariant?.id)
    : 0;

  const stockStatus = selectedVariant?.stock;
  const isOutOfStock = stockStatus === 0;
  const isLowStock = stockStatus !== undefined && stockStatus > 0 && stockStatus <= 5;

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <ProductDetailSkeleton />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-8">
        <Container>
          <Card className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-700">
              ← Back to products
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
              <Link to="/products" className="hover:text-gray-700">Products</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? 'border-indigo-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <Price
                amount={currentPrice}
                currency={product.currency}
                className="text-3xl font-bold text-gray-900"
              />
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                  Low stock — only {stockStatus} left
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  In stock
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size / Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.name}
                      {variant.stock === 0 && ' (Out of stock)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={isOutOfStock}
                >
                  −
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedVariant}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
