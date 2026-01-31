import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Category, Product, PaginatedResponse } from "@lunaz/types";
import { Container, Card, Button, Price } from "@lunaz/ui";
import { api } from "../../api/client";
import { Skeleton, ProductCardSkeleton } from "../../components/Skeleton";
import { HeroAnimation } from "../../components/HeroAnimation";
import { PromoAnimation } from "../../components/PromoAnimation";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api<PaginatedResponse<Category>>("/categories?limit=4"),
          api<PaginatedResponse<Product>>("/products?status=published&limit=8"),
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data);
      } catch {
        // Silently handle errors, show empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
              <span className="heading-sub text-white/70">
                Home Decor & Lifestyle
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="heading-display text-4xl md:text-6xl text-white mb-6">
              Elevate Your{" "}
              <span className="text-accent bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Living Space
              </span>
            </h1>

            {/* Description */}
            <p className="text-body text-lg text-white/60 mb-10 max-w-xl">
              Discover curated décor pieces and lifestyle essentials that bring
              sophistication to your home.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-6 font-medium transition-all duration-300"
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
              <p className="heading-sub text-slate-500 mb-3">
                Curated Selection
              </p>
              <h2 className="heading-section text-3xl md:text-5xl text-slate-900">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/categories"
              className="text-slate-600 hover:text-slate-900 text-sm tracking-wide transition-colors flex items-center gap-2 font-medium"
            >
              View all
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-6xl text-slate-400/50 font-light">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-serif text-xl md:text-2xl font-medium text-white tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <Card
                    padding="none"
                    className="overflow-hidden hover:shadow-lg transition-shadow h-full"
                  >
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
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-2 tracking-tight">
                        {product.name}
                      </h3>
                      <div className="mt-2">
                        <Price
                          amount={product.basePrice}
                          currency={product.currency}
                          className="text-base font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
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
              Enjoy free delivery on all orders over $100. Experience premium
              quality delivered right to your doorstep.
            </p>
            <Link to="/products">
              <Button className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-8 py-3 font-medium tracking-wide transition-all duration-300">
                Shop Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
