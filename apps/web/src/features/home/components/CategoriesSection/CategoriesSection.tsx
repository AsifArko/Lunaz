import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Skeleton } from '@/ui';
import type { GroupedCategory } from '../../hooks/useHomeData';

interface CategoriesSectionProps {
  groupedCategories: GroupedCategory[];
  isLoading: boolean;
  activeParentDefault: string | null;
}

export function CategoriesSection({
  groupedCategories,
  isLoading,
  activeParentDefault,
}: CategoriesSectionProps) {
  const [activeParent, setActiveParent] = useState<string | null>(activeParentDefault);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeParentDefault) {
      setActiveParent(activeParentDefault);
    }
  }, [activeParentDefault]);

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

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-stone-50 px-5 sm:px-0">
        <Container className="sm:!px-6 lg:!px-8 !px-0">
          <div className="space-y-8">
            <div className="flex gap-4 overflow-hidden">
              <Skeleton className="h-14 w-40 sm:w-48 rounded-xl flex-shrink-0" />
              <Skeleton className="h-14 w-40 sm:w-48 rounded-xl flex-shrink-0" />
              <Skeleton className="h-14 w-48 rounded-xl flex-shrink-0 hidden md:block" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (groupedCategories.length === 0) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-stone-50 px-5 sm:px-0">
        <Container className="sm:!px-6 lg:!px-8 !px-0">
          <Card className="text-center py-12 rounded-2xl border-stone-200/80 bg-white/80 backdrop-blur-sm">
            <p className="text-stone-500">Categories coming soon.</p>
          </Card>
        </Container>
      </section>
    );
  }

  const sortedGroups = [...groupedCategories].sort((a, b) => b.children.length - a.children.length);

  return (
    <section className="py-12 md:py-16  bg-stone-50 px-5 sm:px-0">
      <Container className="sm:!px-6 lg:!px-8 !px-0">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12">
          <h2 className="heading-section text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-stone-900">
            Shop by Category
          </h2>
          <Link
            to="/categories"
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

        <div className="space-y-5">
          {/* Parent category tabs — horizontal scroll on mobile */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide pr-5 sm:pr-0 sm:flex-wrap">
            {sortedGroups.map((group) => (
              <button
                key={group.parent.id}
                onClick={() => setActiveParent(group.parent.id)}
                className={`group relative flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 rounded-xl transition-all duration-300 flex-shrink-0 snap-start min-w-[140px] sm:min-w-0 ${
                  activeParent === group.parent.id
                    ? 'bg-stone-900 text-white shadow-lg'
                    : 'bg-white/90 text-stone-700 hover:bg-stone-100 shadow-sm border border-stone-200/80 backdrop-blur-sm'
                }`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {group.parent.imageUrl ? (
                    <img
                      src={group.parent.imageUrl}
                      alt={group.parent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        activeParent === group.parent.id ? 'bg-stone-700' : 'bg-stone-100'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-light text-stone-400">
                        {group.parent.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">{group.parent.name}</h3>
                  <p
                    className={`text-xs truncate ${
                      activeParent === group.parent.id ? 'text-stone-400' : 'text-stone-500'
                    }`}
                  >
                    {group.children.length}{' '}
                    {group.children.length === 1 ? 'subcategory' : 'subcategories'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {activeGroup && (
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div></div>
                {/* <p className="text-sm text-stone-500">Browse {activeGroup.parent.name}</p> */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => scrollSubcategories('left')}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300"
                    aria-label="Scroll left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300"
                    aria-label="Scroll right"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory pr-5 sm:pr-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <Link
                  to={`/categories/${activeGroup.parent.slug}`}
                  className="group flex-shrink-0 w-[140px] sm:w-40 md:w-48 snap-start"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-5 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-3 group-hover:border-white/60 transition-all duration-300">
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
                      <span className="text-xs text-white/60 mt-1">{activeGroup.parent.name}</span>
                    </div>
                  </div>
                </Link>

                {activeGroup.children.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="group flex-shrink-0 w-[140px] sm:w-40 md:w-48 snap-start"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                          <span className="text-3xl sm:text-4xl text-stone-400/50 font-light">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-medium text-sm sm:text-base text-white line-clamp-2">
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
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      idx === 0 ? 'bg-stone-400' : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
