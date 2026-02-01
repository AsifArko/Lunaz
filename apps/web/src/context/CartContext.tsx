import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Product, ProductVariant, CartResponse } from '@lunaz/types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

/** Local cart item with product snapshot for display. */
export interface LocalCartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  // Product snapshot for display
  product: {
    name: string;
    slug: string;
    basePrice: number;
    currency: string;
    images: { url: string }[];
  };
  variant: {
    name: string;
    priceOverride?: number;
  };
}

interface CartContextValue {
  items: LocalCartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  currency: string;
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'lunaz_cart';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasSyncedRef = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist cart to localStorage and sync to backend whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));

      // Sync to backend if authenticated
      if (isAuthenticated && token && hasSyncedRef.current) {
        const cartItems = items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        }));
        api('/cart', {
          method: 'PUT',
          body: JSON.stringify({ items: cartItems }),
          token,
        }).catch(() => {
          // Silently fail - local cart is still saved
        });
      }
    }
  }, [items, isLoading, isAuthenticated, token]);

  // Sync cart with backend when user logs in
  useEffect(() => {
    if (!isAuthenticated || !token || hasSyncedRef.current) return;

    async function syncCart() {
      hasSyncedRef.current = true;
      setIsLoading(true);

      try {
        // First, fetch existing cart from backend
        const backendCart = await api<CartResponse>('/cart', { token: token || undefined });

        // Get current local items
        const localItems = [...items];

        if (backendCart.items && backendCart.items.length > 0) {
          // Merge backend cart with local cart
          const mergedItems: LocalCartItem[] = [];
          const processedKeys = new Set<string>();

          // Add backend items first
          for (const item of backendCart.items) {
            const key = `${item.productId}-${item.variantId}`;
            processedKeys.add(key);

            // Find matching local item to get more quantity if any
            const localMatch = localItems.find(
              (l) => l.productId === item.productId && l.variantId === item.variantId
            );

            mergedItems.push({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: localMatch ? item.quantity + localMatch.quantity : item.quantity,
              product: {
                name: item.product.name,
                slug: item.product.slug,
                basePrice: item.product.basePrice,
                currency: item.product.currency,
                images: item.product.images?.slice(0, 1) || [],
              },
              variant: {
                name: item.variantName,
                priceOverride:
                  item.unitPrice !== item.product.basePrice ? item.unitPrice : undefined,
              },
            });
          }

          // Add local items that aren't in backend
          for (const localItem of localItems) {
            const key = `${localItem.productId}-${localItem.variantId}`;
            if (!processedKeys.has(key)) {
              mergedItems.push(localItem);
            }
          }

          setItems(mergedItems);

          // Sync merged cart back to backend if we added local items
          if (localItems.some((l) => !processedKeys.has(`${l.productId}-${l.variantId}`))) {
            const cartItems = mergedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            }));
            await api('/cart', {
              method: 'PUT',
              body: JSON.stringify({ items: cartItems }),
              token: token || undefined,
            }).catch(() => {});
          }
        } else if (localItems.length > 0) {
          // No backend cart, but have local items - sync to backend
          const cartItems = localItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }));
          await api('/cart', {
            method: 'PUT',
            body: JSON.stringify({ items: cartItems }),
            token: token || undefined,
          }).catch(() => {});
        }
      } catch (err) {
        // If backend fetch fails, just keep local cart
        console.warn('Failed to sync cart with backend:', err);
      } finally {
        setIsLoading(false);
      }
    }

    syncCart();
  }, [isAuthenticated, token]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated]);

  const addItem = useCallback((product: Product, variant: ProductVariant, quantity: number) => {
    setItems((prev) => {
      // Check if item with same product and variant exists
      const existing = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const newItem: LocalCartItem = {
        id: generateId(),
        productId: product.id,
        variantId: variant.id,
        quantity,
        product: {
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          currency: product.currency,
          images: product.images.slice(0, 1),
        },
        variant: {
          name: variant.name,
          priceOverride: variant.priceOverride,
        },
      };

      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
    }
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.priceOverride ?? item.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const currency = items[0]?.product.currency ?? 'USD';

  const value: CartContextValue = {
    items,
    isLoading,
    itemCount,
    subtotal,
    currency,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
