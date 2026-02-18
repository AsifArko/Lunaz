import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import type { Product, Category, PaginatedResponse } from 'types';
import { Container, ProductCard, ProductCardSkeleton, type ProductCardProduct } from '@/ui';
import { api } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

interface GroupedCategory {
  parent: Category;
  children: Category[];
}

// Debounce hook for price inputs
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom dropdown component for better styling
function FilterDropdown({
  label,
  value,
  children,
  className = '',
}: {
  label: string;
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
      >
        <span className="text-slate-500">{label}:</span>
        <span className="text-slate-900 font-medium">{value || 'All'}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 max-h-72 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  selected,
  onClick,
  children,
  indent = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${indent ? 'pl-7' : ''} ${
        selected
          ? 'bg-slate-100 text-slate-900 font-medium'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-2">
        {selected && (
          <svg
            className="w-4 h-4 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className={selected ? '' : 'ml-6'}>{children}</span>
      </div>
    </button>
  );
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for price inputs (to enable debouncing)
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  // URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categoryId = searchParams.get('category') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Debounced price values
  const debouncedMinPrice = useDebounce(minPriceInput, 500);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 500);

  // Sync URL params to local state on mount and when URL changes
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  // Update URL when debounced values change
  useEffect(() => {
    if (debouncedMinPrice !== minPrice || debouncedMaxPrice !== maxPrice) {
      const newParams = new URLSearchParams(searchParams);

      if (debouncedMinPrice) {
        newParams.set('minPrice', debouncedMinPrice);
      } else {
        newParams.delete('minPrice');
      }

      if (debouncedMaxPrice) {
        newParams.set('maxPrice', debouncedMaxPrice);
      } else {
        newParams.delete('maxPrice');
      }

      newParams.set('page', '1'); // Reset to page 1 when filters change
      setSearchParams(newParams);
    }
    // searchParams and setSearchParams are stable from useSearchParams hook
    // minPrice/maxPrice raw values excluded since we use debounced versions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // Fetch and organize categories
  useEffect(() => {
    api<PaginatedResponse<Category>>('/categories?limit=100').then((res) => {
      const allCategories = res.data;
      setCategories(allCategories);

      // Group categories by parent
      const parentCategories = allCategories.filter((c) => !c.parentId);
      const grouped: GroupedCategory[] = parentCategories.map((parent) => ({
        parent,
        children: allCategories.filter((c) => c.parentId === parent.id),
      }));
      setGroupedCategories(grouped);
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('status', 'published');
        params.set('page', page.toString());
        params.set('limit', '12');

        if (categoryId) params.set('category', categoryId);

        // Price range filters
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);

        // Sorting
        switch (sort) {
          case 'price-low':
            params.set('sort', 'basePrice');
            params.set('order', 'asc');
            break;
          case 'price-high':
            params.set('sort', 'basePrice');
            params.set('order', 'desc');
            break;
          case 'name':
            params.set('sort', 'name');
            params.set('order', 'asc');
            break;
          default:
            params.set('sort', 'createdAt');
            params.set('order', 'desc');
        }

        const res = await api<PaginatedResponse<Product>>(`/products?${params.toString()}`);

        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
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
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const hasActiveFilters = categoryId || minPrice || maxPrice || sort !== 'newest';

  const clearFilters = useCallback(() => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  }, [setSearchParams]);

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    if (!categoryId) return 'All';
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || 'All';
  };

  // Get sort label for display
  const getSortLabel = () => {
    switch (sort) {
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'name':
        return 'Name A-Z';
      default:
        return 'Newest';
    }
  };

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
                  {total} {total === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8">
          {/* Filters Bar */}
          <div className="mb-8 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <FilterDropdown label="Category" value={getSelectedCategoryName()}>
                <DropdownItem
                  selected={categoryId === ''}
                  onClick={() => updateParams({ category: '' })}
                >
                  All Categories
                </DropdownItem>
                <div className="h-px bg-slate-100 my-1" />
                {groupedCategories.map((group) => (
                  <div key={group.parent.id}>
                    {/* Parent Category */}
                    <DropdownItem
                      selected={categoryId === group.parent.id}
                      onClick={() => updateParams({ category: group.parent.id })}
                    >
                      <span className="font-medium">{group.parent.name}</span>
                    </DropdownItem>
                    {/* Child Categories */}
                    {group.children.map((child) => (
                      <DropdownItem
                        key={child.id}
                        selected={categoryId === child.id}
                        onClick={() => updateParams({ category: child.id })}
                        indent
                      >
                        <span className="text-slate-500">{child.name}</span>
                      </DropdownItem>
                    ))}
                  </div>
                ))}
              </FilterDropdown>

              {/* Price Range Filter */}
              <div className="flex items-center gap-2 h-[38px] px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
                <span className="text-sm text-slate-500">Price:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="$ Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    min="0"
                    className="w-14 h-5 text-sm text-slate-900 bg-transparent border-0 focus:outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-slate-300 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="$ Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    min="0"
                    className="w-14 h-5 text-sm text-slate-900 bg-transparent border-0 focus:outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <FilterDropdown label="Sort" value={getSortLabel()}>
                <DropdownItem
                  selected={sort === 'newest'}
                  onClick={() => updateParams({ sort: 'newest' })}
                >
                  Newest
                </DropdownItem>
                <DropdownItem
                  selected={sort === 'price-low'}
                  onClick={() => updateParams({ sort: 'price-low' })}
                >
                  Price: Low to High
                </DropdownItem>
                <DropdownItem
                  selected={sort === 'price-high'}
                  onClick={() => updateParams({ sort: 'price-high' })}
                >
                  Price: High to Low
                </DropdownItem>
                <DropdownItem
                  selected={sort === 'name'}
                  onClick={() => updateParams({ sort: 'name' })}
                >
                  Name A-Z
                </DropdownItem>
              </FilterDropdown>

              {/* Active Filters Count & Clear */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear filters
                </button>
              )}
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {categoryId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                    {getSelectedCategoryName()}
                    <button
                      onClick={() => updateParams({ category: '' })}
                      className="text-slate-400 hover:text-slate-600"
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
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                    ${minPrice || '0'} — ${maxPrice || '∞'}
                    <button
                      onClick={() => {
                        setMinPriceInput('');
                        setMaxPriceInput('');
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('minPrice');
                        newParams.delete('maxPrice');
                        setSearchParams(newParams);
                      }}
                      className="text-slate-400 hover:text-slate-600"
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
                    </button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                    {getSortLabel()}
                    <button
                      onClick={() => updateParams({ sort: '' })}
                      className="text-slate-400 hover:text-slate-600"
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
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12 mb-6">
              <p className="text-slate-500">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} variant="full" aspectRatio="4:3" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 mb-4">No products match your criteria.</p>
              <button
                onClick={clearFilters}
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
