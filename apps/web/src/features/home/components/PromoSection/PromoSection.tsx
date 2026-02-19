import { Link } from 'react-router-dom';
import { Container } from '@/ui';
import { HeroBackground } from '../../../../components/HeroBackground';

export function PromoSection() {
  return (
    <section className="relative overflow-hidden bg-[#fafaf9] py-20 md:py-28 lg:py-32">
      <HeroBackground />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          {/* Decorative accent line */}
          <div
            className="mb-6 h-px w-12 bg-gradient-to-r from-stone-400 to-transparent"
            style={{
              animation: 'promo-fade-up 0.8s ease-out forwards',
            }}
            aria-hidden
          />

          {/* Tag / Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg border border-stone-200/60 bg-white/80 shadow-sm backdrop-blur-sm"
            style={{
              animation: 'promo-stagger-1 0.7s ease-out 0.1s both',
            }}
          >
            <span className="heading-sub text-[0.6875rem] font-medium tracking-[0.2em] text-stone-600">
              Artisan Crafted
            </span>
          </div>

          {/* Main heading */}
          <h2
            className="heading-section mb-6 text-4xl font-medium tracking-[-0.03em] text-stone-900 sm:text-5xl md:text-6xl md:leading-[1.1]"
            style={{
              animation: 'promo-stagger-2 0.7s ease-out 0.2s both',
            }}
          >
            Handmade with Purpose
          </h2>

          {/* Description */}
          <p
            className="font-promo-body mb-10 max-w-xl border-l-2 border-stone-300/70 pl-5 text-sm font-light leading-[1.8] tracking-[0.01em] text-stone-500 md:pl-6 md:text-base md:leading-[1.9]"
            style={{
              animation: 'promo-stagger-3 0.7s ease-out 0.3s both',
            }}
          >
            Each piece is thoughtfully crafted by skilled artisans, blending traditional techniques
            with contemporary design for timeless quality.
          </p>

          {/* CTA Button */}
          <div
            style={{
              animation: 'promo-stagger-3 0.7s ease-out 0.4s both',
            }}
          >
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-stone-800 px-8 py-3.5 font-medium tracking-wide text-white shadow-sm transition-colors duration-200 hover:bg-stone-900 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-[#fafaf9]"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
