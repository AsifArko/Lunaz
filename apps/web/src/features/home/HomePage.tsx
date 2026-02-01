import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Category, Product, PaginatedResponse } from '@lunaz/types';
import {
  Container,
  Card,
  Button,
  ProductCard,
  ProductCardSkeleton,
  type ProductCardProduct,
} from '@lunaz/ui';
import { api } from '../../api/client';
import { Skeleton } from '../../components/Skeleton';
import { HeroAnimation } from '../../components/HeroAnimation';
import { PromoAnimation } from '../../components/PromoAnimation';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface GroupedCategory {
  parent: Category;
  children: Category[];
}

export function HomePage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api<PaginatedResponse<Category>>('/categories?limit=50'),
          api<PaginatedResponse<Product>>('/products?status=published&limit=8'),
        ]);

        // Group categories by parent
        const allCategories = catRes.data;
        const parentCategories = allCategories.filter((c) => !c.parentId);
        const grouped: GroupedCategory[] = parentCategories.map((parent) => ({
          parent,
          children: allCategories.filter((c) => c.parentId === parent.id),
        }));

        setGroupedCategories(grouped);
        // Set first parent as active by default
        if (grouped.length > 0) {
          setActiveParent(grouped[0].parent.id);
        }
        setFeaturedProducts(prodRes.data);
      } catch {
        // Silently handle errors, show empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeGroup = groupedCategories.find((g) => g.parent.id === activeParent);

  const scrollSubcategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, cardProduct: ProductCardProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const product = featuredProducts.find((p) => p.id === cardProduct.id);
    if (product && product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      addToast(`Added ${product.name} to cart`, 'success');
    }
  };

  const handleBuyNow = (e: React.MouseEvent, cardProduct: ProductCardProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const product = featuredProducts.find((p) => p.id === cardProduct.id);
    if (product && product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      navigate('/cart');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Animated Background */}
        <HeroAnimation />

        {/* Subtle gradient overlays - Grayscale */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 via-transparent to-gray-500/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30" />

        <Container>
          <div className="relative z-10 py-16 md:py-24 max-w-2xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 animate-pulse" />
              <span className="heading-sub text-white/70">Home Decor & Lifestyle</span>
            </div>

            {/* Main Heading */}
            <h1 className="heading-display text-4xl md:text-6xl text-white mb-6">
              Elevate Your{' '}
              <span className="text-accent bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Living Space
              </span>
            </h1>

            {/* Description */}
            <p className="text-body text-lg text-white/60 mb-10 max-w-xl">
              Discover curated décor pieces and lifestyle essentials that bring sophistication to
              your home.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-slate-400 text-slate-900 hover:bg-slate-300 px-6 font-medium transition-all duration-300"
                >
                  Explore Collection
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 px-6 font-light backdrop-blur-sm transition-all duration-300"
                >
                  Browse Categories
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 pt-6 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-6 md:gap-10 text-white/40 text-xs">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Free Shipping Over $100</span>
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
                  <span>Secure Checkout</span>
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
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-slate-50">
        <Container>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="heading-section text-3xl md:text-5xl text-slate-900">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/categories"
              className="text-slate-600 hover:text-slate-900 text-sm tracking-wide transition-colors flex items-center gap-2 font-medium"
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

          {isLoading ? (
            <div className="space-y-8">
              {/* Parent category tabs skeleton */}
              <div className="flex gap-4">
                <Skeleton className="h-14 w-48 rounded-xl" />
                <Skeleton className="h-14 w-48 rounded-xl" />
              </div>
              {/* Subcategories skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            </div>
          ) : groupedCategories.length > 0 ? (
            <div className="space-y-8">
              {/* Parent Category Tabs */}
              <div className="flex flex-wrap gap-3">
                {groupedCategories.map((group) => (
                  <button
                    key={group.parent.id}
                    onClick={() => setActiveParent(group.parent.id)}
                    className={`group relative flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ${
                      activeParent === group.parent.id
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200'
                    }`}
                  >
                    {/* Category thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {group.parent.imageUrl ? (
                        <img
                          src={group.parent.imageUrl}
                          alt={group.parent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            activeParent === group.parent.id ? 'bg-slate-700' : 'bg-slate-100'
                          }`}
                        >
                          <span
                            className={`text-lg font-light ${
                              activeParent === group.parent.id ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            {group.parent.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-base">{group.parent.name}</h3>
                      <p
                        className={`text-xs ${
                          activeParent === group.parent.id ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {group.children.length}{' '}
                        {group.children.length === 1 ? 'subcategory' : 'subcategories'}
                      </p>
                    </div>
                    {/* Active indicator */}
                    {activeParent === group.parent.id && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
                    )}
                  </button>
                ))}
              </div>

              {/* Subcategories Section */}
              {activeGroup && (
                <div className="relative">
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-slate-500">Browse {activeGroup.parent.name}</p>
                    <div className="flex items-center gap-2">
                      {/* Scroll buttons for desktop */}
                      <button
                        onClick={() => scrollSubcategories('left')}
                        className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        aria-label="Scroll left"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => scrollSubcategories('right')}
                        className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        aria-label="Scroll right"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subcategories horizontal scroll */}
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {/* "View All" card for parent category */}
                    <Link
                      to={`/categories/${activeGroup.parent.slug}`}
                      className="group flex-shrink-0 w-40 md:w-48 snap-start"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                          <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-3 group-hover:border-white/60 group-hover:scale-110 transition-all duration-300">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">View All</span>
                          <span className="text-xs text-white/60 mt-1">
                            {activeGroup.parent.name}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Subcategory cards */}
                    {activeGroup.children.map((category) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.slug}`}
                        className="group flex-shrink-0 w-40 md:w-48 snap-start"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                              <span className="text-4xl text-slate-400/50 font-light">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-medium text-sm md:text-base text-white line-clamp-2">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Scroll indicator for mobile */}
                  <div className="flex justify-center gap-1.5 mt-4 md:hidden">
                    {[activeGroup.parent, ...activeGroup.children].map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === 0 ? 'bg-slate-400' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">Categories coming soon.</p>
            </Card>
          )}
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-10">
        <Container>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="heading-section text-3xl md:text-5xl text-slate-900">
                Featured Products
              </h2>
            </div>
            <Link
              to="/products"
              className="text-slate-600 hover:text-slate-900 text-sm tracking-wide transition-colors flex items-center gap-2 font-medium"
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

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} variant="full" aspectRatio="4:3" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
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
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">Products coming soon.</p>
            </Card>
          )}
        </Container>
      </section>

      {/* Promo Banner */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <PromoAnimation />

        {/* Subtle gradient overlays - Grayscale */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/5 via-transparent to-gray-500/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-slate-900/20" />

        <Container>
          <div className="relative z-10 text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-md bg-white/5 border border-white/10">
              <span className="heading-sub text-white/60">Limited Time</span>
            </div>
            <h2 className="heading-section text-4xl md:text-5xl text-white mb-5">
              Complimentary Shipping
            </h2>
            <p className="text-body text-lg text-white/50 mb-10 max-w-xl">
              Enjoy free delivery on all orders over $100. Experience premium quality delivered
              right to your doorstep.
            </p>
            <Link to="/products">
              <Button className="bg-slate-400 text-slate-900 hover:bg-slate-300 px-8 py-3 font-medium tracking-wide transition-all duration-300">
                Shop Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
