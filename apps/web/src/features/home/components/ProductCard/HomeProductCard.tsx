import { Link } from 'react-router-dom';
import { Price } from '@/ui';
import type { ProductCardProduct } from '@/ui';

interface HomeProductCardProps {
  product: ProductCardProduct;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkComponent?: React.ComponentType<any>;
  onAddToCart?: (e: React.MouseEvent, product: ProductCardProduct) => void;
  onBuyNow?: (e: React.MouseEvent, product: ProductCardProduct) => void;
}

export function HomeProductCard({
  product,
  linkComponent,
  onAddToCart,
  onBuyNow,
}: HomeProductCardProps) {
  const LinkComp = linkComponent ?? Link;
  const productUrl = `/products/${product.slug}`;

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-stone-200 transition-all duration-300 flex flex-col h-full font-normal">
      {/* Image */}
      <LinkComp
        to={productUrl}
        className="block relative aspect-[4/3] bg-stone-100 overflow-hidden"
      >
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-stone-300 text-sm">No image</span>
          </div>
        )}
      </LinkComp>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <LinkComp to={productUrl}>
          <h3 className="font-normal text-sm sm:text-base text-stone-900 line-clamp-2 leading-snug hover:text-stone-700 transition-colors mb-2">
            {product.name}
          </h3>
        </LinkComp>

        {product.description && (
          <p
            className="text-xs text-stone-400 line-clamp-3 mb-3 min-h-0 overflow-hidden"
            title={product.description}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-stone-100">
          <Price
            amount={product.basePrice}
            currency={product.currency}
            className="text-sm font-normal text-stone-900"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuyNow?.(e, product);
              }}
              className="py-2 px-3 text-xs font-normal text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
            >
              {product.variants[0]?.stock === 0 ? 'Pre-order' : 'Buy Now'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(e, product);
              }}
              className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
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
      </div>
    </article>
  );
}
