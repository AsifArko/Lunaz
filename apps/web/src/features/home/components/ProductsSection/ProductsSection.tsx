import { Link } from 'react-router-dom';
import { Container, Card, type ProductCardProduct } from '@/ui';
import type { Product } from 'types';
import { HomeProductCard, HomeProductCardSkeleton } from '../ProductCard';

interface ProductsSectionProps {
  featuredProducts: Product[];
  isLoading: boolean;
  onAddToCart: (e: React.MouseEvent, cardProduct: ProductCardProduct) => void;
  onBuyNow: (e: React.MouseEvent, cardProduct: ProductCardProduct) => void;
}

export function ProductsSection({
  featuredProducts,
  isLoading,
  onAddToCart,
  onBuyNow,
}: ProductsSectionProps) {
  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
            <div className="h-10 w-48 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-5 w-24 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <HomeProductCardSkeleton key={i} />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="py-12 md:py-16 lg:py-20">
        <Container>
          <Card className="text-center py-12 rounded-2xl border-stone-200/80 bg-white/80 backdrop-blur-sm">
            <p className="text-stone-500">Products coming soon.</p>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
          <h2 className="heading-section text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-stone-900">
            Featured Products
          </h2>
          <Link
            to="/products"
            className="text-stone-500 hover:text-stone-900 text-sm tracking-wide transition-colors duration-300 flex items-center gap-2 font-medium w-fit"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <HomeProductCard
              key={product.id}
              product={product}
              linkComponent={Link}
              onBuyNow={onBuyNow}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        <div className="flex justify-end mt-8 md:mt-12">
          <Link
            to="/products"
            className="text-stone-500 hover:text-stone-900 text-sm tracking-wide transition-colors duration-300 flex items-center gap-2 font-medium"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
