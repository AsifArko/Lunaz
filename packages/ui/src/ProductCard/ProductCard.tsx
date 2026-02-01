import React from 'react';
import { Price } from '../Price/Price.js';

/** Product data needed for the card */
export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  currency: string;
  images: Array<{ id: string; url: string; order: number }>;
  variants: Array<{ id: string; name: string }>;
}

export interface ProductCardProps {
  /** Product data to display */
  product: ProductCardProduct;
  /** Card variant - 'full' shows description and actions, 'compact' is simpler */
  variant?: 'full' | 'compact';
  /** Image aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '3:4';
  /** Link component to use (e.g., react-router's Link). Must accept 'to', 'className', and 'children' props */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkComponent?: React.ComponentType<any>;
  /** Called when Buy Now is clicked (only for 'full' variant) */
  onBuyNow?: (e: React.MouseEvent, product: ProductCardProduct) => void;
  /** Called when Add to Cart is clicked (only for 'full' variant) */
  onAddToCart?: (e: React.MouseEvent, product: ProductCardProduct) => void;
  /** Additional class names */
  className?: string;
}

/** Default anchor link component */
const DefaultLink: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({
  to,
  className,
  children,
}) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
};

/**
 * ProductCard - A reusable product card component for displaying products
 * in grids across the application.
 */
export function ProductCard({
  product,
  variant = 'full',
  aspectRatio = '4:3',
  linkComponent: Link = DefaultLink,
  onBuyNow,
  onAddToCart,
  className = '',
}: ProductCardProps) {
  const productUrl = `/products/${product.slug}`;

  if (variant === 'compact') {
    return (
      <Link to={productUrl} className={`group block ${className}`}>
        <article className="overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
          {/* Image */}
          <div className={`${aspectRatioClasses[aspectRatio]} bg-slate-100 overflow-hidden`}>
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-300">No image</span>
              </div>
            )}
          </div>
          {/* Content */}
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
        </article>
      </Link>
    );
  }

  // Full variant with description and actions
  return (
    <article
      className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col ${className}`}
    >
      {/* Image */}
      <Link to={productUrl} className="block">
        <div className={`${aspectRatioClasses[aspectRatio]} bg-slate-100 overflow-hidden`}>
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
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <Link to={productUrl}>
          <h3 className="text-base font-medium text-slate-900 line-clamp-1 mb-1 hover:text-slate-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-sm text-slate-500 mb-2">
          <Price
            amount={product.basePrice}
            currency={product.currency}
            className="text-slate-500"
          />
        </p>

        {/* Description with Tooltip */}
        <div className="relative mb-4 min-h-[2.5rem]">
          {product.description && (
            <>
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
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-stretch gap-2 pt-3 border-t border-slate-100 mt-auto">
          <button
            onClick={(e) => onBuyNow?.(e, product)}
            className="flex-1 py-2.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Buy Now
          </button>
          <button
            onClick={(e) => onAddToCart?.(e, product)}
            className="w-10 flex items-center justify-center border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
            aria-label="Add to cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}

/** Skeleton loader for ProductCard */
export function ProductCardSkeleton({
  variant = 'full',
  aspectRatio = '4:3',
}: {
  variant?: 'full' | 'compact';
  aspectRatio?: '1:1' | '4:3' | '3:4';
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className={`${aspectRatioClasses[aspectRatio]} bg-slate-200`} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        {variant === 'full' && (
          <>
            <div className="h-10 bg-slate-100 rounded" />
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <div className="flex-1 h-10 bg-slate-200 rounded" />
              <div className="w-10 h-10 bg-slate-200 rounded" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
