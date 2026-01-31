import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import type { Product, Category, PaginatedResponse } from "@lunaz/types";
import { Container, Price } from "@lunaz/ui";
import { api } from "../../api/client";
import { ProductGridSkeleton } from "../../components/Skeleton";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

type SortOption = "newest" | "price-low" | "price-high" | "name";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const categoryId = searchParams.get("category") || "";
  const sort = (searchParams.get("sort") as SortOption) || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    api<PaginatedResponse<Category>>("/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("status", "published");
        params.set("page", page.toString());
        params.set("limit", "12");

        if (categoryId) params.set("category", categoryId);

        switch (sort) {
          case "price-low":
            params.set("sort", "basePrice");
            params.set("order", "asc");
            break;
          case "price-high":
            params.set("sort", "basePrice");
            params.set("order", "desc");
            break;
          case "name":
            params.set("sort", "name");
            params.set("order", "asc");
            break;
          default:
            params.set("sort", "createdAt");
            params.set("order", "desc");
        }

        const res = await api<PaginatedResponse<Product>>(
          `/products?${params.toString()}`
        );
        let filtered = res.data;

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
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
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
    if (!updates.page) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const hasActiveFilters =
    categoryId || minPrice || maxPrice || sort !== "newest";

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      addToast(`Added ${product.name} to cart`, "success");
    }
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      navigate("/cart");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="border-b border-slate-100">
        <Container>
          <div className="py-8 md:py-12">
            <div className="flex items-end justify-between">
              <h1 className="font-serif text-3xl md:text-4xl font-normal text-slate-900 tracking-tight">
                All Products
              </h1>
              {!isLoading && (
                <p className="text-sm text-slate-400">
                  {total} {total === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Filters Bar - Horizontal on desktop */}
          <div className="mb-8 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Category */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => updateParams({ category: e.target.value })}
                  className="text-sm text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:ring-0 py-1 pr-8 cursor-pointer"
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-4 bg-slate-200" />

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    className="w-16 text-sm text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:ring-0 py-1 text-center placeholder:text-slate-300"
                  />
                  <span className="text-slate-300">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    className="w-16 text-sm text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:ring-0 py-1 text-center placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-4 bg-slate-200" />

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="text-sm text-slate-700 bg-transparent border-0 border-b border-slate-200 focus:border-slate-400 focus:ring-0 py-1 pr-8 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <>
                  <div className="hidden sm:block w-px h-4 bg-slate-200" />
                  <button
                    onClick={() => setSearchParams({})}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12 mb-6">
              <p className="text-slate-500">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <ProductGridSkeleton count={12} />}

          {/* Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 mb-4">
                No products match your criteria.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    {/* Rich Media */}
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-300">No image</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      {/* Primary Title */}
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="text-base font-medium text-slate-900 line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Secondary Text - Price */}
                      <p className="text-sm text-slate-500 mb-2">
                        <Price
                          amount={product.basePrice}
                          currency={product.currency}
                          className="text-slate-500"
                        />
                      </p>

                      {/* Supporting Text - Description with Tooltip */}
                      {product.description && (
                        <div className="relative mb-4">
                          <p className="text-sm text-slate-400 line-clamp-2 cursor-help peer">
                            {product.description}
                          </p>
                          {/* Tooltip */}
                          <div className="absolute left-0 right-0 bottom-full mb-2 p-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs leading-relaxed rounded-lg shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-10">
                            {product.description}
                            <div className="absolute bottom-0 left-4 transform translate-y-full">
                              <div className="border-8 border-transparent border-t-slate-900/80"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-stretch gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={(e) => handleBuyNow(e, product)}
                          className="flex-1 py-2.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-10 flex items-center justify-center border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                          aria-label="Add to cart"
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
                              strokeWidth={1.5}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: String(page - 1) })}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          strokeWidth={1.5}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>

                    <span className="text-sm text-slate-400">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => updateParams({ page: String(page + 1) })}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
