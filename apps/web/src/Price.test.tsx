/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Price, getProductPrice } from '@/ui';
import type { Product } from 'types';

describe('Price', () => {
  it('formats amount with currency symbol', () => {
    render(<Price amount={1500} />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it('handles zero', () => {
    render(<Price amount={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

describe('getProductPrice', () => {
  const product: Product = {
    id: '1',
    name: 'Test',
    slug: 'test',
    description: '',
    categoryId: 'cat1',
    status: 'published',
    basePrice: 100,
    currency: 'BDT',
    variants: [
      { id: 'v1', name: 'Small', priceOverride: 80 },
      { id: 'v2', name: 'Large', priceOverride: 120 },
    ],
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('returns base price when no variant', () => {
    expect(getProductPrice(product)).toBe(100);
  });

  it('returns variant price when variantId matches', () => {
    expect(getProductPrice(product, 'v1')).toBe(80);
    expect(getProductPrice(product, 'v2')).toBe(120);
  });

  it('returns base price for unknown variant', () => {
    expect(getProductPrice(product, 'unknown')).toBe(100);
  });
});
