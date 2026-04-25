import { useNavigate } from 'react-router-dom';
import type { ProductCardProduct } from '@/ui';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useHomeData } from './hooks/useHomeData';
import { HeroSection } from './components/Hero';
import { CategoriesSection } from './components/CategoriesSection';
import { ProductsSection } from './components/ProductsSection';
import { PromoSection } from './components/PromoSection';

export function HomePage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { groupedCategories, featuredProducts, isLoading, activeParentDefault } = useHomeData();

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
      <HeroSection />
      <CategoriesSection
        groupedCategories={groupedCategories}
        isLoading={isLoading}
        activeParentDefault={activeParentDefault}
      />
      <ProductsSection
        featuredProducts={featuredProducts}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <PromoSection />
    </div>
  );
}
