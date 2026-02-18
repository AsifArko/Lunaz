import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product, ProductVariant } from 'types';
import { Container, Card, Button, Price, getProductPrice } from '@/ui';
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

  const currentPrice = product ? getProductPrice(product, selectedVariant?.id) : 0;

  const stockStatus = selectedVariant?.stock;
  const isOutOfStock = stockStatus === 0;
  const isLowStock = stockStatus !== undefined && stockStatus > 0 && stockStatus <= 5;

  if (isLoading) {
    return (
      <div className="py-12 bg-white min-h-screen">
        <Container>
          <ProductDetailSkeleton />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12 bg-white min-h-screen">
        <Container>
          <Card className="text-center py-16">
            <p className="text-slate-600 mb-6">{error || 'Product not found'}</p>
            <Link
              to="/products"
              className="text-slate-900 hover:text-slate-600 font-medium transition-colors"
            >
              ← Back to products
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <Container>
          <nav className="py-4">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-slate-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li>
                <Link to="/products" className="hover:text-slate-600 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-slate-700 truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-slate-50 rounded-sm overflow-hidden">
                {product.images[selectedImageIndex] ? (
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-slate-300 font-serif text-xl italic">No image</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 w-16 h-16 rounded-sm overflow-hidden transition-all duration-200 ${
                        index === selectedImageIndex
                          ? 'ring-1 ring-slate-900 ring-offset-1'
                          : 'opacity-50 hover:opacity-100'
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
            <div className="lg:py-4">
              {/* Category Tag */}
              <p className="heading-sub text-slate-400 mb-4">Premium Collection</p>

              {/* Product Name & Stock Status */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <span
                  className={`shrink-0 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isOutOfStock
                      ? 'bg-red-50 text-red-600'
                      : isLowStock
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {isOutOfStock
                    ? 'Out of Stock'
                    : isLowStock
                      ? `Only ${stockStatus} left`
                      : 'In Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <Price
                  amount={currentPrice}
                  currency={product.currency}
                  className="text-2xl font-light text-slate-900 tracking-wide"
                />
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Variants & Quantity Row */}
              <div className="flex flex-wrap items-end gap-6 mb-6">
                {/* Variants */}
                {product.variants.length > 0 && (
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-xs font-medium text-slate-500 tracking-wider mb-2 block">
                      Variant
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variant.stock === 0}
                          className={`min-w-[2.5rem] px-2.5 py-1 text-xs font-medium rounded-sm transition-all duration-200 ${
                            selectedVariant?.id === variant.id
                              ? 'bg-slate-700 text-white'
                              : variant.stock === 0
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Qty
                  </label>
                  <div className="inline-flex items-center border border-slate-200">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      disabled={isOutOfStock}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      disabled={isOutOfStock}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="mb-6">
                <Button
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedVariant}
                  className="bg-slate-700 hover:bg-slate-600 text-white !py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* Product Features - Compact horizontal */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  <span>Free Shipping $100+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
