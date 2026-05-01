import { Link } from 'react-router-dom';
import { HeroBackground } from '../../../../components/HeroBackground';

export function HeroSection() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[65vh] flex items-center overflow-hidden bg-[#fafaf9]">
      <HeroBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl py-16 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg bg-white/80 border border-stone-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-stone-600">
              Home Decor & Lifestyle
            </span>
          </div>

          <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] text-stone-900 leading-[1.12] tracking-tight mb-6">
            Elevate Your <span className="italic font-light text-stone-600">Living Space</span>
          </h1>

          <p className="font-promo-body mb-10 max-w-lg border-l-2 border-stone-300/70 pl-5 text-sm font-light leading-[1.8] tracking-[0.01em] text-stone-500 md:pl-6 md:text-base md:leading-[1.9]">
            Discover curated décor pieces and lifestyle essentials that bring sophistication to your
            home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors duration-200"
            >
              Explore Collection
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 hover:border-stone-400 rounded-lg transition-colors duration-200"
            >
              Browse Categories
            </Link>
          </div>

          <div className="mt-14 pt-8 border-t border-stone-200/60 flex gap-10 text-[10px] font-light tracking-[0.12em] uppercase text-stone-400">
            <span>Secure Checkout</span>
            <span>30-Day Returns</span>
          </div>
        </div>
      </div>
    </section>
  );
}
